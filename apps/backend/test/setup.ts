/**
 * Test bootstrap. Sets the minimum env the config layer validates at import time
 * so pure-logic modules can be imported without a real environment. No DB is
 * touched — Prisma only connects on the first query, which these unit tests avoid.
 */
process.env.NODE_ENV ??= 'test';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
process.env.DIDIT_WEBHOOK_SECRET ??= 'test-webhook-secret';
