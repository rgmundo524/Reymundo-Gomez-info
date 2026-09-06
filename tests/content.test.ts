import assert from 'node:assert/strict';
import { test } from 'node:test';
import { schemas, type ContentRecord } from '../src/content/schemas';
import { loadContent, validateRecords } from '../scripts/content';

const base = { slug: 'example', description_short: 'A short description.' };
const job = { ...base, organization: 'Example', role: 'Investigator', periods: [{ start: '2022-09', end: '2025-06' }, { start: '2026-01', end: null }] };

test('a resumed role preserves the gap and defaults to draft', () => {
  const data = schemas.experience.parse(job);
  assert.equal(data.publication_status, 'draft');
  assert.deepEqual(data.periods, job.periods);
});

test('contradictory employment periods and misspelled fields are rejected', () => {
  assert.equal(schemas.experience.safeParse({ ...job, periods: [{ start: '2026-02', end: '2026-01' }] }).success, false);
  assert.equal(schemas.experience.safeParse({ ...job, periods: [{ start: '2025-01', end: null }, { start: '2026-01', end: null }] }).success, false);
  assert.equal(schemas.experience.safeParse({ ...job, Active_position: true }).success, false);
});

test('achievement IDs cannot collide', () => {
  assert.equal(schemas.experience.safeParse({ ...job, highlights: [{ id: 'tracing', text: 'One' }, { id: 'tracing', text: 'Two' }] }).success, false);
});

test('missing references and duplicate slugs report the affected entry', () => {
  const entry: ContentRecord = { collection: 'experience', data: schemas.experience.parse({ ...job, expertise: ['missing'] }), body: 'Text', file: 'experience/example.md' };
  assert.throws(() => validateRecords([entry]), /experience\/example.md.*missing expertise\/missing/);
  assert.throws(() => validateRecords([entry, entry]), /duplicate slug experience\/example/);
});

test('published entries cannot pull in draft references', () => {
  const expertise: ContentRecord = { collection: 'expertise', data: schemas.expertise.parse({ ...base, title: 'Tracing' }), body: 'Text', file: 'expertise/example.md' };
  const experience: ContentRecord = { collection: 'experience', data: schemas.experience.parse({ ...job, publication_status: 'published', expertise: ['example'] }), body: 'Text', file: 'experience/example.md' };
  assert.throws(() => validateRecords([expertise, experience]), /published content references draft/);
  expertise.data.publication_status = 'published';
  assert.doesNotThrow(() => validateRecords([expertise, experience]));
});

test('the actual Markdown collection has valid fields and relationships', async () => {
  const records = await loadContent();
  assert.ok(records.length > 0);
  assert.ok(records.some((record) => record.collection === 'pages' && record.data.slug === 'home'));
});
