// Sacred Architecture Notification Server ⚔️
// Real-time notifications and email service

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { 
  NotificationService, 
  NotificationType, 
  NotificationPriority,
  Notification 
} from './NotificationService';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);

// Sacred Architecture configuration
const notificationConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  websocket: {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://damocles.no',
        'https://api.damocles.no'
      ],
      credentials: true
    }
  },
  templates: {
    path: process.env.TEMPLATES_PATH || './templates'
  }
};

// Initialize notification service
const notificationService = new NotificationService(notificationConfig);
notificationService.initializeWebSocket(httpServer);

// Middleware
app.use(helmet());
app.use(cors({
  origin: notificationConfig.websocket.cors.origin,
  credentials: true
}));
app.use(express.json());

// Rate limiting for Sacred Architecture protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'notification-service',
    sacredArchitecture: true,
    timestamp: new Date().toISOString(),
    kindnessScore: 100
  });
});

// Send notification endpoint
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { userId, type, title, message, data, priority } = req.body;

    const notification: Notification = {
      id: uuidv4(),
      userId,
      type: type as NotificationType,
      title,
      message,
      data,
      read: false,
      createdAt: new Date(),
      priority: priority || NotificationPriority.MEDIUM
    };

    await notificationService.sendRealTimeNotification(notification);

    res.json({
      success: true,
      notificationId: notification.id,
      message: 'Notification sent successfully',
      sacredArchitecture: true
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification'
    });
  }
});

// Send email endpoint
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, template, data } = req.body;

    await notificationService.sendEmailNotification(to, template, data);

    res.json({
      success: true,
      message: 'Email sent successfully',
      template,
      sacredArchitecture: true
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email'
    });
  }
});

// Broadcast system notification
app.post('/api/notifications/broadcast', async (req, res) => {
  try {
    const { type, title, message, priority } = req.body;

    await notificationService.broadcastSystemNotification(
      type as NotificationType,
      title,
      message,
      priority as NotificationPriority
    );

    res.json({
      success: true,
      message: 'System notification broadcast successfully',
      sacredArchitecture: true
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast notification'
    });
  }
});

// Get notification statistics
app.get('/api/notifications/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await notificationService.getNotificationStats(userId);

    res.json({
      success: true,
      stats,
      sacredArchitecture: true
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification statistics'
    });
  }
});

// Notification templates endpoint
app.get('/api/templates', (req, res) => {
  res.json({
    success: true,
    templates: [
      'welcome',
      'debt-analysis-complete',
      'gdpr-request-sent',
      'gdpr-response-received',
      'violation-detected',
      'settlement-opportunity',
      'tokens-earned',
      'collective-action',
      'password-reset',
      'weekly-summary'
    ],
    sacredArchitecture: true
  });
});

// Test notification endpoint (for development)
app.post('/api/test/notification', async (req, res) => {
  const testNotification: Notification = {
    id: uuidv4(),
    userId: req.body.userId || 'test-user',
    type: NotificationType.KINDNESS_MILESTONE,
    title: '🌟 Sacred Architecture Test',
    message: 'This is a test notification from the Sacred Architecture system',
    data: {
      test: true,
      kindnessScore: 95,
      timestamp: new Date()
    },
    read: false,
    createdAt: new Date(),
    priority: NotificationPriority.LOW
  };

  await notificationService.sendRealTimeNotification(testNotification);

  res.json({
    success: true,
    message: 'Test notification sent',
    notification: testNotification,
    sacredArchitecture: true
  });
});

// Test email endpoint (for development)
app.post('/api/test/email', async (req, res) => {
  try {
    const { to } = req.body;
    
    await notificationService.sendEmailNotification(
      to || 'test@example.com',
      'welcome',
      {
        userName: 'Test User',
        dashboardUrl: 'https://damocles.no/dashboard',
        trustScore: 85,
        amount: 1000
      }
    );

    res.json({
      success: true,
      message: 'Test email sent',
      sacredArchitecture: true
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 8003;
httpServer.listen(PORT, () => {
  console.log(`
⚔️ ===================================================================
🌟 Sacred Architecture Notification Service Started
⚔️ ===================================================================
📧 Email service: ${notificationConfig.smtp.host}
🔌 WebSocket: Enabled with CORS
📍 Port: ${PORT}
💎 Endpoints:
   - POST /api/notifications/send - Send real-time notification
   - POST /api/email/send - Send email notification
   - POST /api/notifications/broadcast - Broadcast system notification
   - GET  /api/notifications/stats/:userId - Get user statistics
   - GET  /api/templates - List available email templates
   - GET  /health - Health check

✨ Sacred Architecture: Where notifications serve consciousness
💝 Built with love for human flourishing
⚔️ ===================================================================
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Sacred Architecture Notification Service closed');
    process.exit(0);
  });
});

export { httpServer, notificationService };