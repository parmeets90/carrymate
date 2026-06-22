import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import {
  listConversations,
  getConversationForOrder,
  listMessages,
  sendMessage,
} from './chat.service';
import type { SendMessageInput } from './chat.validators';

export const getConversations: RequestHandler = async (req, res) => {
  ok(res, await listConversations(req.user!.id));
};

export const getOrderConversation: RequestHandler = async (req, res) => {
  ok(res, await getConversationForOrder(req.params.orderId!, req.user!.id));
};

export const getMessages: RequestHandler = async (req, res) => {
  ok(res, await listMessages(req.params.id!, req.user!.id));
};

export const postMessage: RequestHandler = async (req, res) => {
  const { body } = req.body as SendMessageInput;
  ok(res, await sendMessage(req.params.id!, req.user!.id, body), 201);
};
