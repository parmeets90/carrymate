import { Router, type RequestHandler } from 'express';
import { env } from '../../config/env';
import { authenticate, requireKyc } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import { AppError } from '../../utils/errors';
import { sendMessageSchema } from './chat.validators';
import {
  getConversations,
  getOrderConversation,
  getMessages,
  postMessage,
} from './chat.controller';

/** Hard gate: chat can be turned off platform-wide via the ENABLE_CHAT flag. */
const requireChatEnabled: RequestHandler = (_req, _res, next) => {
  if (!env.ENABLE_CHAT) {
    throw new AppError(503, 'CHAT_DISABLED', 'In-app chat is currently unavailable.');
  }
  next();
};

export const chatRouter = Router();

chatRouter.use(requireChatEnabled, authenticate, requireKyc);

chatRouter.get('/conversations', getConversations);
chatRouter.get('/order/:orderId', getOrderConversation);
chatRouter.get('/conversations/:id/messages', getMessages);
chatRouter.post('/conversations/:id/messages', validateBody(sendMessageSchema), postMessage);
