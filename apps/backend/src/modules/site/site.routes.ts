import { Router } from 'express';
import * as c from './site.controller';

/** Public router — the marketing site fetches active content (no auth). */
export const siteClientRouter = Router();
siteClientRouter.get('/content', c.getSiteContent);

/** Admin CRUD — mounted under the admin router (already auth + requireAdmin). */
export const siteAdminRouter = Router();

siteAdminRouter.get('/settings', c.getSettings);
siteAdminRouter.patch('/settings', c.patchSettings);

siteAdminRouter.get('/testimonials', c.listTestimonials);
siteAdminRouter.post('/testimonials', c.postTestimonial);
siteAdminRouter.patch('/testimonials/:id', c.patchTestimonial);
siteAdminRouter.delete('/testimonials/:id', c.deleteTestimonial);

siteAdminRouter.get('/founders', c.listFounders);
siteAdminRouter.post('/founders', c.postFounder);
siteAdminRouter.patch('/founders/:id', c.patchFounder);
siteAdminRouter.delete('/founders/:id', c.deleteFounder);

siteAdminRouter.get('/faqs', c.listFaqs);
siteAdminRouter.post('/faqs', c.postFaq);
siteAdminRouter.patch('/faqs/:id', c.patchFaq);
siteAdminRouter.delete('/faqs/:id', c.deleteFaq);
