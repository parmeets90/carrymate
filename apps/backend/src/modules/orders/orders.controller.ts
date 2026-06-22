import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import { listMyOrders, getOrder, payOrder, releaseOrder } from './orders.service';

export const getMyOrders: RequestHandler = async (req, res) => {
  ok(res, await listMyOrders(req.user!.id));
};

export const getOrderById: RequestHandler = async (req, res) => {
  ok(res, await getOrder(req.params.orderId!, req.user!.id));
};

export const postPay: RequestHandler = async (req, res) => {
  ok(res, await payOrder(req.params.orderId!, req.user!.id));
};

export const postRelease: RequestHandler = async (req, res) => {
  ok(res, await releaseOrder(req.params.orderId!, req.user!.id));
};
