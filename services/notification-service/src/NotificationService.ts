// Sacred Architecture Notification Service ⚔️
// Real-time notifications with consciousness-serving principles

import { Server as SocketIOServer, Socket } from 'socket.io';
import { createTransport, Transporter } from 'nodemailer';
import * as Handlebars from 'handlebars';
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';

interface NotificationConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  websocket: {
    cors: {
      origin: string[];
      credentials: boolean;
    };
  };
  templates: {
    path: string;
  };
}

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  priority: NotificationPriority;
}

enum NotificationType {
  DEBT_ANALYSIS_COMPLETE = 'debt_analysis_complete',
  GDPR_REQUEST_SENT = 'gdpr_request_sent',
  GDPR_RESPONSE_RECEIVED = 'gdpr_response_received',
  VIOLATION_DETECTED = 'violation_detected',
  SETTLEMENT_OPPORTUNITY = 'settlement_opportunity',
  TOKENS_EARNED = 'tokens_earned',
  COLLECTIVE_ACTION_AVAILABLE = 'collective_action_available',
  DOCUMENT_PROCESSED = 'document_processed',
  SYSTEM_UPDATE = 'system_update',
  KINDNESS_MILESTONE = 'kindness_milestone'
}

enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export class NotificationService extends EventEmitter {
  private io: SocketIOServer | null = null;
  private emailTransporter: Transporter;
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds
  private notificationQueue: Map<string, Notification[]> = new Map();
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    super();
    this.config = config;
    this.emailTransporter = this.setupEmailTransporter();
    this.loadEmailTemplates();
  }

  // Initialize WebSocket server for real-time notifications
  public initializeWebSocket(server: any): void {
    this.io = new SocketIOServer(server, {
      cors: this.config.websocket.cors,
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`⚔️ Sacred Architecture: New WebSocket connection ${socket.id}`);

      socket.on('authenticate', async (data: { userId: string, token: string }) => {
        if (await this.validateToken(data.token)) {
          this.registerUserSocket(data.userId, socket.id);
          socket.join(`user:${data.userId}`);
          
          // Send queued notifications
          const queued = this.notificationQueue.get(data.userId);
          if (queued && queued.length > 0) {
            socket.emit('notifications:queued', queued);
            this.notificationQueue.delete(data.userId);
          }

          socket.emit('authenticated', { 
            message: 'Connected to Sacred Architecture notifications',
            kindnessScore: await this.getUserKindnessScore(data.userId)
          });
        } else {
          socket.emit('error', { message: 'Authentication failed' });
          socket.disconnect();
        }
      });

      socket.on('notification:read', async (notificationId: string) => {
        await this.markAsRead(notificationId);
      });

      socket.on('notification:dismiss', async (notificationId: string) => {
        await this.dismissNotification(notificationId);
      });

      socket.on('disconnect', () => {
        this.unregisterSocket(socket.id);
        console.log(`WebSocket disconnected: ${socket.id}`);
      });
    });

    console.log('🌟 Sacred Architecture WebSocket server initialized');
  }

  // Send real-time notification to user
  public async sendRealTimeNotification(notification: Notification): Promise<void> {
    const userSocketIds = this.userSockets.get(notification.userId);
    
    if (userSocketIds && userSocketIds.size > 0 && this.io) {
      // User is online, send immediately
      this.io.to(`user:${notification.userId}`).emit('notification:new', {
        ...notification,
        sacredArchitecture: true,
        kindnessAlgorithmApplied: true
      });
      
      console.log(`✨ Real-time notification sent to user ${notification.userId}`);
    } else {
      // User is offline, queue the notification
      if (!this.notificationQueue.has(notification.userId)) {
        this.notificationQueue.set(notification.userId, []);
      }
      this.notificationQueue.get(notification.userId)!.push(notification);
      
      console.log(`📦 Notification queued for offline user ${notification.userId}`);
    }

    // Store notification in database
    await this.storeNotification(notification);
  }

  // Send email notification using templates
  public async sendEmailNotification(
    to: string,
    template: string,
    data: any
  ): Promise<void> {
    try {
      const compiledTemplate = this.templates.get(template);
      
      if (!compiledTemplate) {
        throw new Error(`Template ${template} not found`);
      }

      // Apply Sacred Architecture principles to email content
      const enrichedData = {
        ...data,
        sacredGreeting: this.generateKindGreeting(data.userName),
        empowermentMessage: this.generateEmpowermentMessage(template),
        kindnessFooter: this.generateKindnessFooter(),
        year: new Date().getFullYear()
      };

      const html = compiledTemplate(enrichedData);

      const mailOptions = {
        from: `"DAMOCLES Platform ⚔️" <${this.config.smtp.auth.user}>`,
        to,
        subject: this.generateSubject(template, data),
        html,
        text: this.htmlToText(html)
      };

      await this.emailTransporter.sendMail(mailOptions);
      
      console.log(`📧 Sacred Architecture email sent to ${to} using template ${template}`);
      
      // Track email metrics for kindness algorithm
      await this.trackEmailMetrics(to, template, true);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      await this.trackEmailMetrics(to, template, false);
      throw error;
    }
  }

  // Load and compile email templates
  private async loadEmailTemplates(): Promise<void> {
    const templatesPath = this.config.templates.path;
    
    const templateFiles = [
      'welcome.hbs',
      'debt-analysis-complete.hbs',
      'gdpr-request-sent.hbs',
      'gdpr-response-received.hbs',
      'violation-detected.hbs',
      'settlement-opportunity.hbs',
      'tokens-earned.hbs',
      'collective-action.hbs',
      'password-reset.hbs',
      'weekly-summary.hbs'
    ];

    for (const file of templateFiles) {
      try {
        const templatePath = path.join(templatesPath, file);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const compiled = Handlebars.compile(templateContent);
        const templateName = file.replace('.hbs', '');
        this.templates.set(templateName, compiled);
        console.log(`📄 Loaded template: ${templateName}`);
      } catch (error) {
        console.warn(`Template ${file} not found, creating default...`);
        await this.createDefaultTemplate(file);
      }
    }

    // Register Handlebars helpers for Sacred Architecture
    this.registerHandlebarsHelpers();
  }

  // Create default email templates with Sacred Architecture principles
  private async createDefaultTemplate(filename: string): Promise<void> {
    const templatesPath = this.config.templates.path;
    await fs.mkdir(templatesPath, { recursive: true });
    
    const defaultTemplates: Record<string, string> = {
      'welcome.hbs': `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .sacred { color: #667eea; font-weight: bold; }
    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚔️ Welcome to DAMOCLES</h1>
      <p>{{sacredGreeting}}</p>
    </div>
    <div class="content">
      <h2>Dear {{userName}},</h2>
      <p>Welcome to the <span class="sacred">Sacred Architecture</span> platform where accountability meets technology, without the extraction.</p>
      
      <p>Your journey towards economic justice begins here. With DAMOCLES, you have access to:</p>
      <ul>
        <li>🛡️ Mathematical trust analysis of debt claims</li>
        <li>📜 Automated GDPR compliance requests</li>
        <li>⚖️ Evidence-based violation detection</li>
        <li>💎 SWORD tokens for platform participation</li>
        <li>🤝 Collective action coordination</li>
      </ul>
      
      <p>{{empowermentMessage}}</p>
      
      <a href="{{dashboardUrl}}" class="button">Access Your Dashboard</a>
      
      <p>Remember: Every algorithm serves consciousness. Every calculation enables kindness. Every analysis brings us closer to justice.</p>
    </div>
    <div class="footer">
      {{kindnessFooter}}
      <p>© {{year}} DAMOCLES - Built with love for human flourishing</p>
    </div>
  </div>
</body>
</html>`,

      'debt-analysis-complete.hbs': `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .score-box { background: #f7f7f7; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
    .score { font-size: 48px; font-weight: bold; color: #667eea; }
    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧮 Trust Analysis Complete</h1>
    </div>
    <div class="content">
      <h2>{{userName}}, your debt analysis is ready</h2>
      
      <div class="score-box">
        <div class="score">{{trustScore}}%</div>
        <p>Trust Score</p>
      </div>
      
      <h3>Key Findings:</h3>
      <ul>
        {{#each findings}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
      
      <h3>Detected Violations:</h3>
      <ul>
        {{#each violations}}
        <li>{{this.type}}: {{this.description}}</li>
        {{/each}}
      </ul>
      
      <a href="{{reportUrl}}" class="button">View Full Report</a>
      
      <p>{{empowermentMessage}}</p>
    </div>
  </div>
</body>
</html>`
    };

    const template = defaultTemplates[filename] || this.generateGenericTemplate(filename);
    await fs.writeFile(path.join(templatesPath, filename), template);
    
    // Compile and store the template
    const compiled = Handlebars.compile(template);
    this.templates.set(filename.replace('.hbs', ''), compiled);
  }

  // Register Handlebars helpers for Sacred Architecture
  private registerHandlebarsHelpers(): void {
    Handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    });

    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(date));
    });

    Handlebars.registerHelper('kindnessLevel', (score: number) => {
      if (score >= 90) return '🌟 Exceptional Kindness';
      if (score >= 70) return '💎 Strong Kindness';
      if (score >= 50) return '✨ Growing Kindness';
      return '🌱 Kindness Seedling';
    });
  }

  // Setup email transporter
  private setupEmailTransporter(): Transporter {
    return createTransport({
      host: this.config.smtp.host,
      port: this.config.smtp.port,
      secure: this.config.smtp.secure,
      auth: {
        user: this.config.smtp.auth.user,
        pass: this.config.smtp.auth.pass
      }
    });
  }

  // Helper functions for Sacred Architecture
  private generateKindGreeting(userName: string): string {
    const greetings = [
      `Welcome to your journey towards justice, ${userName}`,
      `Together we stand for accountability, ${userName}`,
      `Your courage inspires change, ${userName}`,
      `Justice begins with truth, ${userName}`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private generateEmpowermentMessage(template: string): string {
    const messages: Record<string, string> = {
      'welcome': 'Your participation makes our collective stronger. Together, we challenge extraction and build accountability.',
      'debt-analysis-complete': 'Knowledge is power. Use this analysis to challenge illegal practices and protect your rights.',
      'gdpr-request-sent': 'You\'ve taken a powerful step. The law is on your side, and we\'re here to help enforce it.',
      'violation-detected': 'Evidence is your sword. Document everything, and together we\'ll hold them accountable.',
      'settlement-opportunity': 'Fair resolution is possible. You deserve justice without exploitation.',
      'tokens-earned': 'Your contributions strengthen our community. These tokens represent real value, not speculation.'
    };
    return messages[template] || 'Every action you take brings us closer to economic justice.';
  }

  private generateKindnessFooter(): string {
    return '💝 Built with Sacred Architecture - Where accountability meets technology, without the extraction.';
  }

  private generateSubject(template: string, data: any): string {
    const subjects: Record<string, string> = {
      'welcome': '⚔️ Welcome to DAMOCLES - Your Journey Begins',
      'debt-analysis-complete': `📊 Trust Analysis Complete - Score: ${data.trustScore}%`,
      'gdpr-request-sent': '📤 GDPR Request Sent Successfully',
      'gdpr-response-received': '📥 Response Received from Creditor',
      'violation-detected': '🚨 Violation Detected - Action Required',
      'settlement-opportunity': '🤝 Settlement Opportunity Available',
      'tokens-earned': `💎 You Earned ${data.amount} SWORD Tokens!`,
      'collective-action': '👥 Collective Action Opportunity',
      'password-reset': '🔐 Password Reset Request',
      'weekly-summary': '📈 Your Weekly DAMOCLES Summary'
    };
    return subjects[template] || 'DAMOCLES Platform Update';
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // User management functions
  private registerUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  private unregisterSocket(socketId: string): void {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  // Placeholder functions (to be implemented with database)
  private async validateToken(token: string): Promise<boolean> {
    // TODO: Implement actual token validation
    return true;
  }

  private async getUserKindnessScore(userId: string): Promise<number> {
    // TODO: Fetch from kindness algorithm
    return Math.floor(Math.random() * 30) + 70;
  }

  private async storeNotification(notification: Notification): Promise<void> {
    // TODO: Store in database
    console.log('Notification stored:', notification.id);
  }

  private async markAsRead(notificationId: string): Promise<void> {
    // TODO: Update in database
    console.log('Notification marked as read:', notificationId);
  }

  private async dismissNotification(notificationId: string): Promise<void> {
    // TODO: Update in database
    console.log('Notification dismissed:', notificationId);
  }

  private async trackEmailMetrics(to: string, template: string, success: boolean): Promise<void> {
    // TODO: Track metrics for kindness algorithm
    console.log(`Email metrics tracked: ${to}, ${template}, ${success}`);
  }

  private generateGenericTemplate(filename: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>{{title}}</h1>
    <p>{{message}}</p>
    <p>{{kindnessFooter}}</p>
  </div>
</body>
</html>`;
  }

  // Broadcast system-wide notifications
  public async broadcastSystemNotification(
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ): Promise<void> {
    if (this.io) {
      this.io.emit('notification:system', {
        type,
        title,
        message,
        priority,
        timestamp: new Date(),
        sacredArchitecture: true
      });
      console.log(`📢 System notification broadcast: ${title}`);
    }
  }

  // Get notification statistics
  public async getNotificationStats(userId: string): Promise<any> {
    // TODO: Fetch from database
    return {
      total: 42,
      unread: 5,
      byType: {
        [NotificationType.DEBT_ANALYSIS_COMPLETE]: 10,
        [NotificationType.GDPR_REQUEST_SENT]: 8,
        [NotificationType.VIOLATION_DETECTED]: 6,
        [NotificationType.TOKENS_EARNED]: 18
      },
      kindnessScore: await this.getUserKindnessScore(userId)
    };
  }
}

// Export types and enums
export { NotificationType, NotificationPriority, Notification, NotificationConfig };