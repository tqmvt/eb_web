import * as Sentry from '@sentry/react';
// import { Integrations } from '@sentry/tracing';
// import history from '../history';

const DSN =
  process.env.REACT_APP_SENTRY_DSN || 'https://88c4306214fb4251bfa69b07af15ff6f@o1254078.ingest.sentry.io/6421819';
export class SentryLoggingService {
  static init() {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      debug: false,
      enabled: !!process.env.REACT_APP_SENTRY_DSN,
      release: 'main',
      // integrations: [
      //   new Integrations.BrowserTracing({
      //     routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
      //   }),
      // ],
      normalizeDepth: 20,
      tracesSampleRate: 1.0,
    });
  }
}
