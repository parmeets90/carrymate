import 'dotenv/config';
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

  // Auth (used from Phase 1)
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

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
