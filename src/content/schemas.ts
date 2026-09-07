import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const slug = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens.');
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use a quoted YYYY-MM date.');
const webUrl = z.url({ protocol: /^https?$/ });
const link = z.strictObject({ label: text, url: webUrl });
const refs = () => z.array(slug).default([]);
const common = {
  slug,
  publication_status: z.enum(['draft', 'published']).default('draft'),
  description_short: text,
  blocks: z.record(z.string().regex(/^[a-z][a-z0-9_]*$/), text).default({}),
  links: z.array(link).default([]),
  editorial_note: text.optional(),
};

export const periodSchema = z.strictObject({ start: month, end: month.nullable() })
  .refine((period) => period.end === null || period.end >= period.start,
    { message: 'End month must be on or after start month.', path: ['end'] });

const periods = z.array(periodSchema).min(1).superRefine((items, ctx) => {
  const sorted = [...items].sort((a, b) => a.start.localeCompare(b.start));
  for (let index = 1; index < sorted.length; index++) {
    const previous = sorted[index - 1];
    if (previous.end === null || sorted[index].start <= previous.end) {
      ctx.addIssue({ code: 'custom', message: 'Employment periods must not overlap; only the last period may be open.' });
    }
  }
});

const highlights = z.array(z.strictObject({ id: slug, text })).default([])
  .refine((items) => new Set(items.map((item) => item.id)).size === items.length,
    'Each highlight must have a unique id.');

const caseCategories = z.array(z.strictObject({
  id: slug,
  label: text,
  count: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable(),
})).min(1).refine((items) => new Set(items.map(({ id }) => id)).size === items.length,
  'Each chart category must have a unique id.')
  .refine((items) => new Set(items.map(({ label }) => label.toLowerCase())).size === items.length,
    'Each chart category must have a unique label.');

export const schemas = {
  profile: z.strictObject({
    ...common, name: text, headline: text,
    public_email: z.email().optional(), location: text.optional(),
    portrait: z.strictObject({
      image: text.regex(/^[a-z0-9-]+\.(png|jpe?g|webp)$/, 'Use an image filename from src/assets.'),
      alt: text,
      source_url: webUrl.optional(),
    }).optional(),
  }),
  experience: z.strictObject({
    ...common, organization: text, role: text, location: text.optional(),
    periods, highlights, expertise: refs(), projects: refs(),
  }),
  education: z.strictObject({
    ...common, institution: text, program: text,
    credential_type: z.enum(['degree', 'attendance']),
    start: month, end: month.nullable(),
    completion_status: z.enum(['completed', 'in_progress', 'not_completed', 'unspecified']),
  }).refine((entry) => entry.end === null || entry.end >= entry.start,
    { message: 'End month must be on or after start month.', path: ['end'] }),
  credentials: z.strictObject({
    ...common, name: text, issuer: text,
    credential_type: z.enum(['certification', 'certificate', 'training']),
    issued_year: z.number().int().min(1900).max(2200),
    expires_on: z.iso.date().optional(), verification_url: webUrl.optional(),
    expertise: refs(),
  }),
  expertise: z.strictObject({ ...common, title: text }),
  projects: z.strictObject({
    ...common, title: text, contribution: text,
    experience: refs(), expertise: refs(),
  }),
  interests: z.strictObject({ ...common, title: text }),
  callouts: z.strictObject({ ...common, title: text }),
  charts: z.strictObject({
    ...common,
    title: text,
    data_status: z.enum(['sample', 'needs_review', 'confirmed']).default('needs_review'),
    source_date: z.iso.date(),
    categories: caseCategories,
  }).superRefine((entry, ctx) => {
    const complete = entry.categories.every(({ count }) => count !== null);
    const total = entry.categories.reduce((sum, { count }) => sum + (count ?? 0), 0);
    if (!Number.isSafeInteger(total) || (complete && total === 0)) {
      ctx.addIssue({ code: 'custom', path: ['categories'], message: 'A complete chart must have a positive, safe integer total.' });
    }
    if (entry.data_status === 'confirmed' && !complete) {
      ctx.addIssue({ code: 'custom', path: ['categories'], message: 'Confirmed charts require a count for every category. Use zero only for a known zero.' });
    }
    if (entry.publication_status === 'published' && entry.data_status !== 'confirmed') {
      ctx.addIssue({ code: 'custom', path: ['data_status'], message: 'Confirm chart counts before publishing.' });
    }
  }),
  cases: z.strictObject({
    ...common,
    title: text,
    chart: slug,
    category: slug,
    content_kind: z.enum(['example', 'case_study']).default('example'),
  }),
  pages: z.strictObject({
    ...common, title: text, profile: slug,
    experience: refs(), education: refs(), credentials: refs(),
    expertise: refs(), projects: refs(), interests: refs(), callouts: refs(), charts: refs(),
  }),
};

export type CollectionName = keyof typeof schemas;
export type ContentData<K extends CollectionName> = z.infer<(typeof schemas)[K]>;
export type ContentRecord = {
  [K in CollectionName]: { collection: K; data: ContentData<K>; body: string; file: string }
}[CollectionName];

// Relationships are declared once and checked before Astro loads any content.
export const relationships: Partial<Record<CollectionName, Record<string, CollectionName>>> = {
  experience: { expertise: 'expertise', projects: 'projects' },
  credentials: { expertise: 'expertise' },
  projects: { experience: 'experience', expertise: 'expertise' },
  cases: { chart: 'charts' },
  pages: {
    profile: 'profile', experience: 'experience', education: 'education',
    credentials: 'credentials', expertise: 'expertise', projects: 'projects',
    interests: 'interests', callouts: 'callouts', charts: 'charts',
  },
};
