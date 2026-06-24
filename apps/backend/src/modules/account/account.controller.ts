import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import { exportAccountData, deleteAccount, recordConsent } from './account.service';

/** GET /v1/account/export — download everything we hold on the user (DPDP access). */
export const getExport: RequestHandler = async (req, res) => {
  const data = await exportAccountData(req.user!.id);
  res.setHeader('Content-Disposition', 'attachment; filename="carrymate-data.json"');
  ok(res, data);
};

/** POST /v1/account/delete — anonymize + erase the user's personal data (DPDP). */
export const postDelete: RequestHandler = async (req, res) => {
  await deleteAccount(req.user!.id);
  ok(res, { deleted: true });
};

/** POST /v1/account/consent — record consent to the current Terms/Privacy version. */
export const postConsent: RequestHandler = async (req, res) => {
  ok(res, await recordConsent(req.user!.id));
};
