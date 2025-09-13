import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from jinja2 import Environment, FileSystemLoader, Template
import aiohttp
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging

from models.gdpr import GDPRRequest, Violation, ViolationType
from models.user import User
from models.creditor import Creditor
from services.email_service import EmailService
from services.violation_detector import ViolationDetector
from database import Database

logger = logging.getLogger(__name__)

class GDPREngine:
    def __init__(self, database: Database):
        self.db = database
        self.email_service = EmailService()
        self.violation_detector = ViolationDetector()
        
        # Initialize Jinja2 environment
        self.template_env = Environment(
            loader=FileSystemLoader('templates'),
            autoescape=True
        )
        
        # GDPR request templates by creditor type
        self.templates = {
            'inkasso': 'gdpr_inkasso.html',
            'bnpl': 'gdpr_bnpl.html',
            'bank': 'gdpr_bank.html',
            'default': 'gdpr_default.html'
        }

    async def generate_gdpr_request(
        self, 
        user: User, 
        creditor: Creditor
    ) -> GDPRRequest:
        """Generate personalized GDPR request"""
        
        # Select template based on creditor type
        template_name = self.templates.get(
            creditor.type.lower(), 
            self.templates['default']
        )
        
        try:
            template = self.template_env.get_template(template_name)
        except Exception:
            # Fallback to default template
            template = self.template_env.get_template(self.templates['default'])
        
        # Generate unique reference ID
        reference_id = self._generate_reference_id(user, creditor)
        
        # Get user's account info with this creditor if available
        account_info = await self._get_user_account_info(user.id, creditor.id)
        
        # Render GDPR request content
        content = template.render(
            user_name=user.name or "Bruker",  # Use "User" if name not available
            user_email=user.email,
            personal_number="***",  # Masked for security
            creditor_name=creditor.name,
            organization_number=creditor.organization_number,
            account_number=account_info.get('account_number', 'Ukjent'),
            date=datetime.now().strftime('%d.%m.%Y'),
            reference_id=reference_id,
            legal_deadline=30,  # GDPR mandated response time
            contact_email=creditor.privacy_email or creditor.name.lower().replace(' ', '') + '@example.com'
        )
        
        # Calculate response due date (30 days from sending)
        response_due = datetime.now() + timedelta(days=30)
        
        # Create GDPR request record
        gdpr_request = await self.db.create_gdpr_request({
            'id': str(uuid.uuid4()),
            'user_id': user.id,
            'creditor_id': creditor.id,
            'reference_id': reference_id,
            'content': content,
            'status': 'PENDING',
            'sent_at': None,
            'response_due': response_due,
            'created_at': datetime.now()
        })
        
        logger.info(f"Generated GDPR request {reference_id} for user {user.id} to creditor {creditor.name}")
        
        return gdpr_request
    
    async def send_gdpr_request(
        self, 
        gdpr_request: GDPRRequest,
        background_tasks=None
    ):
        """Send GDPR request via email with tracking"""
        
        try:
            # Get user and creditor data
            user = await self.db.get_user(gdpr_request.user_id)
            creditor = await self.db.get_creditor(gdpr_request.creditor_id)
            
            if not user or not creditor:
                raise Exception("User or creditor not found")
            
            # Create email
            subject = f"GDPR Article 15 Forespørsel - {gdpr_request.reference_id}"
            
            # Add tracking pixel
            tracking_pixel_url = self._generate_tracking_pixel_url(gdpr_request.id)
            
            # Enhanced email content with tracking
            email_content = f"""
            {gdpr_request.content}
            
            <br><br>
            <img src="{tracking_pixel_url}" width="1" height="1" style="display:none;" />
            
            <p style="font-size: 10px; color: #999;">
            Dette er en automatisk generert forespørsel fra DAMOCLES platform for forbrukerbeskyttelse.
            Referanse: {gdpr_request.reference_id}
            </p>
            """
            
            # Send email
            await self.email_service.send_gdpr_request_email(
                to_email=creditor.privacy_email or f"post@{creditor.name.lower().replace(' ', '')}.no",
                from_email=user.email,
                from_name=user.name or "DAMOCLES Bruker",
                subject=subject,
                content=email_content,
                cc_emails=['post@datatilsynet.no'],  # CC data protection authority
                tracking_id=gdpr_request.id
            )
            
            # Update request status
            await self.db.update_gdpr_request(gdpr_request.id, {
                'status': 'SENT',
                'sent_at': datetime.now()
            })
            
            # Schedule follow-up reminder
            if background_tasks:
                background_tasks.add_task(
                    self._schedule_followup_reminder,
                    gdpr_request.id,
                    delay_days=25  # 5 days before deadline
                )
            
            logger.info(f"Sent GDPR request {gdpr_request.reference_id}")
            
        except Exception as e:
            logger.error(f"Failed to send GDPR request {gdpr_request.id}: {e}")
            
            # Update status to failed
            await self.db.update_gdpr_request(gdpr_request.id, {
                'status': 'FAILED'
            })
            
            raise e
    
    async def process_gdpr_response(
        self,
        request_id: str,
        response_content: bytes,
        response_format: str
    ):
        """Process and analyze GDPR response"""
        
        try:
            gdpr_request = await self.db.get_gdpr_request(request_id)
            if not gdpr_request:
                raise Exception("GDPR request not found")
            
            # Parse response based on format
            if response_format == 'pdf':
                extracted_data = await self._parse_pdf_response(response_content)
            elif response_format == 'email':
                extracted_data = await self._parse_email_response(response_content)
            elif response_format == 'json':
                extracted_data = await self._parse_json_response(response_content)
            else:
                extracted_data = await self._parse_text_response(response_content)
            
            # Store response
            await self.db.create_gdpr_response({
                'id': str(uuid.uuid4()),
                'request_id': request_id,
                'content': response_content,
                'extracted_data': extracted_data,
                'format': response_format,
                'received_at': datetime.now()
            })
            
            # Detect violations using AI
            violations = await self.violation_detector.analyze(extracted_data)
            
            # Store violations
            for violation_data in violations:
                violation_id = str(uuid.uuid4())
                await self.db.create_violation({
                    'id': violation_id,
                    'gdpr_request_id': request_id,
                    'creditor_id': gdpr_request.creditor_id,
                    'type': violation_data.type,
                    'severity': violation_data.severity,
                    'confidence': violation_data.confidence,
                    'evidence': violation_data.evidence,
                    'legal_reference': violation_data.legal_reference,
                    'estimated_damage': violation_data.estimated_damage,
                    'status': 'PENDING',
                    'created_at': datetime.now()
                })
            
            # Update request status
            await self.db.update_gdpr_request(request_id, {
                'status': 'RESPONDED',
                'response_received_at': datetime.now()
            })
            
            # If critical violations found, trigger sword mechanism
            critical_violations = [v for v in violations if v.severity == 'critical']
            if critical_violations:
                await self.trigger_sword_protocol(
                    gdpr_request.creditor_id, 
                    violations
                )
            
            logger.info(f"Processed GDPR response for request {request_id}, found {len(violations)} violations")
            
            return violations
            
        except Exception as e:
            logger.error(f"Failed to process GDPR response for request {request_id}: {e}")
            raise e
    
    async def trigger_sword_protocol(
        self,
        creditor_id: str,
        violations: List[Violation]
    ):
        """Trigger sword mechanism for collective action"""
        
        try:
            # Get creditor violation statistics
            stats = await self.db.get_creditor_violation_stats(creditor_id)
            
            # Check if sword threshold is met
            sword_threshold = 100  # Configurable threshold
            
            if stats['total_violations'] >= sword_threshold:
                # Create blockchain evidence entry
                evidence_hash = await self._create_blockchain_evidence(
                    creditor_id, violations
                )
                
                # Notify all affected users
                affected_users = await self.db.get_users_with_creditor_debts(creditor_id)
                
                for user in affected_users:
                    await self.email_service.send_sword_notification(
                        user.email,
                        creditor_id,
                        stats['total_violations']
                    )
                
                # Trigger settlement negotiations
                await self._trigger_mass_settlement_negotiations(
                    creditor_id, affected_users
                )
                
                logger.info(f"Sword protocol triggered for creditor {creditor_id}")
                
        except Exception as e:
            logger.error(f"Failed to trigger sword protocol: {e}")
            raise e
    
    def _generate_reference_id(self, user: User, creditor: Creditor) -> str:
        """Generate unique reference ID for GDPR request"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M')
        user_hash = str(hash(user.id))[-4:]  # Last 4 digits of user hash
        creditor_hash = str(hash(creditor.id))[-4:]  # Last 4 digits of creditor hash
        
        return f"GDPR-{timestamp}-{user_hash}-{creditor_hash}"
    
    def _generate_tracking_pixel_url(self, request_id: str) -> str:
        """Generate tracking pixel URL"""
        base_url = "https://api.damocles.no"  # In production
        return f"{base_url}/tracking/pixel/{request_id}.png"
    
    async def _get_user_account_info(self, user_id: str, creditor_id: str) -> Dict[str, Any]:
        """Get user's account information with specific creditor"""
        debt = await self.db.get_user_debt_with_creditor(user_id, creditor_id)
        
        if debt:
            return {
                'account_number': debt.account_number,
                'original_amount': float(debt.original_amount),
                'current_amount': float(debt.current_amount)
            }
        
        return {'account_number': 'Ukjent'}
    
    async def _schedule_followup_reminder(self, request_id: str, delay_days: int):
        """Schedule follow-up reminder for GDPR request"""
        await asyncio.sleep(delay_days * 24 * 60 * 60)  # Convert days to seconds
        
        gdpr_request = await self.db.get_gdpr_request(request_id)
        
        if gdpr_request and gdpr_request.status == 'SENT':
            # Send reminder email
            user = await self.db.get_user(gdpr_request.user_id)
            creditor = await self.db.get_creditor(gdpr_request.creditor_id)
            
            await self.email_service.send_gdpr_reminder_email(
                user.email,
                creditor.name,
                gdpr_request.reference_id,
                gdpr_request.response_due
            )
    
    async def _parse_pdf_response(self, content: bytes) -> Dict[str, Any]:
        """Parse PDF GDPR response"""
        # Implementation would use pdfplumber or similar
        return {"format": "pdf", "text": "PDF content extraction not implemented"}
    
    async def _parse_email_response(self, content: bytes) -> Dict[str, Any]:
        """Parse email GDPR response"""
        return {"format": "email", "text": content.decode('utf-8', errors='ignore')}
    
    async def _parse_json_response(self, content: bytes) -> Dict[str, Any]:
        """Parse JSON GDPR response"""
        import json
        return json.loads(content.decode('utf-8'))
    
    async def _parse_text_response(self, content: bytes) -> Dict[str, Any]:
        """Parse plain text GDPR response"""
        return {"format": "text", "text": content.decode('utf-8', errors='ignore')}
    
    async def _create_blockchain_evidence(
        self, 
        creditor_id: str, 
        violations: List[Violation]
    ) -> str:
        """Create immutable evidence record on blockchain"""
        # This would interact with Cardano smart contracts
        # For now, return a placeholder hash
        evidence_data = {
            'creditor_id': creditor_id,
            'violations': [v.dict() for v in violations],
            'timestamp': datetime.now().isoformat()
        }
        
        # In production, this would:
        # 1. Upload evidence to IPFS
        # 2. Create transaction on Cardano
        # 3. Return transaction hash
        
        return f"blockchain_hash_{uuid.uuid4()}"
    
    async def _trigger_mass_settlement_negotiations(
        self,
        creditor_id: str,
        affected_users: List[User]
    ):
        """Trigger settlement negotiations for all affected users"""
        
        # This would call the settlement service
        settlement_service_url = "http://settlement-service:8003"
        
        async with aiohttp.ClientSession() as session:
            for user in affected_users:
                try:
                    async with session.post(
                        f"{settlement_service_url}/settlements/auto-negotiate",
                        json={
                            'user_id': user.id,
                            'creditor_id': creditor_id,
                            'trigger': 'sword_protocol'
                        }
                    ) as response:
                        if response.status == 200:
                            logger.info(f"Triggered settlement for user {user.id}")
                        
                except Exception as e:
                    logger.error(f"Failed to trigger settlement for user {user.id}: {e}")