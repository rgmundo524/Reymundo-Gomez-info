# Complete example site data

This starter provides every current site page and reusable content type except
Articles, which remains inactive. It is independent of Reymundo's resume-based
content. Fictional records are labelled as examples and all entries remain drafts.

From the builder repository, outside an existing devenv shell:

```sh
devenv -O env.SITE_DATA_DIR:string examples/site-data shell -- site-export ../reymundo-site-data
devenv -O env.SITE_DATA_DIR:string ../reymundo-site-data shell
```

Then run `site-dev` to view the copied data. `site-export` requires a new destination
and will not overwrite a folder you have already customized. This README stays
in the builder; its instructions also live in `docs/external-content.md`.

`../reymundo-site-data` is a sibling of the builder folder. It is the data root,
not the folder containing every Markdown file directly. For example, a job lives
at `../reymundo-site-data/content/experience/example-current-role.md`.

## What to edit

| Location | Contents |
| --- | --- |
| `site.json` | Change example.com to your website's domain |
| `content/profile/your-name.md` | Name, headline, biography, initials, and optional portrait |
| `content/pages/` | All seven page introductions, selected records, group and section order |
| `content/experience/` | Two example roles with dates for the timeline |
| `content/expertise/` and `content/callouts/` | Expertise descriptions and your approach |
| `content/credentials/` and `content/education/` | Three credentials across two issuers, plus an education example |
| `content/cases/` | Seven fictional cases with category paths, status, dates, and metrics |
| `content/charts/` | Criminal and litigation support category definitions |
| `content/projects/` | Selected-work example |
| `content/skills/` | Six skills grouped into three cards with illustrative ratings |
| `content/activities/` | Volunteer, professional organization, and DAO examples |
| `content/interests/` | Two hobby examples |
| `content/repositories/` | GitHub record, hidden until configured with a real account and enabled |
| `content/contacts/your-name.md` | Two service cards and one combined personal/social card |
| `content/resources/` | Four official resource links, one in each resource category |
| `assets/` | Add your own portrait; credential badges go in `assets/credentials/` |

Start with your profile and site URL, then edit one section at a time. The summary
for a card is `description_short`; the body below the second `---` is the full text.
The `blocks` map holds reusable callouts and other named text.

Keep existing `slug` values while editing the first draft. If you rename a slug,
update references in pages and linked records. Each job, credential, skill, hobby,
project, and case has its own file. Related skills share `group` to appear in the
same card. Issuer order is in `content/pages/credentials.md`.

The About introduction is `.mdx` to demonstrate the existing Callout component.
The individual content records use ordinary `.md`. Both use the same frontmatter
and references. No CMS or additional package is needed for this starter.

## Examples and publishing

All seven cases have `content_kind: example`. The chart/search preview uses their
fictional counts and amounts while actual case totals stay separate. A
`subcategory` list is one path from broad to specific, not several equal tags.
Compare case-001 and case-002, then case-005 and case-006, to see sibling branches.

Skills and activities also use `content_kind: example`. Replace the information
before changing them to `profile`. Replace fictional case details before changing
cases to `case_study`. Unknown facts should remain null. The example job dates,
credential names, and skill scores are not facts about you.

Contact links use example.com/example.org and need replacing. No real email,
phone, booking link, portrait, certification seal, GitHub account, or affiliation
is implied. After adding a real GitHub owner/repository, update the corresponding
`github_groups` account and enabled flag in `content/pages/about.mdx`.

Use `site-check` while editing. `site-drafts` includes draft content;
`site-build` only renders published entries, so an untouched starter shows the
preparation page in production. Review referenced records together before marking
them published. Treat images in `assets/` and everything in an optional `public/`
directory as publishable files, even when their related text remains draft.
