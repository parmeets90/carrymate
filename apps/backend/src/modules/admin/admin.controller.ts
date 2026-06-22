import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import {
  listPendingKyc,
  approveKyc,
  rejectKyc,
  listUsers,
  getUserDetail,
  setUserStatus,
} from './admin.service';
import { listUsersSchema } from './admin.validators';
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
  ok(res, await setUserStatus(req.params.userId!, status));
};
