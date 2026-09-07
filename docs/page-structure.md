# Page structure and visual design

The site is organized for attorneys, investigators, and other professional
contacts who need to understand Reymundo's focus and then inspect the relevant
background or work.

| Route | Content selection | Purpose |
| --- | --- | --- |
| `/` | `content/pages/home.md` | Portrait, introduction, three expertise highlights, selected work, contact link |
| `/about/` | `content/pages/about.md` | Full biography, employment history, and personal interests |
| `/expertise/` | `content/pages/expertise.md` | Full descriptions of all expertise areas and analytical approach |
| `/casework/` | `content/pages/casework.md` | Interactive charts, selected projects, and investigation experience |
| `/credentials/` | `content/pages/credentials.md` | Certifications, training, and education |
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
- `src/pages/[page].astro` renders the supporting page selections. The About
  page also uses the full body of the selected profile.
- `src/components/ContentEntry.astro` presents the detailed content records.

Typography uses locally available serif and system fonts. No hosted font,
charting service, client framework, or additional dependency is required.

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
the header, homepage, and footer derive their contact link from that one field.

## Draft behavior

`npm run dev` and the draft build show all five pages and the ten category pages.
The ordinary production build continues to exclude draft content. Navigation
links follow visible page records, and home-page links are omitted when their
destination page is not visible. Category return links lead to Casework when
available and fall back to the home page otherwise.

Each page is reviewed and published through its Markdown `publication_status`.
The existing relationship validator continues to reject published pages that
select draft content. Site metadata remains `noindex` during development.
