import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import {
  createBid,
  listBidsForRequest,
  listMyBids,
  withdrawBid,
  acceptBid,
} from './bids.service';
import type { CreateBidInput } from './bids.validators';

export const postBid: RequestHandler = async (req, res) => {
  ok(res, await createBid(req.user!.id, req.body as CreateBidInput), 201);
};

export const getMyBids: RequestHandler = async (req, res) => {
  ok(res, await listMyBids(req.user!.id));
};

export const postWithdrawBid: RequestHandler = async (req, res) => {
  ok(res, await withdrawBid(req.params.bidId!, req.user!.id));
};

export const getRequestBids: RequestHandler = async (req, res) => {
  ok(res, await listBidsForRequest(req.params.requestId!, req.user!.id));
};

export const postAcceptBid: RequestHandler = async (req, res) => {
  ok(res, await acceptBid(req.params.requestId!, req.params.bidId!, req.user!.id), 201);
};
