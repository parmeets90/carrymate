import type {
  SiteAccent,
  SiteContentDto,
  SiteSettingsDto,
  TestimonialDto,
  FounderDto,
  FaqItemDto,
} from '@carrymate/shared';
import type { Testimonial, Founder, FaqItem, SiteSetting } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import type {
  TestimonialCreateInput,
  TestimonialUpdateInput,
  FounderCreateInput,
  FounderUpdateInput,
  FaqCreateInput,
  FaqUpdateInput,
  SettingsUpdateInput,
} from './site.validators';

const SINGLETON = 'singleton';

/* ---------- mappers ---------- */
const asAccent = (v: string): SiteAccent =>
  (['gold', 'mint', 'sky', 'ember'].includes(v) ? v : 'gold') as SiteAccent;

const tStmDto = (t: Testimonial): TestimonialDto => ({
  id: t.id,
  quote: t.quote,
  name: t.name,
  role: t.role,
  rating: t.rating,
  accent: asAccent(t.accent),
  sortOrder: t.sortOrder,
  active: t.active,
});

const founderDto = (f: Founder): FounderDto => ({
  id: f.id,
  name: f.name,
  role: f.role,
  initials: f.initials,
  imageUrl: f.imageUrl,
  accent: asAccent(f.accent),
  sortOrder: f.sortOrder,
  active: f.active,
});

const faqDto = (f: FaqItem): FaqItemDto => ({
  id: f.id,
  question: f.question,
  answer: f.answer,
  sortOrder: f.sortOrder,
  active: f.active,
});

const settingsDto = (s: SiteSetting): SiteSettingsDto => ({
  brandName: s.brandName,
  tagline: s.tagline,
  contactEmail: s.contactEmail,
  supportEmail: s.supportEmail,
  contactPhone: s.contactPhone,
  twitterUrl: s.twitterUrl,
  instagramUrl: s.instagramUrl,
  linkedinUrl: s.linkedinUrl,
  appStoreUrl: s.appStoreUrl,
  playStoreUrl: s.playStoreUrl,
});

const byOrder = [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }];

/* ---------- settings (singleton, self-healing) ---------- */
async function ensureSettings(): Promise<SiteSetting> {
  return prisma.siteSetting.upsert({
    where: { id: SINGLETON },
    update: {},
    create: { id: SINGLETON },
  });
}

export async function getSettings(): Promise<SiteSettingsDto> {
  return settingsDto(await ensureSettings());
}

export async function updateSettings(input: SettingsUpdateInput): Promise<SiteSettingsDto> {
  await ensureSettings();
  const s = await prisma.siteSetting.update({ where: { id: SINGLETON }, data: input });
  return settingsDto(s);
}

/* ---------- public aggregate ---------- */
export async function getPublicContent(): Promise<SiteContentDto> {
  const [settings, founders, testimonials, faqs] = await Promise.all([
    ensureSettings(),
    prisma.founder.findMany({ where: { active: true }, orderBy: byOrder }),
    prisma.testimonial.findMany({ where: { active: true }, orderBy: byOrder }),
    prisma.faqItem.findMany({ where: { active: true }, orderBy: byOrder }),
  ]);
  return {
    settings: settingsDto(settings),
    founders: founders.map(founderDto),
    testimonials: testimonials.map(tStmDto),
    faqs: faqs.map(faqDto),
  };
}

/* ---------- testimonials ---------- */
export async function listTestimonials(): Promise<TestimonialDto[]> {
  return (await prisma.testimonial.findMany({ orderBy: byOrder })).map(tStmDto);
}
export async function createTestimonial(input: TestimonialCreateInput): Promise<TestimonialDto> {
  return tStmDto(await prisma.testimonial.create({ data: input }));
}
export async function updateTestimonial(
  id: string,
  input: TestimonialUpdateInput,
): Promise<TestimonialDto> {
  try {
    return tStmDto(await prisma.testimonial.update({ where: { id }, data: input }));
  } catch {
    throw AppError.notFound('Testimonial not found');
  }
}
export async function deleteTestimonial(id: string): Promise<void> {
  try {
    await prisma.testimonial.delete({ where: { id } });
  } catch {
    throw AppError.notFound('Testimonial not found');
  }
}

/* ---------- founders ---------- */
export async function listFounders(): Promise<FounderDto[]> {
  return (await prisma.founder.findMany({ orderBy: byOrder })).map(founderDto);
}
export async function createFounder(input: FounderCreateInput): Promise<FounderDto> {
  return founderDto(
    await prisma.founder.create({ data: { ...input, initials: input.initials.toUpperCase() } }),
  );
}
export async function updateFounder(id: string, input: FounderUpdateInput): Promise<FounderDto> {
  try {
    return founderDto(
      await prisma.founder.update({
        where: { id },
        data: {
          ...input,
          ...(input.initials !== undefined ? { initials: input.initials.toUpperCase() } : {}),
        },
      }),
    );
  } catch {
    throw AppError.notFound('Founder not found');
  }
}
export async function deleteFounder(id: string): Promise<void> {
  try {
    await prisma.founder.delete({ where: { id } });
  } catch {
    throw AppError.notFound('Founder not found');
  }
}

/* ---------- faqs ---------- */
export async function listFaqs(): Promise<FaqItemDto[]> {
  return (await prisma.faqItem.findMany({ orderBy: byOrder })).map(faqDto);
}
export async function createFaq(input: FaqCreateInput): Promise<FaqItemDto> {
  return faqDto(await prisma.faqItem.create({ data: input }));
}
export async function updateFaq(id: string, input: FaqUpdateInput): Promise<FaqItemDto> {
  try {
    return faqDto(await prisma.faqItem.update({ where: { id }, data: input }));
  } catch {
    throw AppError.notFound('FAQ not found');
  }
}
export async function deleteFaq(id: string): Promise<void> {
  try {
    await prisma.faqItem.delete({ where: { id } });
  } catch {
    throw AppError.notFound('FAQ not found');
  }
}
