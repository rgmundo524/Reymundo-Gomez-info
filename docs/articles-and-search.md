# Articles and case search

## Add an article

Copy `templates/articles.md` into `content/articles/your-article.md`, or use
`templates/articles.mdx` for reusable components. Its `slug`
sets `/articles/<slug>/`; the filename is only for organizing source files.
The Articles listing discovers files automatically, including subfolders.

| Field | Meaning |
| --- | --- |
| `title` | Article heading and listing link |
| `description_short` | Summary in the listing and page metadata |
| `publication_status` | `draft` appears locally; `published` also appears in production |
| `published_on` | Quoted `YYYY-MM-DD`, required for published articles; `null` for undated drafts |
| `updated_on` | Optional revision date, never earlier than publication |
| `tags` | Unique lowercase topics, e.g. `blockchain-analysis` |
| `related_cases` | Case slugs, checked against the case collection |
| `blocks.takeaway` | Optional reusable takeaway displayed above the article |
| `links` | Optional labeled sources displayed under Further reading |
| `editorial_note` | Source-only editing notes, omitted from rendered pages |

Write the article body below the frontmatter in Markdown or MDX. Articles sort
by `published_on`, newest first, then slug. Undated drafts appear last. The date
does not schedule publication: `publication_status` controls visibility.
Published articles cannot reference draft case records. Publish the Articles
page and its required profile separately to include it in public navigation.

Articles follows About in the navigation, using `order: 55` in
`content/pages/articles.md`; Contact is a separate header button. Its `section_order: [articles]` selects the automatic
article listing. A starter introduction remains a draft for review.

## External articles, blogs, and reports

The hub now has **My writing** and **Recommended reading**. Your original articles
keep their existing routes and MDX capabilities. External sources live separately
under `content/reading/`, one Markdown file per source, and are discovered
automatically. Their cards link directly to the original publisher; they do not
create local article routes or imply that you authored the source.

Copy `templates/reading.md` and supply:

| Field | Meaning |
| --- | --- |
| `title`, `description_short` | Source title and your own concise description |
| `reading_type` | `article`, `blog`, or `report`, displayed as a label |
| `source.url` | Original HTTP(S) destination, including PDF reports |
| `source.publisher` | Required publisher attribution |
| `source.author` | Optional original author |
| `source.published_on` | Optional quoted source publication date; null if unknown |
| `added_on` | Date you added it to the reading list; required when publishing |
| `tags` | Topics displayed on the card |
| `content_kind` | `example` until reviewed; `recommendation` for an approved selection |
| Markdown body | Your reading notes, shown under an expandable Reading notes control |

