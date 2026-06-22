import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import {
  listMyOrders,
  getOrder,
  payOrder,
  releaseOrder,
  openBoxOrder,
  deliverOrder,
} from './orders.service';
import { raiseDispute } from '../disputes/disputes.service';
import { rateOrder } from '../ratings/ratings.service';
import type { OpenBoxInput, DeliverInput, DisputeInput, RateInput } from './orders.validators';

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

export const postOpenBox: RequestHandler = async (req, res) => {
  ok(res, await openBoxOrder(req.params.orderId!, req.user!.id, req.body as OpenBoxInput));
};

export const postDeliver: RequestHandler = async (req, res) => {
  ok(res, await deliverOrder(req.params.orderId!, req.user!.id, req.body as DeliverInput));
};

export const postDispute: RequestHandler = async (req, res) => {
  ok(res, await raiseDispute(req.params.orderId!, req.user!.id, req.body as DisputeInput), 201);
};

export const postRate: RequestHandler = async (req, res) => {
  const { stars, comment } = req.body as RateInput;
  await rateOrder(req.params.orderId!, req.user!.id, stars, comment);
  ok(res, { success: true }, 201);
};
