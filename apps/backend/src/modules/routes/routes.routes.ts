import { Router } from 'express';
import { UserRole } from '@carrymate/shared';
import { authenticate, requireKyc, requireRole } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import { createRouteSchema } from './routes.validators';
import { postRoute, getMyRoutes, getRouteById, postCancelRoute } from './routes.controller';

export const routesRouter = Router();

// Trips are traveler-only and require a verified identity.
routesRouter.use(authenticate, requireKyc, requireRole(UserRole.TRAVELER));

routesRouter.post('/', validateBody(createRouteSchema), postRoute);
routesRouter.get('/', getMyRoutes);
routesRouter.get('/:routeId', getRouteById);
routesRouter.post('/:routeId/cancel', postCancelRoute);
