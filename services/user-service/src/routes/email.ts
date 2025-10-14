import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { sendGDPREmail, generateEmailContent, processInboundEmail, InboundEmail } from '../services/emailService';
import { authenticateUser } from '../middleware/auth';

const prisma = new PrismaClient();

export async function emailRoutes(fastify: FastifyInstance) {
  // Send GDPR request via email
  fastify.post('/send-gdpr', {
    preHandler: authenticateUser
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { gdprRequestId } = request.body as { gdprRequestId: string };
      const userId = (request as any).user.userId;

      // Fetch GDPR request with all related data
      const gdprRequest = await prisma.gdprRequest.findUnique({
        where: { id: gdprRequestId },
        include: {
          user: true,
          creditor: true
        }
      });

      if (!gdprRequest) {
        return reply.status(404).send({ error: 'GDPR request not found' });
      }

      // Verify user owns this request
      if (gdprRequest.userId !== userId) {
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      // Check if already sent
      if (gdprRequest.status === 'sent') {
        return reply.status(400).send({ error: 'GDPR request already sent' });
      }

      if (!gdprRequest.content) {
        return reply.status(400).send({ error: 'GDPR request content not generated' });
      }

      // Generate email-friendly content
      const { html, text } = generateEmailContent(
        gdprRequest.content,
        gdprRequest.user.name || 'Bruker',
        gdprRequest.user.email
      );

      // Determine creditor email
      const creditorEmail = gdprRequest.creditor.privacyEmail ||
                          `privacy@${gdprRequest.creditor.name.toLowerCase().replace(/\s+/g, '')}.no`;

      // Send email
      const result = await sendGDPREmail({
        gdprRequestId: gdprRequest.id,
        toEmail: creditorEmail,
        toName: gdprRequest.creditor.name,
        subject: `GDPR Artikkel 15 Forespørsel - ${gdprRequest.referenceId}`,
        htmlContent: html,
        textContent: text,
        userEmail: gdprRequest.user.email,
        userName: gdprRequest.user.name || 'Bruker'
      });

      if (!result.success) {
        return reply.status(500).send({
          error: 'Failed to send email',
          details: result.error
        });
      }

      // Update GDPR request status
      const responseDue = new Date();
      responseDue.setDate(responseDue.getDate() + 30); // GDPR 30 day deadline

      await prisma.gdprRequest.update({
        where: { id: gdprRequestId },
        data: {
          status: 'sent',
          sentAt: new Date(),
          responseDue,
          vippsVerifiedAtSend: gdprRequest.user.vippsVerified
        }
      });

      return reply.send({
        success: true,
        message: 'GDPR request sent successfully',
        messageId: result.messageId,
        sentTo: creditorEmail,
        responseDue
      });

    } catch (error) {
      console.error('Error sending GDPR email:', error);
      return reply.status(500).send({ error: 'Failed to send GDPR request' });
    }
  });

  // Webhook endpoint for inbound emails from SendGrid
  fastify.post('/webhook/inbound', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // SendGrid sends form-encoded data
      const body = request.body as any;

      // Parse SendGrid webhook payload
      const inboundEmail: InboundEmail = {
        from: body.from,
        to: body.to,
        subject: body.subject,
        text: body.text || '',
        html: body.html || '',
        headers: JSON.parse(body.headers || '{}'),
        attachments: body.attachments ? JSON.parse(body.attachments) : []
      };

      // Process the inbound email
      await processInboundEmail(inboundEmail);

      return reply.status(200).send({ success: true });

    } catch (error) {
      console.error('Error processing inbound email webhook:', error);
      // Still return 200 to prevent SendGrid from retrying
      return reply.status(200).send({ success: false, error: 'Processing failed' });
    }
  });

  // Get email history for a GDPR request
  fastify.get('/gdpr/:requestId/emails', {
    preHandler: authenticateUser
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { requestId } = request.params as { requestId: string };
      const userId = (request as any).user.userId;

      // Verify user owns this request
      const gdprRequest = await prisma.gdprRequest.findUnique({
        where: { id: requestId }
      });

      if (!gdprRequest || gdprRequest.userId !== userId) {
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      // Get all emails for this GDPR request
      const emails = await prisma.platformEmail.findMany({
        where: {
          userId,
          metadata: {
            contains: requestId
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        select: {
          id: true,
          subject: true,
          status: true,
          sentAt: true,
          deliveredAt: true,
          respondedAt: true,
          trackingPixelViewed: true,
          createdAt: true
        }
      });

      return reply.send({ emails });

    } catch (error) {
      console.error('Error fetching email history:', error);
      return reply.status(500).send({ error: 'Failed to fetch email history' });
    }
  });
}
