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

The current navigation inserts Articles before Contact, using `order: 55` in
`content/pages/articles.md`. Its `section_order: [articles]` selects the automatic
article listing. A starter introduction remains a draft for review.

## Search casework

Pagefind supplies full-text search and filters for dataset, investigation type,
category, network, and status on Casework. Each result represents one case and
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
`src/components/CaseSearch.astro` uses Pagefind's supplied web components.

## Optional editor later

The current source remains Markdown in Git. Keystatic has not been installed.
A practical next step is Keystatic in local mode behind the existing local or
Tailscale access: its editor writes files into the checkout on the machine running
Keystatic. Commit and push those files through the usual Git workflow.

Cloudflare Pages can build the public site from that repository, including after
it becomes private. It serves generated output; the build filesystem is not the
persistent editorial store. GitHub Actions is unnecessary for its Git integration.

For remote editing, Keystatic's GitHub mode commits content to the repository
through an authorized GitHub App. Hosting that admin also requires an appropriate
runtime for its API routes. Keystatic documents Node.js requirements; deployment
compatibility should be validated separately before choosing a Cloudflare-hosted
admin. The public site can remain static on Cloudflare regardless of where the
editor runs. Uploaded assets should likewise use configured repository paths
initially; larger media storage can be introduced when it is needed.

MDX is now enabled for reusable components, imports, and expressions in content.
Existing `.md` files remain supported. Markdoc is not installed. A future Keystatic
configuration will need to map the supported editor components to these MDX
components; arbitrary MDX code is not automatically editable through its visual UI.

Sources: [Keystatic local mode](https://keystatic.com/docs/local-mode),
[GitHub mode](https://keystatic.com/docs/github-mode),
[Cloudflare Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/),
[Pagefind Node API](https://pagefind.app/docs/node-api/),
[Astro MDX](https://docs.astro.build/en/guides/integrations-guide/mdx/),
[Astro Markdoc](https://docs.astro.build/en/guides/integrations-guide/markdoc/).
