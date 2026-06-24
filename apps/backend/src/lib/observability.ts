import * as Sentry from '@sentry/node';
import { env, isSentryConfigured } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Error tracking + alerting via Sentry. Entirely config-gated: with no SENTRY_DSN
 * every function here is a cheap no-op, so dev/local and unconfigured deploys are
 * unaffected. Initialised once, as early as possible, from server bootstrap.
 */
let initialised = false;

export function initObservability(): void {
  if (initialised || !isSentryConfigured) return;
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    release: env.APP_VERSION,
    // 0 by default → errors only. PII is never sent unless explicitly attached.
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
    sendDefaultPii: false,
  });
  initialised = true;
  logger.info('[observability] Sentry error tracking enabled');
}

/** Report a server-side fault with optional request/user context. No-op if unconfigured. */
export function captureException(
  err: unknown,
  context?: { requestId?: string; userId?: string; method?: string; path?: string },
): void {
  if (!initialised) return;
  Sentry.withScope((scope) => {
    if (context?.requestId) scope.setTag('request_id', context.requestId);
    if (context?.userId) scope.setUser({ id: context.userId });
    if (context?.method || context?.path) {
      scope.setContext('request', { method: context.method, path: context.path });
    }
    Sentry.captureException(err);
  });
}

/** Flush buffered events on shutdown so nothing is lost on SIGTERM. */
export async function flushObservability(timeoutMs = 2000): Promise<void> {
  if (!initialised) return;
  try {
    await Sentry.flush(timeoutMs);
  } catch {
    /* best-effort */
  }
}
