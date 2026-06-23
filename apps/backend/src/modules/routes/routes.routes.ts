import { Router } from 'express';
import { UserRole } from '@carrymate/shared';
import { authenticate, requireKyc, requireRole, requireVerifiedPhone } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import { createRouteSchema, updateRouteSchema } from './routes.validators';
import {
  postRoute,
  getMyRoutes,
  getRouteById,
  postCancelRoute,
  patchRoute,
  deleteRouteHandler,
} from './routes.controller';

export const routesRouter = Router();

// Trips are traveler-only and require a verified identity.
routesRouter.use(authenticate, requireKyc, requireRole(UserRole.TRAVELER));

routesRouter.post('/', requireVerifiedPhone, validateBody(createRouteSchema), postRoute);
routesRouter.get('/', getMyRoutes);
routesRouter.get('/:routeId', getRouteById);
routesRouter.patch('/:routeId', validateBody(updateRouteSchema), patchRoute);
routesRouter.delete('/:routeId', deleteRouteHandler);
routesRouter.post('/:routeId/cancel', postCancelRoute);
