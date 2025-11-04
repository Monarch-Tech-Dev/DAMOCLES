import sys
import os
from pathlib import Path

# Ensure the current directory is in Python path for module imports
current_dir = Path(__file__).parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio
import aiohttp
import asyncpg
import redis.asyncio as redis
from dotenv import load_dotenv
import logging

from models.gdpr import GDPRRequest, GDPRRequestCreate, GDPRResponse
from models.creditor import Creditor
from models.user import User
from services.gdpr_engine import GDPREngine
from services.email_service import EmailService
from services.violation_detector import ViolationDetector
from services.settlement_service import SettlementService
from services.negotiation_engine import NegotiationEngine
from services.datatilsynet_service import DatatilsynetService
from database import Database

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# GDPR Request Cooldown Configuration
# Prevents spam by limiting how often users can send requests to the same creditor
GDPR_REQUEST_COOLDOWN_HOURS = int(os.getenv("GDPR_REQUEST_COOLDOWN_HOURS", "168"))  # Default: 7 days (168 hours)

app = FastAPI(
    title="DAMOCLES GDPR Engine",
    description="Automated GDPR request generation and violation detection",
    version="1.0.0"
)

# CORS middleware - support both local and production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://damocles.no",
    "https://www.damocles.no"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
db = Database()
gdpr_engine = GDPREngine(db)
email_service = EmailService()
violation_detector = ViolationDetector()
settlement_service = SettlementService()
negotiation_engine = NegotiationEngine()
datatilsynet_service = DatatilsynetService()

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

        # Check for cooldown period to prevent spam
        last_request = await db.get_last_gdpr_request_for_creditor(
            request.user_id,
            request.creditor_id
        )

        if last_request:
            last_created_at = last_request.get('created_at')
            if last_created_at:
                time_since_last = datetime.now(last_created_at.tzinfo) - last_created_at
                cooldown_period = timedelta(hours=GDPR_REQUEST_COOLDOWN_HOURS)

                if time_since_last < cooldown_period:
                    # Calculate remaining cooldown time
                    remaining_time = cooldown_period - time_since_last
                    remaining_days = int(remaining_time.total_seconds() / 86400)
                    remaining_hours = int((remaining_time.total_seconds() % 86400) / 3600)
                    remaining_minutes = int((remaining_time.total_seconds() % 3600) / 60)

                    # Sacred Architecture: Educational & empowering message, not restrictive
                    if remaining_days > 0:
                        time_message = f"Du kan sende en ny forespørsel om {remaining_days} dager og {remaining_hours} timer"
                    else:
                        time_message = f"Du kan sende en ny forespørsel om {remaining_hours} timer og {remaining_minutes} minutter"

                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail={
                            "error": "Legal timeline in progress",
                            "message": f"Du har allerede sendt en GDPR-forespørsel til denne kreditoren. I følge GDPR har de 30 dager på å svare. La oss gi dem tid til å svare først. {time_message}.",
                            "user_friendly_message": "Vi hjelper deg med å være strategisk. Å vente på svar er smartere enn å sende flere forespørsler.",
                            "legal_context": "GDPR Artikkel 12: Kreditoren har 30 dager svarfrist",
                            "cooldown_ends_at": (last_created_at + cooldown_period).isoformat(),
                            "remaining_seconds": int(remaining_time.total_seconds()),
                            "next_steps": "Vi overvåker om kreditoren svarer. Hvis de ikke svarer innen fristen, hjelper vi deg med eskalering."
                        }
                    )

        # Generate GDPR request
        gdpr_request = await gdpr_engine.generate_gdpr_request(user, creditor)

        return {
            "request_id": gdpr_request.id,
            "status": "generated",
            "content_preview": gdpr_request.content[:200] + "..."
        }

    except HTTPException:
        raise
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

