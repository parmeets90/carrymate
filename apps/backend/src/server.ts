import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './lib/prisma';

async function bootstrap(): Promise<void> {
  const app = createApp();

  // Bind 0.0.0.0 so PaaS load balancers (Render) can reach the container.
  const server = app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`🚀 ${env.APP_NAME} API listening on 0.0.0.0:${env.PORT}`);
    logger.info(`   Liveness: /healthz · Readiness: /health`);
    logger.info(`   Env: ${env.NODE_ENV}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    // Force-exit if not closed in time
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
