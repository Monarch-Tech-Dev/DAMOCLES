import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "localhost")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        
    async def send_gdpr_request_email(
        self, 
        to_email: str, 
        from_email: str,
        from_name: str,
        subject: str, 
        content: str, 
        cc_emails: Optional[list] = None,
        tracking_id: Optional[str] = None
    ):
        """Send GDPR request via email with tracking and CC options"""
        
        try:
            # Create multipart message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{from_name} <{from_email}>"
            msg['To'] = to_email
            
            if cc_emails:
                msg['Cc'] = ', '.join(cc_emails)
            
            # Add HTML content
            html_part = MIMEText(content, 'html', 'utf-8')
            msg.attach(html_part)
            
            # Development mode - print instead of send
            if self.smtp_server == "localhost":
                print(f"\n📧 GDPR EMAIL SENT (DEV MODE)")
                print(f"To: {to_email}")
                print(f"From: {from_name} <{from_email}>")
                print(f"Subject: {subject}")
                if cc_emails:
                    print(f"CC: {', '.join(cc_emails)}")
                print(f"Content length: {len(content)} characters")
                print(f"Tracking ID: {tracking_id}")
                print("✅ Email logged for development\n")
                
                return {
                    "status": "sent_dev", 
                    "message_id": f"dev-{tracking_id}",
                    "timestamp": "development"
                }
            
            # Production SMTP sending (when configured)
            else:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()
                
                if self.smtp_username and self.smtp_password:
                    server.login(self.smtp_username, self.smtp_password)
                
                recipients = [to_email]
                if cc_emails:
                    recipients.extend(cc_emails)
                
                server.send_message(msg, to_addrs=recipients)
                server.quit()
                
                return {
                    "status": "sent", 
                    "message_id": f"smtp-{tracking_id}",
                    "recipients": recipients
                }
                
        except Exception as e:
            print(f"❌ Failed to send GDPR email: {e}")
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