import { Router } from 'express';
import { ok } from '../utils/response';
import { env } from '../config/env';
import { authRouter } from '../modules/auth/auth.routes';
import { accountRouter } from '../modules/account/account.routes';
import { kycRouter } from '../modules/kyc/kyc.routes';
import { adminRouter } from '../modules/admin/admin.routes';
import { routesRouter } from '../modules/routes/routes.routes';
import { requestsRouter } from '../modules/requests/requests.routes';
import { bidsRouter } from '../modules/bids/bids.routes';
import { ordersRouter } from '../modules/orders/orders.routes';
import { uploadsRouter } from '../modules/uploads/uploads.routes';
import { chatRouter } from '../modules/chat/chat.routes';
import { notificationsRouter } from '../modules/notifications/notifications.routes';
import { bankAccountRouter } from '../modules/bankaccount/bankaccount.routes';
import { usersRouter } from '../modules/users/users.routes';
import { razorpayWebhookRouter } from '../modules/payments/razorpay.webhook';
import { idfyWebhookRouter } from '../modules/kyc/idfy.webhook';
import { diditWebhookRouter } from '../modules/kyc/didit.webhook';

/**
 * Versioned API router. All feature modules mount under /v1.
 * The contract is additive — never break an existing endpoint; add new ones.
 */
export const v1Router = Router();

v1Router.get('/', (_req, res) => {
  ok(res, {
    name: env.APP_NAME,
    version: env.APP_VERSION,
    message: 'CarryMate API v1',
  });
});

v1Router.use('/auth', authRouter);
v1Router.use('/account', accountRouter);
v1Router.use('/kyc', kycRouter);
v1Router.use('/routes', routesRouter);
v1Router.use('/requests', requestsRouter);
v1Router.use('/bids', bidsRouter);
v1Router.use('/orders', ordersRouter);
v1Router.use('/uploads', uploadsRouter);
v1Router.use('/chat', chatRouter);
v1Router.use('/notifications', notificationsRouter);
v1Router.use('/bank-account', bankAccountRouter);
v1Router.use('/users', usersRouter);
v1Router.use('/webhooks', razorpayWebhookRouter);
v1Router.use('/webhooks', idfyWebhookRouter);
v1Router.use('/webhooks', diditWebhookRouter);
v1Router.use('/admin', adminRouter);
