import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getActiveScanRules,
  getScanRules,
  postScanRule,
  patchScanRule,
  removeScanRule,
} from './scanrules.controller';

/** Client router — authenticated read of active rules (mobile pulls these). */
export const scanRulesClientRouter = Router();
scanRulesClientRouter.use(authenticate);
scanRulesClientRouter.get('/', getActiveScanRules);

/** Admin CRUD — mounted under the admin router (already auth + requireAdmin). */
export const scanRulesAdminRouter = Router();
scanRulesAdminRouter.get('/', getScanRules);
scanRulesAdminRouter.post('/', postScanRule);
scanRulesAdminRouter.patch('/:id', patchScanRule);
scanRulesAdminRouter.delete('/:id', removeScanRule);
