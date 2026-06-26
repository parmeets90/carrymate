import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import { createScanRuleSchema, updateScanRuleSchema } from './scanrules.validators';
import {
  listScanRules,
  listActiveScanRules,
  createScanRule,
  updateScanRule,
  deleteScanRule,
} from './scanrules.service';

/** GET /v1/scan-rules — active rules for the mobile on-device scan. */
export const getActiveScanRules: RequestHandler = async (_req, res) => {
  ok(res, await listActiveScanRules());
};

/** GET /v1/admin/scan-rules — full list for the admin panel. */
export const getScanRules: RequestHandler = async (_req, res) => {
  ok(res, await listScanRules());
};

export const postScanRule: RequestHandler = async (req, res) => {
  const input = createScanRuleSchema.parse(req.body);
  ok(res, await createScanRule(input), 201);
};

export const patchScanRule: RequestHandler = async (req, res) => {
  const input = updateScanRuleSchema.parse(req.body);
  ok(res, await updateScanRule(req.params.id!, input));
};

export const removeScanRule: RequestHandler = async (req, res) => {
  await deleteScanRule(req.params.id!);
  ok(res, { success: true });
};
