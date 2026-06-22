import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import { createRoute, listMyRoutes, getRoute, cancelRoute } from './routes.service';
import type { CreateRouteInput } from './routes.validators';

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
