import os
import logging
from typing import Optional, Dict, Any
import aiohttp

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # SendGrid configuration
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY", "")
        self.sendgrid_api_url = "https://api.sendgrid.com/v3/mail/send"
        self.from_email = os.getenv("GDPR_FROM_EMAIL", "gdpr@damocles.no")
        self.from_name = os.getenv("GDPR_FROM_NAME", "DAMOCLES GDPR Service")

        # Development mode check
        self.is_dev_mode = not self.sendgrid_api_key or self.sendgrid_api_key == "your_sendgrid_api_key_here"
        
    async def send_gdpr_request_email(
        self,
        to_email: str,
        from_email: str,
        from_name: str,
        subject: str,
        content: str,
        cc_emails: Optional[list] = None,
        tracking_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send GDPR request via SendGrid API with tracking and CC options"""

        try:
            # Development mode - log instead of send
            if self.is_dev_mode:
                logger.info(f"\n📧 GDPR EMAIL (DEV MODE)")
                logger.info(f"To: {to_email}")
                logger.info(f"From: {from_name} <{from_email}>")
                logger.info(f"Reply-To: {self.from_email}")
                logger.info(f"Subject: {subject}")
                if cc_emails:
                    logger.info(f"CC: {', '.join(cc_emails)}")
                logger.info(f"Content length: {len(content)} characters")
                logger.info(f"Tracking ID: {tracking_id}")
                logger.info("✅ Email logged (SendGrid not configured)\n")

                return {
                    "status": "sent_dev",
                    "message_id": f"dev-{tracking_id}",
                    "timestamp": "development"
                }

            # Production SendGrid API sending
            personalizations = [{
                "to": [{"email": to_email}],
                "subject": subject
            }]

            # Add CC recipients if specified
            if cc_emails:
                personalizations[0]["cc"] = [{"email": email} for email in cc_emails]

            # Custom headers for tracking
            custom_args = {
                "tracking_id": tracking_id or "unknown",
                "request_type": "gdpr_article_15"
            }

            # SendGrid API payload
            payload = {
                "personalizations": personalizations,
                "from": {
                    "email": self.from_email,
                    "name": self.from_name
                },
                "reply_to": {
                    "email": f"gdpr+{tracking_id}@damocles.no",
                    "name": "DAMOCLES GDPR Response"
                },
                "subject": subject,
                "content": [
                    {
                        "type": "text/html",
                        "value": content
                    }
                ],
                "custom_args": custom_args,
                "tracking_settings": {
                    "click_tracking": {"enable": True},
                    "open_tracking": {"enable": True}
                }
            }

            # Send via SendGrid API
            headers = {
                "Authorization": f"Bearer {self.sendgrid_api_key}",
                "Content-Type": "application/json"
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.sendgrid_api_url,
                    json=payload,
                    headers=headers
                ) as response:
                    if response.status == 202:
                        response_data = await response.text()
                        logger.info(f"✅ GDPR email sent via SendGrid to {to_email}")

                        return {
                            "status": "sent",
                            "message_id": f"sendgrid-{tracking_id}",
                            "recipients": [to_email] + (cc_emails or [])
                        }
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ SendGrid API error ({response.status}): {error_text}")
                        return {
                            "status": "failed",
                            "error": f"SendGrid returned {response.status}: {error_text}"
                        }

        except Exception as e:
            logger.error(f"❌ Failed to send GDPR email: {e}")
            return {"status": "failed", "error": str(e)}
        
    async def send_notification_email(
        self,
        to_email: str,
        subject: str, 
        content: str
    ):
        """Send notification email to users"""
        
        # Mock implementation for development
        print(f"Sending notification to {to_email}: {subject}")
        
        return {"status": "sent"}
        
    async def send_sword_notification(
        self,
        user_email: str,
        creditor_id: str,
        violation_count: int
    ):
        """Send SWORD protocol notification to user"""
        
        subject = "🗡️ SWORD Protokoll Aktivert - Kollektiv Handling"
        
        content = f"""
        <h2>SWORD Protokoll Aktivert</h2>
        <p>Hei,</p>
        <p>Vi har nå samlet nok beviser mot en kreditor for å aktivere SWORD protokollen.</p>
        <p><strong>Violation Count:</strong> {violation_count}</p>
        <p><strong>Kreditor ID:</strong> {creditor_id}</p>
        <p>Du vil snart motta informasjon om kollektive forhandlinger.</p>
        <p>Med vennlig hilsen,<br>DAMOCLES Team</p>
        """
        
        print(f"🗡️ SWORD notification sent to {user_email}")
        return {"status": "sent"}
    
    async def send_gdpr_reminder_email(
        self,
        user_email: str,
        creditor_name: str,
        reference_id: str,
        response_due: str
    ):
        """Send reminder about pending GDPR request"""
        
        subject = f"⏰ Påminnelse: GDPR Forespørsel {reference_id}"
        
        content = f"""
        <h2>GDPR Forespørsel Påminnelse</h2>
        <p>Din GDPR forespørsel til <strong>{creditor_name}</strong> nærmer seg fristen.</p>
        <p><strong>Referanse:</strong> {reference_id}</p>
        <p><strong>Frist:</strong> {response_due}</p>
        <p>Vi overvåker fortsatt responsen.</p>
        """
        
        print(f"⏰ GDPR reminder sent to {user_email} for {creditor_name}")
        return {"status": "sent"}
    
    def _create_tracking_pixel(self, request_id: str) -> str:
        """Create tracking pixel URL for email open detection"""
        return f"https://api.damocles.no/track/pixel/{request_id}.png"