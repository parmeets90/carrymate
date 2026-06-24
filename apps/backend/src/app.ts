import 'express-async-errors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { healthRouter } from './routes/health.route';
import { v1Router } from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import { isProd } from './config/env';
import { corsOptions } from './lib/cors';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  // API is consumed cross-origin (admin web + mobile); don't let CORP block responses.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Force HTTPS for a year (incl. subdomains) and allow preload-list inclusion.
      hsts: { maxAge: 31_536_000, includeSubDomains: true, preload: true },
      // This server only ever returns JSON — lock the CSP all the way down so a
      // reflected payload can never load scripts/styles/frames. No-op in dev to
      // keep error pages / tooling readable.
      contentSecurityPolicy: isProd
        ? { useDefaults: false, directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } }
        : false,
    }),
  );
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(compression());
  // Capture the raw body so webhook handlers can verify HMAC signatures.
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: true }));

  app.use(
    morgan(isProd ? 'combined' : 'dev', {
      stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) },
    }),
  );

  // Global rate limit (per-route limits added per feature)
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Health is unversioned and public
  app.use('/', healthRouter);

  // Versioned API
  app.use('/v1', v1Router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
