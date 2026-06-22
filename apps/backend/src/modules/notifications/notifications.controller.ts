import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} from './notifications.service';

export const getNotifications: RequestHandler = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));
  ok(res, await listNotifications(req.user!.id, page, pageSize));
};

export const getUnread: RequestHandler = async (req, res) => {
  ok(res, { count: await getUnreadCount(req.user!.id) });
};

export const postMarkRead: RequestHandler = async (req, res) => {
  await markRead(req.user!.id, req.params.id!);
  ok(res, { ok: true });
};

export const postMarkAllRead: RequestHandler = async (req, res) => {
  const count = await markAllRead(req.user!.id);
  ok(res, { count });
};
