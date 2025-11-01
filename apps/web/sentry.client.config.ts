import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: process.env.NODE_ENV || 'development',

  // Replay configuration - session replay for debugging
  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional SDK configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Custom filtering
  beforeSend(event, hint) {
    // Filter out errors from browser extensions
    if (event.exception) {
      const values = event.exception.values || [];
      for (const value of values) {
        if (value.stacktrace) {
          const frames = value.stacktrace.frames || [];
          for (const frame of frames) {
            if (frame.filename && frame.filename.includes('chrome-extension://')) {
              return null;
            }
          }
        }
      }
    }
    return event;
  },

  // Set user context
  initialScope: {
    tags: {
      'app.version': process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    },
  },
});
