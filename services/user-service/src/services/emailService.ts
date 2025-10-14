import sgMail from '@sendgrid/mail';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'gdpr@damocles.no';
const FROM_NAME = process.env.FROM_NAME || 'DAMOCLES GDPR Platform';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface SendGDPREmailParams {
  gdprRequestId: string;
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  userEmail: string;
  userName: string;
}

export async function sendGDPREmail(params: SendGDPREmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    gdprRequestId,
    toEmail,
    toName,
    subject,
    htmlContent,
    textContent,
    userEmail,
    userName
  } = params;

  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured - email not sent');
    return {
      success: false,
      error: 'Email service not configured'
    };
  }

  try {
    // Generate tracking ID
    const trackingId = `gdpr-${gdprRequestId}-${Date.now()}`;

    // Create custom reply-to address for tracking
    const replyToEmail = `gdpr+${gdprRequestId}@damocles.no`;

    // Send email via SendGrid
    const msg = {
      to: {
        email: toEmail,
        name: toName
      },
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      replyTo: {
        email: replyToEmail,
        name: `DAMOCLES GDPR - ${userName}`
      },
      subject,
      text: textContent,
      html: htmlContent,
      customArgs: {
        gdpr_request_id: gdprRequestId,
        tracking_id: trackingId
      },
      // Add tracking pixel
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: false
        },
        openTracking: {
          enable: true
        }
      }
    };

    const [response] = await sgMail.send(msg);
    const messageId = response.headers['x-message-id'] as string;

    // Note: PlatformEmail will be created by email routes with full context
    // This is just for SendGrid tracking

    console.log(`GDPR email sent successfully: ${messageId}`);

    return {
      success: true,
      messageId
    };

  } catch (error: any) {
    console.error('Error sending GDPR email:', error);

    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

/**
 * Parse inbound email from SendGrid webhook
 */
export interface InboundEmail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  headers: Record<string, string>;
  attachments?: Array<{
    filename: string;
    type: string;
    content: string; // base64
  }>;
}

export async function processInboundEmail(email: InboundEmail): Promise<void> {
  try {
    // Extract GDPR request ID from To address
    // Format: gdpr+{request_id}@damocles.no
    const toAddress = email.to.toLowerCase();
    const match = toAddress.match(/gdpr\+([a-z0-9-]+)@/i);

    if (!match) {
      console.warn('Inbound email does not match GDPR pattern:', toAddress);
      return;
    }

    const gdprRequestId = match[1];

    // Find the GDPR request
    const gdprRequest = await prisma.gdprRequest.findUnique({
      where: { id: gdprRequestId },
      include: {
        user: true,
        creditor: true
      }
    });

    if (!gdprRequest) {
      console.error('GDPR request not found:', gdprRequestId);
      return;
    }

    // Store the response
    const response = await prisma.gdprResponse.create({
      data: {
        requestId: gdprRequestId,
        content: Buffer.from(email.html || email.text),
        extractedData: email.text.substring(0, 10000), // Store first 10k chars
        format: email.html ? 'email_html' : 'email_text',
        receivedAt: new Date()
      }
    });

    // Update request status
    await prisma.gdprRequest.update({
      where: { id: gdprRequestId },
      data: {
        status: 'responded',
        responseReceivedAt: new Date()
      }
    });

    // Store in PlatformEmail for tracking
    await prisma.platformEmail.create({
      data: {
        userId: gdprRequest.userId,
        creditorId: gdprRequest.creditorId,
        direction: 'inbound',
        fromEmail: email.from,
        toEmail: email.to,
        ccEmails: '[]',
        subject: email.subject,
        bodyHtml: email.html || '',
        bodyText: email.text || '',
        templateUsed: null,
        userApproved: false, // This is an inbound email
        status: 'delivered',
        deliveredAt: new Date(),
        respondedAt: new Date(),
        trackingId: `inbound-${Date.now()}`,
        messageId: email.headers['message-id'] || null,
        inReplyTo: email.headers['in-reply-to'] || null,
        references: email.headers['references'] || null,
        metadata: JSON.stringify({
          from: email.from,
          response_id: response.id,
          has_attachments: email.attachments && email.attachments.length > 0
        })
      }
    });

    console.log(`Inbound GDPR response processed for request ${gdprRequestId}`);

    // TODO: Trigger automated analysis of response
    // TODO: Send notification to user

  } catch (error) {
    console.error('Error processing inbound email:', error);
    throw error;
  }
}

/**
 * Generate email content for GDPR request
 */
export function generateEmailContent(htmlContent: string, userName: string, userEmail: string) {
  // Add email-specific formatting
  const emailHtml = `
<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GDPR Forespørsel</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
    ${htmlContent}

    <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; font-size: 12px; color: #6b7280;">
      <p style="margin: 0 0 10px 0;"><strong>Viktig informasjon:</strong></p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Dette er en automatisk generert GDPR-forespørsel sendt via DAMOCLES-plattformen</li>
        <li>Vennligst svar på denne e-posten innen 30 dager i henhold til GDPR</li>
        <li>Ditt svar vil bli automatisk analysert for å oppdage potensielle brudd</li>
        <li>For spørsmål om denne forespørselen, kontakt: ${userEmail}</li>
      </ul>

      <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 11px;">
        Sendt via <a href="https://damocles.no" style="color: #6366f1; text-decoration: none;">DAMOCLES</a> -
        Forbrukerbeskyttelsesplattform<br>
        Dette er en automatisk e-post. Svar vil bli behandlet automatisk.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // Generate plain text version
  const emailText = htmlToText(htmlContent);

  return {
    html: emailHtml,
    text: emailText
  };
}

/**
 * Simple HTML to text converter
 */
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}
