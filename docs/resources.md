# Resources

Resources replaces Articles in navigation at `/resources/`. It is a directory of
guidance and links for people affected by cryptocurrency scams and online fraud.
The current groups are First steps, Reporting and support, Avoid follow-up scams,
and Reports and reference. The BDO publication remains in Selected Work.

The initial seven resource cards point to official FBI, FTC, and Office for
Victims of Crime pages. They include guidance for organizing transaction details,
IC3 reporting, preserving evidence, finding support, recognizing recovery scams,
and reading the IC3 annual report. Descriptions identify the provider, and the
page explains that the initial sources are U.S. agencies.

## Add or update a resource

Copy `templates/resources.md` into `content/resources/` and fill in:

| Field | Purpose |
| --- | --- |
| `slug` | Stable ID; also used in the card's `resource-<slug>` anchor |
| `title`, `description_short` | Card title and concise explanation |
| `category` | `first-steps`, `reporting`, `avoid-scams`, or `reports` |
| `display_order` | Lower values appear first within a category; ties use slug |
| `action_label` | Link text such as Read the guide or Go to IC3 reporting |
| `source.url` | Original destination; HTTP(S) guide, reporting channel, article, or PDF |
| `source.publisher` | Required provider attribution |
| `source.author` | Optional original author |
| `source.published_on` | Optional source publication date; leave null when unknown |
| `reviewed_on` | Quoted date when the destination and description were checked; required for published entries |
| `publication_status` | Drafts appear locally; published entries also appear in production |
| `links` | Optional additional labelled links |
| Markdown body | Extra context under About this resource |

Files are discovered automatically, including `.mdx` and subfolders. The page's
`resource_group_order` determines which categories appear and their order; empty
groups are omitted. Each listed category must be unique. Change page headings in
`content/pages/resources.md` using `blocks.resources_first_steps_heading`,
`resources_reporting_heading`, `resources_avoid_scams_heading`, and
`resources_reports_heading` under `blocks`.

Review dates are manually maintained, not an automated link check. Check the
destination and whether its scope has changed before advancing that date. Do not
use a report year as its publication date. The IC3 report retains an unknown
publication date separately from its link review date.

Use your own short descriptions and link to the source; do not copy whole guides.
Be clear about reporting versus investigation, assistance versus reimbursement,
and whether a resource is relevant to someone's location. Resource pages do not
collect complaints, case documents, or personal information.

## Existing integrations and future writing

The directory reuses Astro content collections, Astro Icon, and existing card and
disclosure styles. It requires no CMS, added package, database, or runtime fetch.
The source files remain suitable for a future Git-backed editor.

The unused starter article moved to `templates/investigation-notes.mdx`; it is no
longer active content. The former `/articles/` URL redirects to Resources whenever
Resources is visible and no real Articles page has been configured. Future
original writing can use the retained article schema and templates. See
[future articles and case search](articles-and-search.md) for activation steps.

Official sources checked September 8, 2026:

- [FBI IC3](https://www.ic3.gov/)
- [FBI cryptocurrency investment fraud guidance](https://www.fbi.gov/how-we-can-help-you/victim-services/national-crimes-and-victim-resources/cryptocurrency-investment-fraud)
- [IC3 reporting FAQ](https://www.ic3.gov/Home/FAQ)
- [FTC: What To Do if You Were Scammed](https://consumer.ftc.gov/articles/what-do-if-you-were-scammed)
- [FTC: Refund and Recovery Scams](https://consumer.ftc.gov/articles/refund-and-recovery-scams)
- [Office for Victims of Crime: Help for Victims](https://ovc.ojp.gov/help-for-victims/overview)
- [2025 IC3 Annual Report](https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf)
