import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import { createRoute, listMyRoutes, getRoute, cancelRoute, updateRoute, deleteRoute } from './routes.service';
import type { CreateRouteInput, UpdateRouteInput } from './routes.validators';

export const postRoute: RequestHandler = async (req, res) => {
  const route = await createRoute(req.user!.id, req.body as CreateRouteInput);
  ok(res, route, 201);
};

export const getMyRoutes: RequestHandler = async (req, res) => {
  ok(res, await listMyRoutes(req.user!.id));
};

export const getRouteById: RequestHandler = async (req, res) => {
  ok(res, await getRoute(req.params.routeId!, req.user!.id));
};

export const postCancelRoute: RequestHandler = async (req, res) => {
  ok(res, await cancelRoute(req.params.routeId!, req.user!.id));
};

export const patchRoute: RequestHandler = async (req, res) => {
  ok(res, await updateRoute(req.params.routeId!, req.user!.id, req.body as UpdateRouteInput));
};

export const deleteRouteHandler: RequestHandler = async (req, res) => {
  await deleteRoute(req.params.routeId!, req.user!.id);
  ok(res, { success: true });
};
