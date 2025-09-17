import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import CommunicationHub from './CommunicationHub';
import dotenv from 'dotenv';
import multer from 'multer';
import { simpleParser } from 'mailparser';

dotenv.config();

const app = express();
const port = process.env.PORT || 8006;
const prisma = new PrismaClient();
const commHub = new CommunicationHub(prisma);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.raw({ type: 'message/rfc822', limit: '10mb' }));

const upload = multer();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'communication-hub',
    timestamp: new Date().toISOString()
  });
});

// Authorize user for platform communication
app.post('/authorize', async (req, res) => {
  try {
    const { userId, creditorId, scope } = req.body;

    const authorization = await commHub.authorizeUserCommunication(userId, creditorId, scope);

    res.json({
      success: true,
      authorization: {
        platformEmail: authorization.platformEmail,
        replyToEmail: authorization.replyToEmail,
        validUntil: authorization.validUntil,
        scope: authorization.scope
      }
    });
  } catch (error) {
    console.error('Authorization failed:', error);
    res.status(500).json({
      error: 'Failed to authorize user',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate GDPR request (requires user approval)
app.post('/gdpr-request', async (req, res) => {
  try {
    const { userId, creditorId, template, customizations } = req.body;

    const email = await commHub.sendGDPRRequest(userId, creditorId, template, customizations);

    res.json({
      success: true,
      email: {
        id: email.id,
        status: email.status,
        requiresApproval: !email.userApproved,
        previewUrl: `/preview/${email.id}`
      }
    });
  } catch (error) {
    console.error('GDPR generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate GDPR request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// User approves email
app.post('/approve/:emailId', async (req, res) => {
  try {
    const { emailId } = req.params;
    const { userId } = req.body;

    await commHub.approveEmail(emailId, userId);

    res.json({
      success: true,
      message: 'Email approved and sent',
      emailId
    });
  } catch (error) {
    console.error('Email approval failed:', error);
    res.status(500).json({
      error: 'Failed to approve email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Webhook for inbound email processing
app.post('/webhook/inbound', upload.single('email'), async (req, res) => {
  try {
    let emailData;

    if (req.file) {
      // Email uploaded as file
      const parsed = await simpleParser(req.file.buffer);
      emailData = {
        from: parsed.from?.text || '',
        to: parsed.to?.text || '',
        subject: parsed.subject || '',
        html: parsed.html || '',
        text: parsed.text || '',
        messageId: parsed.messageId || '',
        inReplyTo: parsed.inReplyTo || ''
      };
    } else {
      // Email data in JSON body
      emailData = req.body;
    }

    await commHub.processInboundEmail(
      emailData.from,
      emailData.to,
      emailData.subject,
      emailData.html,
      emailData.text,
      emailData.messageId,
      emailData.inReplyTo
    );

    res.json({
      success: true,
      message: 'Inbound email processed'
    });
  } catch (error) {
    console.error('Inbound processing failed:', error);
    res.status(500).json({
      error: 'Failed to process inbound email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get communication history for user
app.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { creditorId } = req.query;

    const history = await commHub.getCommunicationHistory(userId, creditorId as string);

    res.json({
      success: true,
      emails: history.map(email => ({
        id: email.id,
        direction: email.direction,
        subject: email.subject,
        status: email.status,
        sentAt: email.sentAt,
        respondedAt: email.respondedAt,
        parsing: email.metadata ? JSON.parse(email.metadata || '{}').parsing : null
      }))
    });
  } catch (error) {
    console.error('Failed to get history:', error);
    res.status(500).json({
      error: 'Failed to get communication history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get inbox summary for admin
app.get('/inbox/summary', async (req, res) => {
  try {
    const summary = await commHub.getInboxSummary();

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Failed to get inbox summary:', error);
    res.status(500).json({
      error: 'Failed to get inbox summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Preview email content
app.get('/preview/:emailId', async (req, res) => {
  try {
    const { emailId } = req.params;

    const email = await prisma.platformEmail.findUnique({
      where: { id: emailId },
      include: {
        user: { select: { email: true } },
        creditor: { select: { name: true } }
      }
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Return HTML preview
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Preview - ${email.subject}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
          .content { border: 1px solid #ddd; padding: 20px; }
          .approve-btn {
            background: #0ea5e9;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            margin: 20px 0;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>📧 Email Preview</h2>
          <p><strong>To:</strong> ${email.toEmail}</p>
          <p><strong>From:</strong> ${email.fromEmail}</p>
          <p><strong>Subject:</strong> ${email.subject}</p>
          <p><strong>Status:</strong> ${email.status}</p>
          ${email.status === 'pending_approval' ? `
            <button class="approve-btn" onclick="approveEmail('${email.id}', '${email.userId}')">
              ✅ Approve and Send
            </button>
          ` : ''}
        </div>

        <div class="content">
          ${email.bodyHtml}
        </div>

        <script>
          function approveEmail(emailId, userId) {
            fetch('/approve/' + emailId, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId })
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                alert('✅ Email approved and sent!');
                location.reload();
              } else {
                alert('❌ Failed to approve email: ' + data.message);
              }
            });
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Preview failed:', error);
    res.status(500).send('Error loading email preview');
  }
});

// Simulate inbound response (for testing)
app.post('/simulate/inbound-response', async (req, res) => {
  try {
    const {
      fromEmail = 'privacy@kredinor.no',
      toEmail = 'user-12345678@damocles.no',
      subject = 'Re: GDPR Article 15 Request',
      responseType = 'admission'
    } = req.body;

    let bodyHtml = '';
    switch (responseType) {
      case 'admission':
        bodyHtml = `
          <p>Thank you for your GDPR request.</p>
          <p>We acknowledge that the fee calculation contained an error and will refund 4,196 NOK to your account within 5 business days.</p>
          <p>We apologize for any inconvenience caused.</p>
          <p>Best regards,<br>Privacy Team</p>
        `;
        break;
      case 'violation':
        bodyHtml = `
          <p>Thank you for your request.</p>
          <p>We cannot provide the requested documentation as it is not required under Norwegian law.</p>
          <p>We refuse to adjust the fees as they are correctly calculated.</p>
          <p>Best regards,<br>Legal Department</p>
        `;
        break;
      case 'neutral':
        bodyHtml = `
          <p>Thank you for your GDPR request.</p>
          <p>Please find attached the requested information.</p>
          <p>If you have any questions, please contact us.</p>
          <p>Best regards,<br>Customer Service</p>
        `;
        break;
    }

    await commHub.processInboundEmail(
      fromEmail,
      toEmail,
      subject,
      bodyHtml,
      bodyHtml.replace(/<[^>]*>/g, ''),
      `sim-${Date.now()}@kredinor.no`,
      undefined
    );

    res.json({
      success: true,
      message: `Simulated ${responseType} response processed`,
      responseType
    });
  } catch (error) {
    console.error('Simulation failed:', error);
    res.status(500).json({
      error: 'Failed to simulate response',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Email metrics for analytics
app.get('/metrics', async (req, res) => {
  try {
    const [
      totalEmails,
      sentToday,
      pendingApproval,
      responseRate,
      avgResponseTime,
      admissionRate
    ] = await Promise.all([
      prisma.platformEmail.count(),
      prisma.platformEmail.count({
        where: {
          sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.platformEmail.count({
        where: { status: 'pending_approval' }
      }),
      prisma.platformEmail.count({
        where: { status: 'responded' }
      }).then(async (responded) => {
        const sent = await prisma.platformEmail.count({
          where: { direction: 'outbound', status: { in: ['sent', 'responded'] } }
        });
        return sent > 0 ? (responded / sent * 100) : 0;
      }),
      prisma.platformEmail.findMany({
        where: {
          status: 'responded',
          sentAt: { not: null },
          respondedAt: { not: null }
        },
        select: { sentAt: true, respondedAt: true }
      }).then(emails => {
        if (emails.length === 0) return 0;
        const totalHours = emails.reduce((sum, email) => {
          const hours = (email.respondedAt!.getTime() - email.sentAt!.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);
        return Math.round(totalHours / emails.length);
      }),
      prisma.platformEmail.count({
        where: {
          direction: 'inbound',
          metadata: {
            contains: 'admissions'
          }
        }
      }).then(async (withAdmissions) => {
        const totalInbound = await prisma.platformEmail.count({
          where: { direction: 'inbound' }
        });
        return totalInbound > 0 ? (withAdmissions / totalInbound * 100) : 0;
      })
    ]);

    res.json({
      success: true,
      metrics: {
        totalEmails,
        sentToday,
        pendingApproval,
        responseRate: Math.round(responseRate),
        avgResponseTimeHours: avgResponseTime,
        admissionRate: Math.round(admissionRate)
      }
    });
  } catch (error) {
    console.error('Metrics failed:', error);
    res.status(500).json({
      error: 'Failed to get metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Event listeners
commHub.on('user-authorized', ({ userId, creditorId, platformEmail }) => {
  console.log(`👤 User ${userId} authorized for communication: ${platformEmail}`);
});

commHub.on('gdpr-generated', ({ email, requiresApproval }) => {
  console.log(`📧 GDPR generated: ${email.id}, requires approval: ${requiresApproval}`);
});

commHub.on('email-approved', ({ emailId, userId }) => {
  console.log(`✅ Email approved: ${emailId} by user ${userId}`);
});

commHub.on('email-sent', ({ email, messageId }) => {
  console.log(`📤 Email sent: ${email.id}, messageId: ${messageId}`);
});

commHub.on('response-received', ({ originalEmail, response, parsing }) => {
  console.log(`📨 Response received: ${response.id}, admissions: ${parsing.admissions.length}, violations: ${parsing.violations.length}`);
});

// Error handling
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`📧 Communication Hub listening on port ${port}`);
  console.log(`🔗 Platform emails: user-*@damocles.no`);
  console.log(`📥 Responses: responses@damocles.no`);
  console.log(`📊 Metrics: http://localhost:${port}/metrics`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Communication Hub...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down Communication Hub...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;