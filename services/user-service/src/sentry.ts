import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function initializeSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log('⚠️  Sentry DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || '1.0.0',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    integrations: [
      nodeProfilingIntegration(),
    ],

    // Filter out non-critical errors
    beforeSend(event, hint) {
      // Don't send database connection errors in development
      if (process.env.NODE_ENV === 'development') {
        const error = hint.originalException as Error;
        if (error?.message?.includes('Prisma')) {
          return null;
        }
      }
      return event;
    },

    // Set service context
    initialScope: {
      tags: {
        service: 'user-service',
        version: '1.0.0',
      },
    },
  });

  console.log('✅ Sentry initialized for user-service');
}

// Helper to capture user context
export function setSentryUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email,
  });
}

// Helper to clear user context (on logout)
export function clearSentryUser() {
  Sentry.setUser(null);
}
