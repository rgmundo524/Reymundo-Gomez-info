# Writing and reusing content

## One file per subject

Keep each job, credential, project, or interest in its own Markdown file. A job
with multiple employment periods can remain one file. If the title or role changes
substantially, create a new experience entry rather than rewriting its history.

Each file has YAML frontmatter between `---` lines, followed by the long narrative.
The filename is for your convenience; `slug` is the stable identifier used by
references. Renaming a file without changing its slug preserves those references.

## Common fields

| Field | Meaning |
| --- | --- |
| `slug` | Unique within its collection; lowercase words separated by hyphens |
| `publication_status` | `draft` or `published`; omitted values default to draft |
| `description_short` | Required compact description, written once |
| `blocks` | Optional named plain-text passages, such as `directory_bio` |
| `links` | Optional list of `label` and HTTP(S) `url` pairs |
| `editorial_note` | Optional source/review note; current components never render it |
| Markdown body | Required full narrative, with Markdown formatting |

The body serves as the long description. Do not copy it into another
`description_long` field. Additional separately reusable text goes under `blocks`.
Frontmatter descriptions, blocks, and highlight text are rendered as plain text;
Markdown formatting belongs in the body or in a standalone callout entry.

Example:

```yaml
description_short: >-
  A brief description for cards and lists.
blocks:
  directory_bio: >-
    A version tailored to an expert directory.
  litigation_relevance: >-
    A passage that explains this role's relevance to litigation work.
```

Indent every continuation line under `>-`. Quote dates such as `"2026-01"`.
Unknown fields and duplicate YAML keys fail validation, which catches errors such
as `Description_Short` instead of `description_short`.

## Experience and dates

Use `periods` containing `start` and `end`, both at month precision. `end: null`
means the role remains open. Closed periods must not overlap; at most one final
period can be open. For now, two periods within one entry may not share a month,
because month-only data cannot distinguish their exact transition dates.

`activePosition()` computes whether a period includes the current month. You do
not need an `active_position` field. Explicit date ranges are the canonical data.
“Present” is derived from an open end date; rebuild when you update employment.

`highlights` is a list of `{ id, text }` items. Stable IDs let future CV and
directory exports select individual achievements without duplicating their text.

## Relationships and page selection

References are slugs, not paths. For example:

```yaml
expertise:
  - example-expertise
projects:
  - example-project
```

The checker resolves these IDs against the target collections and rejects missing
or duplicated references. A published entry may not reference a draft entry.
Reciprocal project/experience references are allowed; the checker does not
recursively render relationships or require duplicate backlinks.

The full relationship check runs when Astro starts and whenever you run the check
or build commands. During live editing, field schemas are rechecked automatically,
but run `npm run check` after changing relationships. Missing page selections also
raise an error in the preview instead of disappearing silently.

`content/pages/home.md` selects entries and their order. Adding a file to an
experience collection makes it available; adding its slug to the page selection
makes it appear in this initial preview. A content entry does not automatically
get its own public URL. Later page designs can reuse any of the same fields.

## Reuse from Astro components

```astro
---
import { getEntry, render } from 'astro:content';
const job = await getEntry('experience', 'example-role');
if (!job) throw new Error('Missing experience/example-role');
const { Content } = await render(job);
---
<p>{job.data.description_short}</p>
<p>{job.data.blocks.litigation_relevance}</p>
<Content />
```

Apply the shared `isVisible()` / `selected()` helpers before rendering content on
public routes. Do not send an entire collection or frontmatter object to the
browser. Components should select the fields they display. `editorial_note` is
not rendered, but it remains part of the Git source.

Body headings provide document structure; they are not separately addressable
content fields. If independent richly formatted sections become necessary, use
separate callout files first, or add one shared Markdown section parser later.

## Credentials and education

Credentials distinguish `certification`, `certificate`, and `training`. Use the
year reported by the source without inventing a month or an expiration. A missing
`expires_on` means unspecified, not verified perpetual validity.

Education distinguishes `degree` from `attendance` and records a completion
status. Attending an institution must not implicitly display as earning a degree.

## Case charts

Each file under `content/charts/` supplies categories and integer case counts to
the reusable interactive donut component. Add its slug to `charts` in the home page selection.
Totals and percentages are derived; `null` means unknown and `0` means a confirmed
zero. Charts with unknown counts display their categories without proportions.

Use `data_status: sample` during development. Entering sample values is enough to
render the charts and exercise their links; historical accuracy is not required
for this workflow. Set `data_status: confirmed` when preparing real statistics for
publication. See [case chart authoring](case-charts.md) for the fields.

Individual summaries live in `content/cases/`. Each has a `chart` slug and a
`category` ID identifying exactly where it belongs. Both are validated. The full
Markdown body appears on the corresponding category page, alongside any other
visible summaries assigned there. `description_short` and named `blocks` remain
independently reusable. `content_kind: example` labels illustrative content.

Selecting a slice or its legend link opens
`/investigations/<chart-slug>/<category-id>/`. Native links support pointer,
touch, and keyboard navigation. Category routes and their summaries use the same
draft visibility rules as the home page.

## Publishing

1. Review the wording and any source claims.
2. Change intended entries and their required references to `published`.
3. Publish the home page entry when its selected content is ready.
4. Run `npm run build` and inspect it with `npm run preview`.

Keep drafts, templates, source PDFs, and administrative records outside `public/`.
Astro copies everything in `public/` to the output regardless of content status.
Never upload `dist-drafts/` to the future public host. Repository access controls
and website publication are separate settings.
