# Interactive case charts

The Casework page displays Criminal investigations and Professional investigations.
The professional chart covers non-criminal work: Divorce, Corporate civil
lawsuits, Bankruptcy, and Other. It uses one sample case per category, giving
four total cases and four 25% slices.

Both charts accept sample values during development. `data_status: sample`
displays a short label; there is no requirement to reconcile historical records
to exercise the website. The criminal chart retains varied counts (21, 13, 5, 5,
4, 3) to check unequal slice sizes and calculated percentages.

## How the interaction works

Each slice and its matching legend label are native links to a category page,
for example `/investigations/professional-investigations/divorce/`. Hover or
keyboard focus outlines a slice. Clicking, tapping, or pressing Enter opens the
category's selected case summaries. The page provides category navigation and a
link back to the charts.

The component uses filled SVG sectors, so each clickable area follows the shape
of its slice. The chart's hole and other slices cannot trigger that category's
link. A complete 100% slice and zero-count categories are supported; zero-count
categories have no visible slice but remain accessible through the legend.

No client JavaScript, charting dependency, API, or database is required. The
layout places charts side by side on wider screens and stacks them on smaller
screens. Counts and percentages are also provided in the linked text table.

## Chart data

Edit these records:

- `content/charts/criminal-investigations.md`
- `content/charts/professional-investigations.md`

```yaml
slug: professional-investigations
publication_status: draft
title: Professional investigations
description_short: Non-criminal investigations involving civil, commercial, and personal matters.
data_status: sample
source_date: "2026-09-07"
categories:
  - id: divorce
    label: Divorce
    count: 1
  - id: corporate-civil-lawsuits
    label: Corporate civil lawsuits
    count: 1
  - id: bankruptcy
    label: Bankruptcy
    count: 1
  - id: other
    label: Other
    count: 1
```

This shows frontmatter fields. The complete file also has `---` delimiters and
a Markdown body used as the chart caption. Use `templates/charts.md` for a new
record.

- Store whole-number counts. The total is their sum; slice geometry and shares
  are computed from that sum.
- `null` means unknown and suppresses all proportions; `0` means a known zero.
- Never store percentages or a separate total. Only display labels are rounded
  to at most one decimal place; slice geometry uses full precision.
- Keep category IDs stable when editing labels. IDs determine category URLs and
  case-summary assignments.
- `source_date` is displayed as the sample update date for sample data, or the
  source update date for other data.
- Counts represent the category's aggregate, independent of how many selected
  summaries are available. Adding a summary does not silently change totals.

## Case information

Each selected case summary has its own Markdown file in `content/cases/`.
For example:

```yaml
slug: example-digital-asset-disclosure
publication_status: draft
title: Digital asset disclosure review
description_short: An illustrative review of wallet activity and asset disclosures.
chart: professional-investigations
category: divorce
content_kind: example
blocks:
  investigative_question: Which digital asset activity is relevant to the disclosures?
```

The Markdown body contains the longer description. The template supplies
headings for the question, approach, and deliverable; named blocks allow a
passage to be reused separately. Ten illustrative summaries are included, one
for each of the ten categories across both charts.

`chart` must identify an existing chart and `category` must identify a category
inside that chart. These relationships are checked during content validation.
On category pages, each visible summary is rendered with its title, short
description, optional question block, full body, and links. An empty category
shows a clear message instead of a broken destination.

## Relevant files

| File | Responsibility |
| --- | --- |
| `src/components/CaseChart.astro` | Chart appearance and slice/legend links |
| `src/lib/charts.ts` | Counts, shares, SVG geometry, and category URLs |
| `src/lib/cases.ts` | Category routing and visible case selection |
| `src/pages/investigations/[chart]/[category].astro` | Category pages and full case summaries |
| `content/pages/casework.md` | Selected charts and their order |
| `templates/cases.md` | Starting point for a new summary |

## Checks and publication

Run `npm run check:content` after editing relationships and `npm test` for chart
math, geometry, and route visibility checks. `npm run dev` displays the sample
charts and draft category pages.

Sample data remains draft. When preparing real content for publication, replace
the sample counts and summaries, update their captions, set the chart's
`data_status: confirmed`, and publish the intended records. A published case
cannot reference a draft chart. Draft case bodies and draft category routes are
excluded from the ordinary production build.
