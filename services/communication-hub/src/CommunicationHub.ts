import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import nodemailer from 'nodemailer';
import { parse } from 'node-html-parser';

export interface PlatformEmail {
  id: string;
  userId: string;
  creditorId: string;
  direction: 'outbound' | 'inbound';
  fromEmail: string;
  toEmail: string;
  ccEmails?: string[];
  subject: string;
  bodyHtml: string;
  bodyText: string;
  templateUsed?: string;
  userApproved: boolean;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'delivered' | 'responded' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  respondedAt?: Date;
  trackingId: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAuthorization {
  id: string;
  userId: string;
  creditorId?: string; // If null, applies to all creditors
  scope: string[]; // ['send_gdpr', 'receive_responses', 'follow_up']
  platformEmail: string; // user-12345@damocles.no
  replyToEmail: string; // responses@damocles.no
  ccUserEmail: boolean;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface EmailParsing {
  admissions: string[];
  violations: string[];
  refundOffers: string[];
  newDocuments: string[];
  legalThreats: string[];
  escalationTriggers: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'hostile';
  requiresHumanReview: boolean;
}

export class CommunicationHub extends EventEmitter {
  private prisma: PrismaClient;
  private transporter: nodemailer.Transporter;
  private domain: string;

  constructor(prismaClient?: PrismaClient) {
    super();
    this.prisma = prismaClient || new PrismaClient();
    this.domain = process.env.PLATFORM_DOMAIN || 'damocles.no';
    this.setupEmailTransporter();
  }

  private setupEmailTransporter() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Create user authorization for platform communication
   */
  async authorizeUserCommunication(
    userId: string,
    creditorId?: string,
    scope: string[] = ['send_gdpr', 'receive_responses']
  ): Promise<UserAuthorization> {
    const platformEmail = `user-${userId.slice(-8)}@${this.domain}`;
    const replyToEmail = `responses@${this.domain}`;

    const authorization: Omit<UserAuthorization, 'id' | 'createdAt'> = {
      userId,
      creditorId,
      scope,
      platformEmail,
      replyToEmail,
      ccUserEmail: true,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true
    };

    const created = await this.prisma.userAuthorization.create({
      data: {
        ...authorization,
        id: this.generateAuthorizationId(),
        createdAt: new Date()
      }
    });

    this.emit('user-authorized', { userId, creditorId, platformEmail });
    return created as UserAuthorization;
  }

  /**
   * Send platform-managed GDPR request
   */
  async sendGDPRRequest(
    userId: string,
    creditorId: string,
    template: string,
    customizations?: any
  ): Promise<PlatformEmail> {
    // Get user authorization
    const authorization = await this.getUserAuthorization(userId, creditorId);
    if (!authorization) {
      throw new Error('User not authorized for platform communication');
    }

    // Get user and creditor details
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const creditor = await this.prisma.creditor.findUnique({ where: { id: creditorId } });

    if (!user || !creditor) {
      throw new Error('User or creditor not found');
    }

    // Generate optimal GDPR content using learning system
    const optimalStrategy = await this.getOptimalStrategy(creditorId);
    const gdprContent = await this.generateOptimizedGDPRContent(
      user, creditor, template, optimalStrategy, customizations
    );

    // Create email record
    const email: Omit<PlatformEmail, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      creditorId,
      direction: 'outbound',
      fromEmail: authorization.platformEmail,
      toEmail: creditor.privacyEmail || `privacy@${creditor.name.toLowerCase().replace(/\s+/g, '')}.no`,
      ccEmails: authorization.ccUserEmail ? [user.email] : undefined,
      subject: `GDPR Article 15 Request - ${this.generateReferenceId()}`,
      bodyHtml: gdprContent.html,
      bodyText: gdprContent.text,
      templateUsed: template,
      userApproved: false, // Requires approval first
      status: 'pending_approval',
      trackingId: this.generateTrackingId(),
      metadata: {
        strategy: optimalStrategy,
        customizations,
        generatedAt: new Date().toISOString()
      }
    };

    const createdEmail = await this.prisma.platformEmail.create({
      data: {
        ...email,
        id: this.generateEmailId(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Notify user for approval
    await this.requestUserApproval(createdEmail as PlatformEmail);

    this.emit('gdpr-generated', { email: createdEmail, requiresApproval: true });
    return createdEmail as PlatformEmail;
  }

  /**
   * User approves outbound email
   */
  async approveEmail(emailId: string, userId: string): Promise<void> {
    const email = await this.prisma.platformEmail.findUnique({
      where: { id: emailId }
    });

    if (!email || email.userId !== userId) {
      throw new Error('Email not found or not authorized');
    }

    if (email.status !== 'pending_approval') {
      throw new Error('Email not in pending approval status');
    }

    // Update status and send
    await this.prisma.platformEmail.update({
      where: { id: emailId },
      data: {
        status: 'approved',
        userApproved: true,
        updatedAt: new Date()
      }
    });

    // Actually send the email
    await this.sendApprovedEmail(email as PlatformEmail);

    this.emit('email-approved', { emailId, userId });
  }

  /**
   * Process inbound email response
   */
  async processInboundEmail(
    fromEmail: string,
    toEmail: string,
    subject: string,
    bodyHtml: string,
    bodyText: string,
    messageId: string,
    inReplyTo?: string
  ): Promise<void> {
    // Parse platform email to find user
    const userMatch = toEmail.match(/user-(\w+)@/);
    const isResponsesEmail = toEmail.includes('responses@');

    if (!userMatch && !isResponsesEmail) {
      console.log('Email not for platform processing');
      return;
    }

    // Find original outbound email
    const originalEmail = inReplyTo
      ? await this.prisma.platformEmail.findFirst({
          where: { messageId: inReplyTo }
        })
      : await this.prisma.platformEmail.findFirst({
          where: {
            toEmail: fromEmail,
            direction: 'outbound',
            status: 'sent'
          },
          orderBy: { sentAt: 'desc' }
        });

    if (!originalEmail) {
      console.log('Could not find original outbound email');
      return;
    }

    // Create inbound email record
    const inboundEmail: Omit<PlatformEmail, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: originalEmail.userId,
      creditorId: originalEmail.creditorId,
      direction: 'inbound',
      fromEmail,
      toEmail,
      subject,
      bodyHtml,
      bodyText,
      userApproved: true, // Inbound emails are auto-approved
      status: 'delivered',
      trackingId: this.generateTrackingId(),
      messageId,
      inReplyTo,
      deliveredAt: new Date(),
      metadata: {}
    };

    const createdInbound = await this.prisma.platformEmail.create({
      data: {
        ...inboundEmail,
        id: this.generateEmailId(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Mark original as responded
    await this.prisma.platformEmail.update({
      where: { id: originalEmail.id },
      data: {
        status: 'responded',
        respondedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Parse response for admissions and violations
    const parsing = await this.parseEmailContent(bodyHtml, bodyText);

    // Update with parsing results
    await this.prisma.platformEmail.update({
      where: { id: createdInbound.id },
      data: {
        metadata: {
          ...createdInbound.metadata,
          parsing
        },
        updatedAt: new Date()
      }
    });

    // Forward to user
    await this.forwardResponseToUser(createdInbound as PlatformEmail, parsing);

    // Record learning event
    await this.recordResponseLearning(originalEmail as PlatformEmail, createdInbound as PlatformEmail, parsing);

    this.emit('response-received', {
      originalEmail: originalEmail as PlatformEmail,
      response: createdInbound as PlatformEmail,
      parsing
    });
  }

  /**
   * Get communication history for user
   */
  async getCommunicationHistory(userId: string, creditorId?: string): Promise<PlatformEmail[]> {
    const where: any = { userId };
    if (creditorId) {
      where.creditorId = creditorId;
    }

    const emails = await this.prisma.platformEmail.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return emails as PlatformEmail[];
  }

  /**
   * Get inbox summary for admin dashboard
   */
  async getInboxSummary(): Promise<{
    totalEmails: number;
    pendingApproval: number;
    sentToday: number;
    responsesReceived: number;
    admissionsDetected: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalEmails,
      pendingApproval,
      sentToday,
      responsesReceived,
      admissions
    ] = await Promise.all([
      this.prisma.platformEmail.count(),
      this.prisma.platformEmail.count({
        where: { status: 'pending_approval' }
      }),
      this.prisma.platformEmail.count({
        where: {
          sentAt: { gte: today },
          direction: 'outbound'
        }
      }),
      this.prisma.platformEmail.count({
        where: { direction: 'inbound' }
      }),
      this.prisma.platformEmail.count({
        where: {
          direction: 'inbound',
          metadata: {
            path: ['parsing', 'admissions'],
            array_contains: [{}]
          }
        }
      })
    ]);

    return {
      totalEmails,
      pendingApproval,
      sentToday,
      responsesReceived,
      admissionsDetected: admissions
    };
  }

  // Private helper methods
  private async getUserAuthorization(userId: string, creditorId?: string): Promise<UserAuthorization | null> {
    const authorization = await this.prisma.userAuthorization.findFirst({
      where: {
        userId,
        OR: [
          { creditorId },
          { creditorId: null } // General authorization
        ],
        isActive: true,
        validUntil: { gt: new Date() }
      }
    });

    return authorization as UserAuthorization | null;
  }

  private async getOptimalStrategy(creditorId: string): Promise<any> {
    // Integration with learning engine
    try {
      const response = await fetch(`http://learning-engine:8005/strategy/${creditorId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Learning engine unavailable, using default strategy');
    }

    return {
      strategy: 'gdpr_default',
      expectedSuccessRate: 0.2,
      triggerPhrases: ['Please provide information according to GDPR Article 15'],
      estimatedResponseTime: 720
    };
  }

  private async generateOptimizedGDPRContent(
    user: any,
    creditor: any,
    template: string,
    strategy: any,
    customizations?: any
  ): Promise<{ html: string; text: string }> {
    // This would integrate with the existing GDPR template system
    // but with learning-optimized content

    const referenceId = this.generateReferenceId();
    const legalDeadline = 30; // GDPR mandated

    const optimizedContent = `
    <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h2>GDPR Article 15 Request - ${referenceId}</h2>

      <p><strong>Date:</strong> ${new Date().toLocaleDateString('no-NO')}</p>
      <p><strong>Reference:</strong> ${referenceId}</p>

      <p><strong>To:</strong> ${creditor.name}<br/>
      Email: ${creditor.privacyEmail || 'privacy@' + creditor.name.toLowerCase().replace(/\s+/g, '') + '.no'}</p>

      <p><strong>From:</strong> ${user.email}</p>

      <hr style="margin: 30px 0;" />

      <h3>Request for Personal Data Access</h3>

      ${strategy.triggerPhrases.map((phrase: string) => `<p><strong>${phrase}</strong></p>`).join('')}

      <p>In accordance with GDPR Article 15, I request the following information:</p>

      <h4>1. Confirmation of Processing</h4>
      <p>Please confirm whether you process personal data concerning me.</p>

      <h4>2. Access to Personal Data</h4>
      <p>If you process personal data concerning me, please provide a copy of all personal data and the following information:</p>

      <ul>
        <li>The purposes of the processing</li>
        <li>The categories of personal data concerned</li>
        <li>The recipients or categories of recipients</li>
        <li>The envisaged period for storing the personal data</li>
        <li>Information about automated decision-making, including profiling</li>
        <li>The right to request rectification, erasure or restriction</li>
        <li>The right to lodge a complaint with the supervisory authority</li>
        <li>The source of the personal data if not collected directly from me</li>
      </ul>

      <h4>3. Delivery Format</h4>
      <p>I request the information to be provided electronically in a structured, commonly used and machine-readable format (JSON, Excel or PDF).</p>

      <h4>4. Response Deadline</h4>
      <p>According to GDPR Article 12(3), I expect a response within <strong>${legalDeadline} days</strong> of receipt of this request.</p>

      <p>Thank you for your prompt attention to this matter.</p>

      <p>Best regards,<br/>
      Sent via DAMOCLES Platform on behalf of registered user</p>

      <hr style="margin: 30px 0;" />

      <p style="font-size: 10px; color: #666;">
        <strong>Legal basis:</strong><br/>
        - GDPR Article 15 - Right of access<br/>
        - Norwegian Personal Data Act § 18<br/>
        - Consumer Protection Act
      </p>

      <p style="font-size: 10px; color: #666;">
        This request was generated by the DAMOCLES consumer protection platform under explicit user authorization.
        Reference: ${referenceId}
      </p>
    </div>`;

    return {
      html: optimizedContent,
      text: optimizedContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    };
  }

  private async sendApprovedEmail(email: PlatformEmail): Promise<void> {
    try {
      const mailOptions = {
        from: email.fromEmail,
        to: email.toEmail,
        cc: email.ccEmails,
        subject: email.subject,
        html: email.bodyHtml,
        text: email.bodyText,
        headers: {
          'X-Tracking-ID': email.trackingId,
          'X-Platform': 'DAMOCLES'
        }
      };

      const info = await this.transporter.sendMail(mailOptions);

      await this.prisma.platformEmail.update({
        where: { id: email.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          messageId: info.messageId,
          updatedAt: new Date()
        }
      });

      this.emit('email-sent', { email, messageId: info.messageId });

    } catch (error) {
      await this.prisma.platformEmail.update({
        where: { id: email.id },
        data: {
          status: 'failed',
          updatedAt: new Date(),
          metadata: {
            ...email.metadata,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      });

      this.emit('email-failed', { email, error });
      throw error;
    }
  }

  private async parseEmailContent(bodyHtml: string, bodyText: string): Promise<EmailParsing> {
    const content = (bodyText || bodyHtml).toLowerCase();

    // Admission detection patterns
    const admissionPatterns = [
      /we acknowledge/g,
      /we confirm/g,
      /error was made/g,
      /mistake occurred/g,
      /will refund/g,
      /will adjust/g,
      /fee was incorrect/g,
      /charge was improper/g
    ];

    // Violation indicators
    const violationPatterns = [
      /cannot provide/g,
      /no documentation/g,
      /not required to/g,
      /refuse to/g
    ];

    const admissions = admissionPatterns
      .flatMap(pattern => content.match(pattern) || [])
      .filter((value, index, self) => self.indexOf(value) === index);

    const violations = violationPatterns
      .flatMap(pattern => content.match(pattern) || [])
      .filter((value, index, self) => self.indexOf(value) === index);

    // Simple sentiment analysis
    const negativeWords = ['refuse', 'cannot', 'will not', 'reject', 'deny'];
    const positiveWords = ['acknowledge', 'confirm', 'agree', 'will provide', 'refund'];

    const negativeCount = negativeWords.filter(word => content.includes(word)).length;
    const positiveCount = positiveWords.filter(word => content.includes(word)).length;

    let sentiment: 'positive' | 'neutral' | 'negative' | 'hostile' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount + 1) sentiment = 'negative';
    else if (negativeCount > positiveCount + 3) sentiment = 'hostile';

    return {
      admissions,
      violations,
      refundOffers: content.match(/refund|reimburs/g) || [],
      newDocuments: content.match(/attach|document|file/g) || [],
      legalThreats: content.match(/legal action|court|lawsuit/g) || [],
      escalationTriggers: violations.length > 0 || admissions.length === 0 ? ['no_cooperation'] : [],
      sentiment,
      requiresHumanReview: violations.length > 2 || sentiment === 'hostile'
    };
  }

  private async forwardResponseToUser(email: PlatformEmail, parsing: EmailParsing): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: email.userId } });
    if (!user) return;

    const forwardContent = `
    <h2>📧 GDPR Response Received</h2>
    <p>You have received a response to your GDPR request.</p>

    ${parsing.admissions.length > 0 ? `
      <div style="background: #f0f9ff; padding: 15px; margin: 15px 0; border-left: 4px solid #0ea5e9;">
        <h3>✅ Admissions Detected</h3>
        <ul>${parsing.admissions.map(a => `<li>${a}</li>`).join('')}</ul>
      </div>
    ` : ''}

    ${parsing.violations.length > 0 ? `
      <div style="background: #fef2f2; padding: 15px; margin: 15px 0; border-left: 4px solid #ef4444;">
        <h3>⚠️ Potential Violations</h3>
        <ul>${parsing.violations.map(v => `<li>${v}</li>`).join('')}</ul>
      </div>
    ` : ''}

    <h3>Original Response:</h3>
    <div style="border: 1px solid #e5e5e5; padding: 15px; margin: 15px 0;">
      ${email.bodyHtml}
    </div>

    <p><strong>Next Steps:</strong> Our team will analyze this response and contact you with recommendations.</p>
    `;

    const mailOptions = {
      from: `noreply@${this.domain}`,
      to: user.email,
      subject: `📧 GDPR Response Received - ${parsing.admissions.length > 0 ? 'Admissions Found!' : 'Analysis Required'}`,
      html: forwardContent
    };

    await this.transporter.sendMail(mailOptions);
  }

  private async recordResponseLearning(
    originalEmail: PlatformEmail,
    responseEmail: PlatformEmail,
    parsing: EmailParsing
  ): Promise<void> {
    // Send to learning engine
    try {
      const responseTime = responseEmail.deliveredAt && originalEmail.sentAt
        ? (responseEmail.deliveredAt.getTime() - originalEmail.sentAt.getTime()) / (1000 * 60 * 60)
        : undefined;

      const learningEvent = {
        eventType: 'response_received',
        userId: originalEmail.userId,
        creditorId: originalEmail.creditorId,
        strategy: originalEmail.templateUsed || 'unknown',
        success: parsing.admissions.length > 0,
        responseTimeHours: responseTime,
        violationType: parsing.violations.length > 0 ? 'gdpr_non_compliance' : undefined,
        admissionText: parsing.admissions.join('; ') || undefined,
        metadata: {
          sentiment: parsing.sentiment,
          parsing,
          requiresHumanReview: parsing.requiresHumanReview
        }
      };

      await fetch('http://learning-engine:8005/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(learningEvent)
      });

    } catch (error) {
      console.warn('Failed to record learning event:', error);
    }
  }

  private async requestUserApproval(email: PlatformEmail): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: email.userId } });
    if (!user) return;

    const approvalContent = `
    <h2>📋 GDPR Request Ready for Approval</h2>
    <p>Your GDPR request has been generated and is ready to send.</p>

    <div style="border: 1px solid #e5e5e5; padding: 15px; margin: 15px 0;">
      <h3>Email Preview:</h3>
      <p><strong>To:</strong> ${email.toEmail}</p>
      <p><strong>Subject:</strong> ${email.subject}</p>
      <div style="max-height: 300px; overflow-y: auto; background: #f9f9f9; padding: 10px;">
        ${email.bodyHtml}
      </div>
    </div>

    <p>
      <a href="https://${this.domain}/approve-email/${email.id}"
         style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        ✅ Approve and Send
      </a>
    </p>

    <p>This email will be sent from your authorized platform address: ${email.fromEmail}</p>
    `;

    const mailOptions = {
      from: `noreply@${this.domain}`,
      to: user.email,
      subject: '📋 GDPR Request - Approval Required',
      html: approvalContent
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Utility methods
  private generateEmailId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAuthorizationId(): string {
    return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTrackingId(): string {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReferenceId(): string {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `GDPR-${timestamp}-${random}`;
  }
}

export default CommunicationHub;