# Check GDPR request cooldown status
@app.get("/gdpr/cooldown-status")
async def check_cooldown_status(
    user_id: str,
    creditor_id: str
):
    """Check if user can send a new GDPR request to a specific creditor"""
    try:
        last_request = await db.get_last_gdpr_request_for_creditor(
            user_id,
            creditor_id
        )

        if not last_request:
            return {
                "can_send": True,
                "cooldown_active": False,
                "message": "No previous request found. You can send a GDPR request."
            }

        last_created_at = last_request.get('created_at')
        if not last_created_at:
            return {
                "can_send": True,
                "cooldown_active": False,
                "message": "You can send a GDPR request."
            }

        time_since_last = datetime.now(last_created_at.tzinfo) - last_created_at
        cooldown_period = timedelta(hours=GDPR_REQUEST_COOLDOWN_HOURS)

        if time_since_last < cooldown_period:
            remaining_time = cooldown_period - time_since_last
            remaining_hours = int(remaining_time.total_seconds() / 3600)
            remaining_minutes = int((remaining_time.total_seconds() % 3600) / 60)
            remaining_days = remaining_hours // 24
            remaining_hours_in_day = remaining_hours % 24

            cooldown_ends_at = last_created_at + cooldown_period

            # Sacred Architecture: Educational, not restrictive
            return {
                "can_send": False,
                "cooldown_active": True,
                "message": f"Du har sendt en GDPR-forespørsel. Kreditoren har 30 dager på å svare i følge GDPR Artikkel 12.",
                "timeline_info": "Vi anbefaler å vente på svar før du sender en ny forespørsel. Dette styrker din juridiske posisjon.",
                "cooldown_ends_at": cooldown_ends_at.isoformat(),
                "remaining_seconds": int(remaining_time.total_seconds()),
                "remaining_hours": remaining_hours,
                "remaining_days": remaining_days,
                "last_request_date": last_created_at.isoformat(),
                "legal_deadline": "30 dager fra sending",
                "what_happens_next": "Vi overvåker om kreditoren svarer. Hvis ikke, hjelper vi deg eskalere til Datatilsynet."
            }
        else:
            return {
                "can_send": True,
                "cooldown_active": False,
                "message": "Du kan nå sende en ny GDPR-forespørsel hvis du trenger det.",
                "last_request_date": last_created_at.isoformat(),
                "recommendation": "Sjekk først om du har fått svar på din forrige forespørsel."
            }

    except Exception as e:
        logger.error(f"Error checking cooldown status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check cooldown status"
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

# SendGrid Inbound Email Webhook
@app.post("/webhook/sendgrid/inbound")
async def sendgrid_inbound_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """Handle inbound email responses from creditors via SendGrid"""
    try:
        # Parse SendGrid inbound parse webhook
        form_data = await request.form()

        # Extract email data
        to_email = form_data.get("to", "")
        from_email = form_data.get("from", "")
        subject = form_data.get("subject", "")
        text_body = form_data.get("text", "")
        html_body = form_data.get("html", "")

        # Extract tracking ID from reply-to address (gdpr+{request_id}@damocles.no)
        request_id = None
        if "gdpr+" in to_email:
            try:
                request_id = to_email.split("gdpr+")[1].split("@")[0]
            except:
                logger.warning(f"Could not extract request_id from {to_email}")

        if not request_id:
            logger.warning(f"Inbound email without valid tracking: {to_email}")
            return {"status": "ignored", "reason": "no_tracking_id"}

        logger.info(f"📬 Inbound GDPR response for request {request_id} from {from_email}")

        # Process response in background
        response_content = html_body.encode('utf-8') if html_body else text_body.encode('utf-8')

        background_tasks.add_task(
            gdpr_engine.process_gdpr_response,
            request_id,
            response_content,
            "email"
        )

        return {"status": "received", "request_id": request_id}

    except Exception as e:
        logger.error(f"Error processing inbound email webhook: {e}")
        # Don't raise exception - we don't want SendGrid to retry
        return {"status": "error", "message": str(e)}

# Analyze settlement opportunity
@app.post("/settlement/analyze")
async def analyze_settlement(settlement_request: Dict[str, Any]):
    """
    Analyze settlement opportunity for a debt based on GDPR violations.

    Request body:
    {
        "debt_id": "string",
        "user_id": "string",
        "creditor_id": "string"
    }

    Returns comprehensive settlement analysis including:
    - GDPR violation damages
    - Inkassoloven violations (excessive fees)
    - Creditor risk score
    - Settlement leverage
    - Three settlement offers (conservative, recommended, aggressive)
    - Settlement proposal template
    - Negotiation strategy
    """
    try:
        user_id = settlement_request.get("user_id")
        creditor_id = settlement_request.get("creditor_id")
        debt_id = settlement_request.get("debt_id")

        if not all([user_id, creditor_id, debt_id]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required fields: user_id, creditor_id, debt_id"
            )

        # Get debt data from database
        debt = await db.get_debt_by_id(debt_id)
        if not debt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Debt not found"
            )

        # Get creditor data
        creditor = await db.get_creditor(creditor_id)
        if not creditor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Creditor not found"
            )

        # Get GDPR violations for this creditor
        violations = await db.get_user_violations_for_creditor(user_id, creditor_id)

        # Prepare data for settlement analysis
        debt_data = {
            "amount": float(debt.get("amount", 0)),
            "originalAmount": float(debt.get("originalAmount", 0)),
            "creditorName": creditor.get("name", "Unknown"),
            "reference": debt.get("reference", "N/A")
        }

        creditor_data = {
            "totalViolations": creditor.get("totalViolations", 0),
            "violationScore": float(creditor.get("violationScore", 0)),
            "type": creditor.get("type", "OTHER")
        }

        # Perform settlement analysis
        analysis = await settlement_service.analyze_settlement_opportunity(
            debt_data=debt_data,
            violations=violations,
            creditor_data=creditor_data
        )

        logger.info(f"💰 Settlement analysis completed for debt {debt_id}")
        logger.info(f"   Leverage: {analysis['leverage']['leverage_level']}")
        logger.info(f"   Recommended settlement: {analysis['settlement_offers']['recommended']['settlement_amount']} NOK")
        logger.info(f"   Reduction: {analysis['settlement_offers']['recommended']['reduction_percentage']}%")

        return analysis

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing settlement: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze settlement: {str(e)}"
        )

