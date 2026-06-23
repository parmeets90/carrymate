import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import {
  listPendingKyc,
  approveKyc,
  rejectKyc,
  listUsers,
  getUserDetail,
  setUserStatus,
  listRequests,
  forceExpireRequest,
  approveReviewRequest,
  listPendingRoutes,
  verifyRouteTicket,
  getMetrics,
  getAdminQueue,
} from './admin.service';
import {
  listAllOrders,
  refundOrder,
  listFraudQueue,
  clearFraudHold,
  listFailedPayouts,
  retryPayout,
} from '../orders/orders.service';
import { listOpenDisputes, resolveDispute } from '../disputes/disputes.service';
import { listUsersSchema, listRequestsSchema, resolveDisputeSchema } from './admin.validators';
import type { ResolveDisputeInput } from './admin.validators';
import type { RejectKycInput, SetStatusInput } from './admin.validators';

export const getPendingKyc: RequestHandler = async (_req, res) => {
  ok(res, await listPendingKyc());
};

export const postApproveKyc: RequestHandler = async (req, res) => {
  await approveKyc(req.params.userId!, req.user!.id);
  ok(res, { success: true });
};

export const postRejectKyc: RequestHandler = async (req, res) => {
  const { reason } = req.body as RejectKycInput;
  await rejectKyc(req.params.userId!, req.user!.id, reason);
  ok(res, { success: true });
};

export const getUsers: RequestHandler = async (req, res) => {
  const { q, page, pageSize } = listUsersSchema.parse(req.query);
  ok(res, await listUsers(q, page, pageSize));
};

export const getUser: RequestHandler = async (req, res) => {
  ok(res, await getUserDetail(req.params.userId!));
};

export const postSetStatus: RequestHandler = async (req, res) => {
  const { status } = req.body as SetStatusInput;
  ok(res, await setUserStatus(req.params.userId!, status, req.user!.id));
};

export const getMetrics_: RequestHandler = async (_req, res) => {
  ok(res, await getMetrics());
};

export const getQueue: RequestHandler = async (_req, res) => {
  ok(res, await getAdminQueue());
};

export const getFraudQueue: RequestHandler = async (_req, res) => {
  ok(res, await listFraudQueue());
};

export const postClearHold: RequestHandler = async (req, res) => {
  await clearFraudHold(req.params.orderId!, req.user!.id);
  ok(res, { success: true });
};

export const getFailedPayouts: RequestHandler = async (_req, res) => {
  ok(res, await listFailedPayouts());
};

export const postRetryPayout: RequestHandler = async (req, res) => {
  await retryPayout(req.params.orderId!, req.user!.id);
  ok(res, { success: true });
};

export const getRequests: RequestHandler = async (req, res) => {
  const { status, page, pageSize } = listRequestsSchema.parse(req.query);
  ok(res, await listRequests(status, page, pageSize));
};

export const postExpireRequest: RequestHandler = async (req, res) => {
  await forceExpireRequest(req.params.requestId!);
  ok(res, { success: true });
};

export const postApproveReview: RequestHandler = async (req, res) => {
  await approveReviewRequest(req.params.requestId!, req.user!.id);
  ok(res, { success: true });
};

export const getPendingRoutes: RequestHandler = async (_req, res) => {
  ok(res, await listPendingRoutes());
};

export const postVerifyRoute: RequestHandler = async (req, res) => {
  await verifyRouteTicket(req.params.routeId!, req.user!.id);
  ok(res, { success: true });
};

export const getOrders: RequestHandler = async (req, res) => {
  const { page, pageSize } = listRequestsSchema.parse(req.query);
  ok(res, await listAllOrders(page, pageSize));
};

export const postRefundOrder: RequestHandler = async (req, res) => {
  await refundOrder(req.params.orderId!, req.user!.id);
  ok(res, { success: true });
};

export const getDisputes: RequestHandler = async (_req, res) => {
  ok(res, await listOpenDisputes());
};

export const postResolveDispute: RequestHandler = async (req, res) => {
  const { decision, note } = req.body as ResolveDisputeInput;
  await resolveDispute(req.params.disputeId!, req.user!.id, decision, note);
  ok(res, { success: true });
};
