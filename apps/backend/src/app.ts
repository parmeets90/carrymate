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

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  // API is consumed cross-origin (admin web + mobile); don't let CORP block responses.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: true, // reflect the request origin (admin dev, prod admin, mobile)
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.options('*', cors());
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
