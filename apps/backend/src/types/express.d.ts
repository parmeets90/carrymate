import type { User } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by the `authenticate` middleware. */
      user?: User;
      /** Correlation id for this request (echoed as the X-Request-Id header). */
      id?: string;
    }
  }
}

export {};
