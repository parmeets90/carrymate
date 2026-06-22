import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getNotifications,
  getUnread,
  postMarkRead,
  postMarkAllRead,
} from './notifications.controller';

export const notificationsRouter = Router();

// Any authenticated user can read/manage their own notifications (no KYC gate).
notificationsRouter.use(authenticate);

notificationsRouter.get('/', getNotifications);
notificationsRouter.get('/unread-count', getUnread);
notificationsRouter.post('/read-all', postMarkAllRead);
notificationsRouter.post('/:id/read', postMarkRead);
