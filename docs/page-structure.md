# Page structure and visual design

The site is organized for attorneys, investigators, and other professional
contacts who need to understand Reymundo's focus and then inspect the relevant
background or work.

| Route | Content selection | Purpose |
| --- | --- | --- |
| `/` | `content/pages/home.md` | Portrait, introduction, three expertise highlights, selected work, contact link |
| `/about/` | `content/pages/about.md` | Work History: interactive role timeline, employment details, interests, biography |
| `/expertise/` | `content/pages/expertise.md` | Full descriptions of all expertise areas and analytical approach |
| `/casework/` | `content/pages/casework.md` | Interactive charts, selected projects, and investigation experience |
| `/credentials/` | `content/pages/credentials.md` | Certifications, training, and education |
| `/contact/` | `content/pages/contact.md` | Professional enquiry introduction and contact link |
| `/articles/` | `content/pages/articles.md` | Automatically discovered articles, newest dated entries first |
| `/articles/<slug>/` | `content/articles/` | Article body, takeaway, topics, and related cases |
| `/investigations/<chart>/<category>/` | Matching records in `content/cases/` | Case summaries reached from chart slices or legend links |

The home page intentionally omits the full CV and chart tables. The underlying
records remain reusable; adding detail to an employment file does not lengthen
the landing page. The home page uses `description_short` and selected named
blocks, while supporting pages use fuller content.

## Shared presentation

- `src/layouts/SiteLayout.astro` owns the header, navigation, footer, title, and
  description. All routes use it.
- `src/styles/global.css` contains the shared navy, burgundy, white, typography,
  spacing, and responsive layout rules.
- `src/pages/index.astro` renders the curated landing page.
- `src/pages/[page].astro` renders the supporting page selections. The Work History
  page also uses the full body of the selected profile.
- `src/components/ContentEntry.astro` presents the detailed content records.

Typography uses locally available serif and system fonts. No hosted font,
charting service or client framework is required. Pagefind supplies the case
search interface and static search index.

## Portrait and contact

The profile Markdown has an optional `portrait` object:

```yaml
portrait:
  image: reymundo-gomez.png
  alt: Reymundo Gómez wearing a dark blazer and white shirt.
  source_url: https://cipherblade.com/expert-witness/crypto-experts/
```

`image` names a local file in `src/assets/`. The portrait component checks that
the file exists and preserves its dimensions. Replace the file to use a newer
photo, or change the filename and alt text in `content/profile/reymundo.md`.

The initial portrait is the unmodified 294 × 312 PNG linked beside Reymundo's
biography on the official CipherBlade expert page:

- Source page: https://cipherblade.com/expert-witness/crypto-experts/
- Original image: https://cipherblade.com/wp-content/uploads/2024/06/Remundo-Website-Portrait-v1.png
- Local asset: `src/assets/reymundo-gomez.png`

The source page identifies the subject by name. It carries CipherBlade's
copyright notice and does not specify a separate image reuse license. No AI
portrait, alteration, or generated likeness was used. A higher-resolution
owner-supplied original can replace this asset later.

Professional contact currently links to the LinkedIn profile listed in the
resume. To use email instead, set the profile's existing `public_email` field;
the contact page, homepage, and footer derive their contact link from that one field.

## Draft behavior

`npm run dev` and the draft build show all seven main pages, the ten category pages,
and the draft article.
The ordinary production build continues to exclude draft content. Navigation
links follow visible page records, and home-page links are omitted when their
destination page is not visible. Category return links lead to Casework when
available and fall back to the home page otherwise.

Automatic Work History selection includes only visible jobs; draft jobs are
omitted from production. Explicit page references still require published
targets. Each page is published through its Markdown `publication_status`.
The existing relationship validator continues to reject published pages that
select draft content. Site metadata remains `noindex` during development.

## Navigation and section order

Every page can set `navigation: { label: Home, order: 10 }` in its frontmatter.
Lower values appear first; omitting navigation hides the menu item. The current
order is Home, Work History, Casework, Credentials, Expertise, Articles, Contact. The
renamed Work History page retains `/about/` to preserve existing links.

Supporting pages set `section_order`, a list of collection names such as
`experience`, `charts`, `projects`, `credentials`, `education`, `expertise`,
`interests`, and `callouts`. Listed sections render only when they have content;
unlisted sections are omitted. The Astro templates still define each section's
visual layout and the curated homepage structure.

## Adding a position

Copy `templates/experience.md` into `content/experience/`. Give it a unique slug,
role, organization, date periods, narrative, and `display_order`. Work History's
`experience_source: all` automatically includes visible job files, including files
in subfolders. No change to its page list is needed. The homepage's small
organization selection is intentionally curated separately.

Lower `display_order` values appear first. Existing positions use 10, 20, 30,
40, 50, and 60; use an intermediate number to insert a role. Explicitly numbered
jobs precede all unnumbered jobs. Among ties or unnumbered jobs, current roles
come first, then the most recent start month, then slug for a stable tie-break.
The timeline rows and job details use the same ordering. Undated jobs appear in
a separate linked list below the plot because their duration is not known.

The timeline plots horizontal bars against one shared calendar-year axis. Bar
positions and lengths use the job periods, independently of `display_order`.
Each month has equal width and the end month is included. A role with separate
periods has separate bars, so gaps and concurrent roles remain visible. Open
periods extend through the month when the site is built; rebuild to refresh that
endpoint. A future open period is a start marker until it begins. The plot
scrolls horizontally on small screens, keeping position labels visible.

Timeline bars and position links jump to and open role
details, including initial links and back/forward navigation. For ADC LTD NM,
the current role is confirmed, but start dates and detailed duties are not yet
known: `periods: []` and `active_position: true` avoid inventing them. Once dates
are supplied, populate `periods` and remove the explicit active flag.

## Color mode

The header toggle switches light/dark mode and remembers the choice in local
browser storage across pages and visits. Without a saved choice it follows the
system preference. Both modes use the shared CSS variables, including chart
surfaces, tables, notices, and keyboard focus styles. No external dependency is
used for theme state.
