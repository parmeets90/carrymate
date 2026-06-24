import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';

/**
 * Environment validation. The server refuses to boot with invalid config.
 * Integration keys are optional in early phases and become required as features
 * are turned on via their feature flags.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_NAME: z.string().default('CarryMate'),
  APP_VERSION: z.string().default('0.1.0'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),

  // Auth / JWT (used from Phase 1)
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_ACCESS_EXPIRY: z.string().default('1h'),
  // Long, rotating refresh window: with client-side auto-refresh this keeps an
  // active session alive until the user explicitly signs out.
  JWT_REFRESH_EXPIRY: z.string().default('90d'),

  // OTP
  OTP_EXPIRY_MINUTES: z.coerce.number().int().positive().default(10),
  OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(6),

  // Test-number bypass: comma-separated E.164 numbers that skip Twilio and accept
  // OTP_TEST_CODE (default 000000). Lets you sign in as demo users without SMS.
  // Only numbers explicitly listed here are affected; everything else uses Twilio.
  OTP_TEST_NUMBERS: z.string().optional(),
  OTP_TEST_CODE: z.string().default('000000'),

  // OTP via Twilio Verify. Blank in dev → OTPs are logged to the console instead of sent.
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(), // legacy (Messages); unused with Verify
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),

  // Storage (Supabase Storage). Provider-abstracted; Azure can replace it later.
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STORAGE_BUCKET: z.string().default('carrymate'),

  // Push notifications (FCM legacy HTTP). Blank → push is logged, not sent.
  FCM_SERVER_KEY: z.string().optional(),

  // Razorpay (real payments). Only used when ENABLE_REAL_PAYMENTS is on.
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // IDFY (automated KYC). Used only when ENABLE_AUTO_KYC is on AND these are set;
  // otherwise KYC falls back to manual admin review.
  IDFY_BASE_URL: z.string().optional(),
  IDFY_API_KEY: z.string().optional(),
  IDFY_ACCOUNT_ID: z.string().optional(),

  // AviationStack (flight/PNR check). Blank → flights verified manually by admin.
  AVIATIONSTACK_API_KEY: z.string().optional(),

  // Didit hosted KYC. Blank → KYC falls back to manual upload + admin review.
  DIDIT_API_KEY: z.string().optional(),
  DIDIT_WORKFLOW_ID: z.string().optional(),
  DIDIT_WEBHOOK_SECRET: z.string().optional(),
  DIDIT_BASE_URL: z.string().default('https://verification.didit.me'),

  // Firebase Admin (verifies Google/Firebase login tokens). Blank → Google
  // sign-in is disabled; phone-OTP login still works.
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // CORS: comma-separated origin allowlist (e.g. admin web URLs). Enforced in
  // production; dev/test reflect any origin so local tooling just works.
  // Mobile/native and server-to-server clients send no Origin and are always allowed.
  CORS_ORIGINS: z.string().optional(),

  // Observability (Sentry). Blank → error tracking is a no-op (dev/local).
  SENTRY_DSN: z.string().optional(),
  // 0 = errors only (no perf tracing). Raise toward 1 to sample transactions.
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0),

  // Feature flags (off by default; flipped per phase)
  ENABLE_REAL_PAYMENTS: z.coerce.boolean().default(false),
  ENABLE_AUTO_KYC: z.coerce.boolean().default(false),
  ENABLE_CHAT: z.coerce.boolean().default(true),
  ENABLE_CANADA: z.coerce.boolean().default(false),
  ENABLE_USA: z.coerce.boolean().default(false),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';

/**
 * JWT secrets are mandatory in production. In dev/test we generate ephemeral
 * secrets if they're missing so the app runs out of the box (tokens won't
 * survive a restart — fine for local work).
 */
function resolveJwtSecret(value: string | undefined, name: string): string {
  if (value && value.length >= 16) return value;
  if (isProd) {
    // eslint-disable-next-line no-console
    console.error(`❌ ${name} must be set (min 16 chars) in production.`);
    process.exit(1);
  }
  // eslint-disable-next-line no-console
  console.warn(`⚠️  ${name} not set — using an ephemeral dev secret.`);
  return randomBytes(32).toString('hex');
}

export const jwtConfig = {
  accessSecret: resolveJwtSecret(env.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET'),
  refreshSecret: resolveJwtSecret(env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
  accessExpiry: env.JWT_ACCESS_EXPIRY,
  refreshExpiry: env.JWT_REFRESH_EXPIRY,
};

/** True when Sentry error tracking is configured; otherwise capture is a no-op. */
export const isSentryConfigured = Boolean(env.SENTRY_DSN);

/** True when Twilio Verify is configured; otherwise OTPs are logged to console (dev). */
export const isTwilioVerifyConfigured = Boolean(
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_VERIFY_SERVICE_SID,
);

/** True when object storage (Supabase) is configured. */
export const isStorageConfigured = Boolean(
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY,
);

/** True when push (FCM) is configured; otherwise pushes are logged, not sent. */
export const isPushConfigured = Boolean(env.FCM_SERVER_KEY);

/** True when automated KYC (IDFY) is fully configured; else KYC is manual. */
export const isIdfyConfigured = Boolean(
  env.ENABLE_AUTO_KYC && env.IDFY_BASE_URL && env.IDFY_API_KEY && env.IDFY_ACCOUNT_ID,
);

/** True when AviationStack is configured; else flights are verified manually. */
export const isAviationStackConfigured = Boolean(env.AVIATIONSTACK_API_KEY);

/** True when Didit hosted KYC is configured; else KYC is manual upload + review. */
export const isDiditConfigured = Boolean(env.DIDIT_API_KEY && env.DIDIT_WORKFLOW_ID);

/** True when Firebase Admin is configured; else Google sign-in is disabled. */
export const isFirebaseConfigured = Boolean(
  env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY,
);
