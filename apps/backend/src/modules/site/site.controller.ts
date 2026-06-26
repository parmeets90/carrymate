import type { RequestHandler } from 'express';
import { ok } from '../../utils/response';
import {
  testimonialCreateSchema,
  testimonialUpdateSchema,
  founderCreateSchema,
  founderUpdateSchema,
  faqCreateSchema,
  faqUpdateSchema,
  settingsUpdateSchema,
} from './site.validators';
import * as svc from './site.service';

/* ---------- public ---------- */
export const getSiteContent: RequestHandler = async (_req, res) => {
  ok(res, await svc.getPublicContent());
};

/* ---------- settings ---------- */
export const getSettings: RequestHandler = async (_req, res) => {
  ok(res, await svc.getSettings());
};
export const patchSettings: RequestHandler = async (req, res) => {
  ok(res, await svc.updateSettings(settingsUpdateSchema.parse(req.body)));
};

/* ---------- testimonials ---------- */
export const listTestimonials: RequestHandler = async (_req, res) => {
  ok(res, await svc.listTestimonials());
};
export const postTestimonial: RequestHandler = async (req, res) => {
  ok(res, await svc.createTestimonial(testimonialCreateSchema.parse(req.body)), 201);
};
export const patchTestimonial: RequestHandler = async (req, res) => {
  ok(res, await svc.updateTestimonial(req.params.id!, testimonialUpdateSchema.parse(req.body)));
};
export const deleteTestimonial: RequestHandler = async (req, res) => {
  await svc.deleteTestimonial(req.params.id!);
  ok(res, { success: true });
};

/* ---------- founders ---------- */
export const listFounders: RequestHandler = async (_req, res) => {
  ok(res, await svc.listFounders());
};
export const postFounder: RequestHandler = async (req, res) => {
  ok(res, await svc.createFounder(founderCreateSchema.parse(req.body)), 201);
};
export const patchFounder: RequestHandler = async (req, res) => {
  ok(res, await svc.updateFounder(req.params.id!, founderUpdateSchema.parse(req.body)));
};
export const deleteFounder: RequestHandler = async (req, res) => {
  await svc.deleteFounder(req.params.id!);
  ok(res, { success: true });
};

/* ---------- faqs ---------- */
export const listFaqs: RequestHandler = async (_req, res) => {
  ok(res, await svc.listFaqs());
};
export const postFaq: RequestHandler = async (req, res) => {
  ok(res, await svc.createFaq(faqCreateSchema.parse(req.body)), 201);
};
export const patchFaq: RequestHandler = async (req, res) => {
  ok(res, await svc.updateFaq(req.params.id!, faqUpdateSchema.parse(req.body)));
};
export const deleteFaq: RequestHandler = async (req, res) => {
  await svc.deleteFaq(req.params.id!);
  ok(res, { success: true });
};
