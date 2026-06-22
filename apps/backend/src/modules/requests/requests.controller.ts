import type { RequestHandler } from 'express';
import { z } from 'zod';
import { ok } from '../../utils/response';
import { AppError } from '../../utils/errors';
import {
  createRequest,
  listMyRequests,
  getMyRequest,
  cancelRequest,
  browseForRoute,
} from './requests.service';
import type { CreateRequestInput } from './requests.validators';

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

export const getAvailableRequests: RequestHandler = async (req, res) => {
  const routeId = z.string().uuid().safeParse(req.query.routeId);
  if (!routeId.success) throw AppError.badRequest('A valid routeId query param is required.');
  ok(res, await browseForRoute(routeId.data, req.user!.id));
};
