import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: process.env.NODE_ENV || 'development',

  // Custom filtering
  beforeSend(event, hint) {
    // Don't send events for certain errors
    if (event.exception) {
      const values = event.exception.values || [];
      for (const value of values) {
        // Filter out database connection errors in development
        if (value.type === 'PrismaClientInitializationError' && process.env.NODE_ENV === 'development') {
          return null;
        }
      }
    }
    return event;
  },

  // Set server context
  initialScope: {
    tags: {
      'app.version': process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      'runtime': 'server',
    },
  },
});
