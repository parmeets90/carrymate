import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import { submitKycDocument, getKycStatus } from './kyc.service';
import type { SubmitKycInput } from './kyc.validators';

export const postSubmitKyc: RequestHandler = async (req, res) => {
  const input = req.body as SubmitKycInput;
  const result = await submitKycDocument(req.user!.id, input);
  ok(res, result);
};

export const getKyc: RequestHandler = async (req, res) => {
  const result = await getKycStatus(req.user!.id);
  ok(res, result);
};