# Evaluate creditor counter-offer
@app.post("/negotiation/evaluate")
async def evaluate_counter_offer(negotiation_request: Dict[str, Any]):
    """
    Evaluate a creditor's counter-offer and generate negotiation response.

    Request body:
    {
        "settlement_id": "string",
        "counter_offer_amount": float,
        "original_settlement_analysis": {...},
        "negotiation_history": [...],
        "days_since_initial_offer": int
    }

    Returns:
    - Evaluation of counter-offer quality
    - Recommended action (ACCEPT / COUNTER / FINAL_OFFER / ESCALATE)
    - Response offer with negotiation strategy
    - Formal response letter
    """
    try:
        counter_offer_amount = float(negotiation_request.get("counter_offer_amount"))
        original_analysis = negotiation_request.get("original_settlement_analysis")
        negotiation_history = negotiation_request.get("negotiation_history", [])
        days_since_initial = int(negotiation_request.get("days_since_initial_offer", 0))

        if not original_analysis:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required field: original_settlement_analysis"
            )

        # Evaluate counter-offer
        evaluation = await negotiation_engine.evaluate_counter_offer(
            counter_offer_amount=counter_offer_amount,
            original_settlement_analysis=original_analysis,
            negotiation_history=negotiation_history,
            days_since_initial_offer=days_since_initial
        )

        # Create formal response
        debt_data = {
            "reference": negotiation_request.get("debt_reference", "N/A"),
            "amount": original_analysis["settlement_offers"]["comparison"]["original_debt"]
        }

        response_package = await negotiation_engine.create_negotiation_response(
            evaluation=evaluation,
            settlement_analysis=original_analysis,
            debt_data=debt_data
        )

        logger.info(f"💼 Negotiation evaluation complete")
        logger.info(f"   Counter-offer: {counter_offer_amount:.2f} NOK")
        logger.info(f"   Recommendation: {evaluation['recommended_action']}")
        if evaluation.get('response_offer'):
            logger.info(f"   Our counter: {evaluation['response_offer']['amount']:.2f} NOK")

        return {
            "evaluation": evaluation,
            "response": response_package,
            "analysis_timestamp": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evaluating counter-offer: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate counter-offer: {str(e)}"
        )

# Generate Datatilsynet complaint
@app.post("/datatilsynet/generate-complaint")
async def generate_datatilsynet_complaint(complaint_request: Dict[str, Any]):
    """
    Generate formal complaint to Datatilsynet (Norwegian DPA) for GDPR violations.

    Request body:
    {
        "user_id": "string",
        "creditor_id": "string",
        "gdpr_request_id": "string"
    }

    Returns comprehensive complaint package including:
    - Formal complaint letter in Norwegian
    - Evidence package with all violations
    - Legal analysis and precedent references
    - Estimated administrative fine (GDPR Art. 83)
    - Recommended enforcement actions
    """
    try:
        user_id = complaint_request.get("user_id")
        creditor_id = complaint_request.get("creditor_id")
        gdpr_request_id = complaint_request.get("gdpr_request_id")

        if not all([user_id, creditor_id, gdpr_request_id]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required fields: user_id, creditor_id, gdpr_request_id"
            )

        # Get user data
        user = await db.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Get creditor data
        creditor = await db.get_creditor(creditor_id)
        if not creditor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Creditor not found"
            )

        # Get GDPR request
        gdpr_request = await db.get_gdpr_request(gdpr_request_id)
        if not gdpr_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="GDPR request not found"
            )

        # Get violations for this request
        violations = await db.get_violations_for_request(gdpr_request_id)

        # Convert database objects to dicts
        user_data = {
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "address": user.get("address", ""),
            "phone": user.get("phone", "")
        }

        creditor_data = {
            "name": creditor.get("name", ""),
            "org_number": creditor.get("org_number", ""),
            "email": creditor.get("email", ""),
            "address": creditor.get("address", ""),
            "type": creditor.get("type", "OTHER"),
            "total_violations": creditor.get("totalViolations", 0),
            "historical_complaints": creditor.get("datatilsynetComplaints", 0)
        }

        gdpr_request_data = {
            "id": gdpr_request.get("id"),
            "reference": gdpr_request.get("reference"),
            "sent_date": gdpr_request.get("sent_at"),
            "deadline": gdpr_request.get("response_due"),
            "status": gdpr_request.get("status"),
            "tracking_number": gdpr_request.get("tracking_number")
        }

        # Generate complaint
        complaint_package = await datatilsynet_service.generate_complaint(
            user_data=user_data,
            creditor_data=creditor_data,
            gdpr_request=gdpr_request_data,
            violations=violations
        )

        logger.info(f"📢 Datatilsynet complaint generated: {complaint_package['complaint_reference']}")
        logger.info(f"   Creditor: {creditor_data['name']}")
        logger.info(f"   Violations: {len(violations)}")
        logger.info(f"   Estimated fine: {complaint_package['fine_estimate']['estimated_fine_nok']:,} NOK")

        return complaint_package

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating Datatilsynet complaint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Datatilsynet complaint: {str(e)}"
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