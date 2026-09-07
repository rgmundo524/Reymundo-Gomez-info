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
The linked role list and job details use the same ordering. The chart itself
uses dates for position and duration, independently of `display_order`.

### Serpentine timeline

Work History uses locally bundled **amCharts 5**, loaded only when the timeline
approaches the viewport. Its transparent canvas, plot, and axis labels leave the
site-wide particle animation visible. The chart follows light/dark mode and
respects reduced motion. No hosted chart service, account, or React is needed.

`content/pages/about.md` controls the timeline:

```yaml
timeline:
  start: "2016-01"
  levels:
    desktop: 3
    mobile: 5
```

- `start`: first displayed month, or `null` to start in January of the earliest
  recorded role. It must be on or before the earliest role, so no history is
  silently clipped. The configured 2016 start matches the existing timeline.
- `levels.desktop` and `levels.mobile`: straight runs along the winding path,
  between 2 and 8. Three runs means two bends. Mobile layout applies when the
  chart container is 700px wide or narrower. Height adjusts to fit the runs and
  concurrent tracks.
- The endpoint includes the current build month and any scheduled periods.
  Rebuild the site to advance current roles to a new month.

A true UTC date axis preserves elapsed time, so months have their actual calendar
lengths. End months are inclusive: a June end is drawn through July 1. Separate
employment periods remain separate bands. Overlapping periods automatically use
adjacent lanes along the same axis. A future role with no end date has only a
start marker until it begins. Colors identify positions; tooltips include dates
and current/past/scheduled status. Current endpoints have larger markers.

Visitors can select bands or role links to open the job details, including with
the keyboard. Links work before JavaScript loads, when charts cannot load, and
in print. Hash navigation and back/forward navigation preserve selection. Zoom
in/out, earlier/later, full-timeline reset, and the range slider navigate the
chart. Desktop pointer users can drag along the line to select a zoom range.
Touch users use the controls and slider; ordinary page scrolling remains free.
The visible range survives theme changes, resizing, and browser back/forward
cache restoration.

For ADC LTD NM, the current role is confirmed, but its start date is not yet
known: `periods: []` and `active_position: true` keep it in the linked undated
list. Once dates are supplied, populate `periods` and remove the explicit flag.

The amCharts logo/backlink is retained under its free-use license. The license
is included at `/vendor/amcharts-LICENSE.txt`; no paid key is configured. The
serpentine chart is marked experimental by its authors. Dependency versions are
pinned, and the HTML role links remain available independently of the chart.

References: [timeline documentation](https://www.amcharts.com/docs/v5/charts/timeline/),
[accessibility](https://www.amcharts.com/docs/v5/concepts/accessibility/),
[licensing](https://www.amcharts.com/download/).

## Color mode

The header toggle switches light/dark mode and remembers the choice in local
browser storage across pages and visits. Without a saved choice it follows the
system preference. Both modes use the shared CSS variables, including chart
surfaces, tables, notices, and keyboard focus styles. No external dependency is
used for theme state.
