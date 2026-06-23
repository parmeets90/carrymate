import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import { submitKycDocument, getKycStatus, startKycVerification } from './kyc.service';
import { isDiditConfigured } from '../../config/env';
import type { SubmitKycInput } from './kyc.validators';

export const postSubmitKyc: RequestHandler = async (req, res) => {
  const input = req.body as SubmitKycInput;
  const result = await submitKycDocument(req.user!.id, input);
  ok(res, result);
};

/** Start a hosted (Didit) verification session → returns the URL to open. */
export const postStartVerification: RequestHandler = async (req, res) => {
  ok(res, await startKycVerification(req.user!.id));
};

/** Tells the app whether the hosted KYC flow is available (else manual upload). */
export const getKycProvider: RequestHandler = (_req, res) => {
  ok(res, { provider: isDiditConfigured ? 'didit' : 'manual' });
};

export const getKyc: RequestHandler = async (req, res) => {
  const result = await getKycStatus(req.user!.id);
  ok(res, result);
};