Recommendations sort by `added_on`, newest first, then slug. The date the source
was published is separate: an older report can be a newly added recommendation.
Do not infer publication dates from report years. Draft entries stay in local
previews; examples cannot be published. The IC3 2025 report entry demonstrates
attribution and linking and is clearly marked as an example awaiting review.
Its [original report](https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf)
and [report archive](https://www.ic3.gov/annualreport/reports) were checked against
the official IC3 website.

`blocks.writing_heading`, `blocks.reading_heading`, and `blocks.reading_intro` in
`content/pages/articles.md` control the labels. Use short original annotations and
links; do not copy full external articles. No external site is scraped at build
time, and no additional database or package is required for this reading list.
Pagefind remains scoped to Casework.

## Search casework

Pagefind supplies full-text search and filters for dataset, investigation type,
category, network, and status on Casework. The two sunbursts above the search
control this same result list using full classification paths. Switching between
Criminal investigations and Litigation Support Investigations clears the old
branch and other filters while retaining the typed query. Reset search and
filters clears both and hides the results again. The input and filter tools are
visible immediately; result counts and records appear only when a nonblank query
or filter is active. Whitespace-only queries do not expand an unfiltered list.
Each result represents one case and
links directly to that case's existing category-page anchor. Examples carry an
explicit `Example:` title and their own dataset filter.

The index derives from the Casework page's selected charts and the same case
visibility rules as the charts. A production build includes published real cases
only. Draft previews include examples and drafts. Editorial notes and unused
named blocks are excluded from search. Search indexes summaries, narrative,
displayed investigative questions, dates, role, networks, assets, jurisdictions,
services, and link labels. Numeric metrics remain available in the case details
and statistics; they are not full-text search fields.

MDX case bodies contribute literal prose, including text inside components.
Imports, exports, JavaScript expressions, and component attributes are omitted.
If a component generates important text from props or code, describe that content
in the case's summary or body as well so readers can find it through search.

`npm run dev` serves an in-memory index. Content edits, additions, and removals
invalidate it; the next search asset request rebuilds it. Reload the Casework
page after editing content to load the fresh index into the browser. Concurrent
requests share one build, and invalid content produces an error instead of
serving an old index. No preliminary static build is required.

`npm run build` and `npm run build:drafts` generate search assets inside their
respective output directories. Search runs in the visitor's browser and needs no
hosted search service, database, GitHub Actions, or server-side search endpoint.
The ordinary charts and case lists remain usable without JavaScript.

Implementation: `src/lib/search.ts` selects case fields;
`scripts/search-index.ts` builds and refreshes indexes;
`integrations/case-search.ts` connects Astro's development and build hooks;
`src/components/CaseSearch.astro` uses Pagefind's supplied web components;
`src/lib/case-search-filters.ts` and `src/scripts/case-search.ts` synchronize
chart selections, native dropdowns, and the one Pagefind instance. The hidden
`CasePath` filter indexes ancestry prefixes and exact terminal classifications,
so deeper categories never become unrelated peer tags.

## Optional editor later

The current source remains Markdown in Git. Keystatic has not been installed.
A practical next step is Keystatic in local mode behind the existing local or
Tailscale access: its editor writes files into the checkout on the machine running
Keystatic. Commit and push those files through the usual Git workflow.
It could present separate forms for My writing and Recommended reading while
preserving the current Markdown files. This is an editor integration, not a new
blog theme; the Astro components continue to determine the page layout.

Cloudflare Pages can build the public site from that repository, including after
it becomes private. It serves generated output; the build filesystem is not the
persistent editorial store. GitHub Actions is unnecessary for its Git integration.

For remote editing, Keystatic's GitHub mode commits content to the repository
through an authorized GitHub App. Hosting that admin also requires an appropriate
runtime for its API routes. Current Astro Cloudflare adapter documentation removes
Pages support and targets Workers, so a hosted admin needs its own compatibility
review. This does not require changing the existing adapter-free static site.
The public site can remain static on Cloudflare regardless of where the editor
runs. Uploaded assets should likewise use configured repository paths
initially; larger media storage can be introduced when it is needed.

MDX is now enabled for reusable components, imports, and expressions in content.
Existing `.md` files remain supported. Markdoc is not installed. A future Keystatic
configuration will need to map supported editor components to these MDX components.
Keystatic's MDX field specifically excludes imports and raw HTML. The current
starter article imports Astro components, so it must be reviewed or adapted before
it can use that editor. Keystatic has a documented recipe to keep the admin local
and exclude its runtime from production.

**Decap CMS** is a second option for a conventional Markdown/frontmatter editor.
It provides an existing admin UI and local proxy; a remote GitHub backend needs
repository push access and an OAuth service. Private-repository access and that
service must be configured before enabling remote editing. It is not installed.
For this site, begin with the existing collections and add Keystatic if its editor
fits the writing workflow; choose Decap if a simpler Markdown editor is preferred.
Avoid replacing the whole site's theme just to add a blog.

The official `@astrojs/rss` package is an optional later addition for publishing a
subscription feed. It does not import or curate outside feeds. Neither a feed nor
a CMS has been added by this change.

Sources: [Keystatic local mode](https://keystatic.com/docs/local-mode),
[GitHub mode](https://keystatic.com/docs/github-mode),
[Cloudflare Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/),
[Pagefind Node API](https://pagefind.app/docs/node-api/),
[Astro MDX](https://docs.astro.build/en/guides/integrations-guide/mdx/),
[Astro Markdoc](https://docs.astro.build/en/guides/integrations-guide/markdoc/).

Additional integration references:
[Keystatic MDX](https://keystatic.com/docs/fields/mdx),
[local-only Keystatic admin](https://keystatic.com/docs/recipes/astro-disable-admin-ui-in-production),
[Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#removed-cloudflare-pages-support),
[Decap installation](https://decapcms.org/docs/install-decap-cms/),
[Decap local proxy](https://decapcms.org/docs/decap-proxy/),
[Decap GitHub backend](https://decapcms.org/docs/github-backend/),
[Astro RSS](https://docs.astro.build/en/recipes/rss/).
