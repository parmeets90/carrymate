import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './lib/prisma';
import { runAutoConfirm } from './modules/orders/orders.service';
import { runPaymentReconciliation } from './jobs/payment-reconciliation';
import { runKycTimeoutSweep } from './jobs/kyc-timeout';

const AUTO_CONFIRM_INTERVAL_MS = 10 * 60_000; // every 10 min
const RECONCILIATION_INTERVAL_MS = 15 * 60_000; // every 15 min
const KYC_TIMEOUT_INTERVAL_MS = 5 * 60_000; // every 5 min

async function bootstrap(): Promise<void> {
  const app = createApp();

  // Bind 0.0.0.0 so PaaS load balancers (Render) can reach the container.
  const server = app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`🚀 ${env.APP_NAME} API listening on 0.0.0.0:${env.PORT}`);
    logger.info(`   Liveness: /healthz · Readiness: /health`);
    logger.info(`   Env: ${env.NODE_ENV}`);
  });

  // Escrow auto-confirm sweep (releases delivered orders past their window).
  const autoConfirmTimer = setInterval(() => {
    runAutoConfirm().catch((err) => logger.error('auto-confirm sweep failed', err));
  }, AUTO_CONFIRM_INTERVAL_MS);
  autoConfirmTimer.unref();

  // Payment reconciliation sweep (recovers stuck PENDING_PAYMENT orders).
  const reconciliationTimer = setInterval(() => {
    runPaymentReconciliation().catch((err) => logger.error('reconciliation sweep failed', err));
  }, RECONCILIATION_INTERVAL_MS);
  reconciliationTimer.unref();

  // KYC timeout watcher (rescues users stuck in VERIFYING if IDFY never calls back).
  const kycTimeoutTimer = setInterval(() => {
    runKycTimeoutSweep().catch((err) => logger.error('kyc timeout sweep failed', err));
  }, KYC_TIMEOUT_INTERVAL_MS);
  kycTimeoutTimer.unref();

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
