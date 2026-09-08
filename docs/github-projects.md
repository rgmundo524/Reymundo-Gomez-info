# GitHub projects on About

The About page uses ready-made repository pin cards from
[GitHub Stats Extended](https://github.com/stats-organization/github-stats-extended).
It is the maintained successor named by
[GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats).
No React integration, GitHub token, or new package is needed. SVG cards are
loaded from the public card service; their metadata is subject to its caching
and availability. The site always provides normal repository and profile links,
independently of the images.

## Select projects in Markdown

Copy `templates/repositories.md` into `content/repositories/` for each project.
Both `.md` and `.mdx` work. Each file contains all the input the GitHub card
integration needs; the body supplies your longer project description.

| Repository field | Meaning |
| --- | --- |
| `slug` | Stable selection ID, independent of the repository's name |
| `owner`, `repository` | Exact GitHub account and repository name, without a URL |
| `title`, `description_short` | Your displayed title and introduction |
| `contribution` | Your actual role or contribution |
| `group` | An ID from the page's `github_groups` |
| `display_order` | Lower numbers first within the group; ties retain page selection order |
| `show_stats` | Load the prebuilt GitHub Stats Extended card; false keeps the local text and links |
| `publication_status` | Drafts appear only in local development and draft builds |
| `links` | Optional documentation, demo, or project links |
| Markdown body | Longer description, expanded with About this project |

Then add its slug to the page's **top-level** `repositories` list:

```yaml
repositories:
  - personal-website
```

Adding a file alone does not feature it. Explicit selection makes reviewing a
repository part of adding it to the portfolio. The initial record is
`content/repositories/personal-website.md`; no other repositories are indexed.
Repository URLs and the statistics requests are derived from `owner` and
`repository`, so there is no second hardcoded URL to maintain. Validation catches
missing selections, duplicate owner/name pairs, and owner/group mismatches.

Edit `content/pages/about.md` to position the section with `github` in
`section_order`. `blocks.github_heading` and `blocks.github_intro` control its
heading and introduction. Each item in `github_groups` has:

| Field | Meaning |
| --- | --- |
| `id` | Unique section identifier |
| `title` | Displayed group heading |
| `account` | GitHub user or organization name; use `null` for an unconfigured group |
| `enabled` | Whether the group is displayed; an enabled group requires an account |

The personal group currently features only `rgmundo524/Reymundo-Gomez-info`.
Other public repositories are not automatically included. Review a project and
then create its Markdown record and select its slug. Remove the selection if a
repository's name or description should no longer be public. `show_stats: false`
only hides the external image; the local description and repository link remain.
The card service has no access to your private repositories. Changes to GitHub
visibility do not automatically edit your Markdown selections.

The Go-Crypto group is disabled with `account: null` until an organization exists.
Once created, set its actual account name, create and select records with that
`owner` and `group: go-crypto`, and set `enabled: true`. Group order follows the
written `github_groups` list. Empty groups can still show the group's
GitHub profile link; disabled groups render nothing.

Cards have transparent backgrounds and follow the site's explicit light/dark
toggle. Images load lazily and request disabled SVG animations. If the external
service is unavailable, local development and builds still work and the ordinary
links remain present. `GitHubProjects.astro` owns the wrapper and theme parameters;
the external integration renders the repository cards. `RepositoryCard.astro`
renders the selected record's text, links, and details.

The process is **Markdown record → Astro validation and build → GitHub widget**.
This uses the existing widget, not a Cloudflare Worker. No background sync,
GitHub token, Actions workflow, or database is required. Local text updates after
editing and rebuilding; external statistics refresh according to the provider's
cache. The public widget's availability does not determine whether Astro builds.

## Account and repository ownership

Keep `rgmundo524` as the personal identity used for contributions. Create Go-Crypto
as an organization from GitHub **Settings → Organizations → New organization**.
GitHub Free is sufficient to start an organization, including private repository
storage with the free plan's feature limits. Organization members sign in with
their own personal accounts; there is no shared organization login.

Recommended organization of this work:

- Personal website and independent projects: the personal account.
- Go-Crypto's website, educational materials, and organization tools: the
  Go-Crypto organization.
- CipherBlade repositories: their existing owners; your account contributes
  through the access CipherBlade grants.

Private repositories do not require a separate account. A transfer changes who
administers the repository but preserves its Git history and contribution
information. If a repository should move, create the destination organization,
use the repository's **Settings → General → Transfer ownership**, and update
local Git remotes and relevant integrations afterward. Avoid recreating a
repository at the old location, which would remove GitHub's automatic redirect.
No organization has been created and no repository has been transferred by this
website change.

Official references, checked September 8, 2026:
[account types](https://docs.github.com/en/get-started/learning-about-github/types-of-github-accounts),
[create an organization](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/creating-a-new-organization-from-scratch),
[transfer a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository).
