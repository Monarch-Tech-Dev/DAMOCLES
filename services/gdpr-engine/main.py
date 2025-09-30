from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio
import aiohttp
import asyncpg
import redis.asyncio as redis
import os
from dotenv import load_dotenv
import logging

from models.gdpr import GDPRRequest, GDPRRequestCreate, GDPRResponse
from models.creditor import Creditor
from models.user import User
from services.gdpr_engine import GDPREngine
from services.email_service import EmailService
from services.violation_detector import ViolationDetector
from database import Database

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DAMOCLES GDPR Engine",
    description="Automated GDPR request generation and violation detection",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
db = Database()
gdpr_engine = GDPREngine(db)
email_service = EmailService()
violation_detector = ViolationDetector()

@app.on_event("startup")
async def startup():
    await db.connect()
    logger.info("GDPR Engine started successfully")

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()
    logger.info("GDPR Engine shutdown completed")

# Health check
@app.get("/health")
async def health_check():
    try:
        await db.check_connection()
        return {"status": "healthy", "service": "gdpr-engine"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )

# Generate GDPR request
@app.post("/gdpr/generate", response_model=Dict[str, Any])
async def generate_gdpr_request(
    request: GDPRRequestCreate,
    background_tasks: BackgroundTasks
):
    try:
        # Get user and creditor data
        user = await db.get_user(request.user_id)
        creditor = await db.get_creditor(request.creditor_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if not creditor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Creditor not found"
            )
        
        # Generate GDPR request
        gdpr_request = await gdpr_engine.generate_gdpr_request(user, creditor)
        
        return {
            "request_id": gdpr_request.id,
            "status": "generated",
            "content_preview": gdpr_request.content[:200] + "..."
        }
        
    except Exception as e:
        logger.error(f"Error generating GDPR request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate GDPR request"
        )

# Send GDPR request
@app.post("/gdpr/send/{request_id}")
async def send_gdpr_request(
    request_id: str,
    background_tasks: BackgroundTasks
):
    try:
        gdpr_request = await db.get_gdpr_request(request_id)
        
        if not gdpr_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="GDPR request not found"
            )
        
        if gdpr_request.status != "PENDING":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Request already sent"
            )
        
        # Send request in background
        background_tasks.add_task(
            gdpr_engine.send_gdpr_request,
            gdpr_request,
            background_tasks
        )
        
        return {
            "status": "sending",
            "response_due": gdpr_request.response_due
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending GDPR request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send GDPR request"
        )

# Process GDPR response
@app.post("/gdpr/response/{request_id}")
async def process_gdpr_response(
    request_id: str,
    response_data: Dict[str, Any],
    background_tasks: BackgroundTasks
):
    try:
        gdpr_request = await db.get_gdpr_request(request_id)
        
        if not gdpr_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="GDPR request not found"
            )
        
        # Process response in background
        background_tasks.add_task(
            gdpr_engine.process_gdpr_response,
            request_id,
            response_data.get("content", b""),
            response_data.get("format", "text")
        )
        
        return {"status": "processing"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing GDPR response: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process GDPR response"
        )

# Get GDPR requests for user
@app.get("/gdpr/requests/{user_id}")
async def get_user_gdpr_requests(
    user_id: str,
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    try:
        requests = await db.get_user_gdpr_requests(
            user_id=user_id,
            status=status,
            limit=limit,
            offset=offset
        )
        
        return {"requests": requests}
        
    except Exception as e:
        logger.error(f"Error fetching GDPR requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch GDPR requests"
        )

# Get violations for user
@app.get("/violations/{user_id}")
async def get_user_violations(
    user_id: str,
    severity: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    try:
        violations = await db.get_user_violations(
            user_id=user_id,
            severity=severity,
            limit=limit,
            offset=offset
        )
        
        return {"violations": violations}
        
    except Exception as e:
        logger.error(f"Error fetching violations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch violations"
        )

# Analyze document for violations
@app.post("/analyze/document")
async def analyze_document(
    document_data: Dict[str, Any]
):
    try:
        violations = await violation_detector.analyze_document(document_data)
        
        return {
            "violations": violations,
            "total_violations": len(violations),
            "severity_breakdown": _get_severity_breakdown(violations)
        }
        
    except Exception as e:
        logger.error(f"Error analyzing document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze document"
        )

# Get creditor violation statistics
@app.get("/stats/creditor/{creditor_id}")
async def get_creditor_stats(creditor_id: str):
    try:
        stats = await db.get_creditor_violation_stats(creditor_id)
        return {"stats": stats}
        
    except Exception as e:
        logger.error(f"Error fetching creditor stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch creditor statistics"
        )

# Trigger sword protocol
@app.post("/sword/trigger/{creditor_id}")
async def trigger_sword_protocol(
    creditor_id: str,
    background_tasks: BackgroundTasks
):
    try:
        # Check if threshold is met
        stats = await db.get_creditor_violation_stats(creditor_id)
        
        if stats["total_violations"] < 100:  # Threshold
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Violation threshold not met"
            )
        
        # Trigger sword protocol in background
        background_tasks.add_task(
            gdpr_engine.trigger_sword_protocol,
            creditor_id,
            stats
        )
        
        return {"status": "sword_triggered"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering sword protocol: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trigger sword protocol"
        )

def _get_severity_breakdown(violations: List[Dict]) -> Dict[str, int]:
    """Get breakdown of violations by severity"""
    breakdown = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    
    for violation in violations:
        severity = violation.get("severity", "low")
        if severity in breakdown:
            breakdown[severity] += 1
    
    return breakdown

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("GDPR_ENGINE_PORT", 8001)),
        reload=True
    )