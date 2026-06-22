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
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // OTP
  OTP_EXPIRY_MINUTES: z.coerce.number().int().positive().default(10),
  OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(6),

  // OTP via Twilio Verify. Blank in dev → OTPs are logged to the console instead of sent.
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(), // legacy (Messages); unused with Verify
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),

  // Storage (Supabase Storage). Provider-abstracted; Azure can replace it later.
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STORAGE_BUCKET: z.string().default('carrymate'),

  // Feature flags (off by default; flipped per phase)
  ENABLE_REAL_PAYMENTS: z.coerce.boolean().default(false),
  ENABLE_AUTO_KYC: z.coerce.boolean().default(false),
  ENABLE_CHAT: z.coerce.boolean().default(false),
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

/** True when Twilio Verify is configured; otherwise OTPs are logged to console (dev). */
export const isTwilioVerifyConfigured = Boolean(
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_VERIFY_SERVICE_SID,
);

/** True when object storage (Supabase) is configured. */
export const isStorageConfigured = Boolean(
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY,
);
