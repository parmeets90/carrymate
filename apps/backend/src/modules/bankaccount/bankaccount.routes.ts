import { Router, type RequestHandler } from 'express';
import { UserRole } from '@carrymate/shared';
import { authenticate, requireKyc, requireRole } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import { ok } from '../../utils/response';
import { bankAccountSchema, type BankAccountInput } from './bankaccount.validators';
import { getBankAccount, upsertBankAccount } from './bankaccount.service';

export const bankAccountRouter = Router();

// Payout account is traveler-only and requires a verified identity.
bankAccountRouter.use(authenticate, requireKyc, requireRole(UserRole.TRAVELER));

const getMine: RequestHandler = async (req, res) => {
  ok(res, await getBankAccount(req.user!.id));
};

const putMine: RequestHandler = async (req, res) => {
  ok(res, await upsertBankAccount(req.user!.id, req.body as BankAccountInput));
};

bankAccountRouter.get('/', getMine);
bankAccountRouter.put('/', validateBody(bankAccountSchema), putMine);
