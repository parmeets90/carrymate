import type { RequestHandler } from 'express';
import { z } from 'zod';
import { ok } from '../../utils/response';
import { AppError } from '../../utils/errors';
import {
  createRequest,
  listMyRequests,
  getMyRequest,
  cancelRequest,
  updateRequest,
  deleteRequest,
  relistRequest,
  getRequestInsights,
  getTodayPulse,
  browseForRoute,
} from './requests.service';
import type { CreateRequestInput, UpdateRequestInput } from './requests.validators';

export const postRequest: RequestHandler = async (req, res) => {
  const request = await createRequest(req.user!.id, req.body as CreateRequestInput);
  ok(res, request, 201);
};

export const getMyRequests: RequestHandler = async (req, res) => {
  ok(res, await listMyRequests(req.user!.id));
};

export const getRequestById: RequestHandler = async (req, res) => {
  ok(res, await getMyRequest(req.params.requestId!, req.user!.id));
};

export const postCancelRequest: RequestHandler = async (req, res) => {
  ok(res, await cancelRequest(req.params.requestId!, req.user!.id));
};

export const patchRequest: RequestHandler = async (req, res) => {
  ok(res, await updateRequest(req.params.requestId!, req.user!.id, req.body as UpdateRequestInput));
};

export const deleteRequestHandler: RequestHandler = async (req, res) => {
  await deleteRequest(req.params.requestId!, req.user!.id);
  ok(res, { success: true });
};

export const postRelistRequest: RequestHandler = async (req, res) => {
  ok(res, await relistRequest(req.params.requestId!, req.user!.id));
};

export const getRequestInsightsHandler: RequestHandler = async (req, res) => {
  ok(res, await getRequestInsights(req.params.requestId!, req.user!.id));
};

export const getTodayPulseHandler: RequestHandler = async (_req, res) => {
  ok(res, await getTodayPulse());
};

export const getAvailableRequests: RequestHandler = async (req, res) => {
  const routeId = z.string().uuid().safeParse(req.query.routeId);
  if (!routeId.success) throw AppError.badRequest('A valid routeId query param is required.');
  ok(res, await browseForRoute(routeId.data, req.user!.id));
};
