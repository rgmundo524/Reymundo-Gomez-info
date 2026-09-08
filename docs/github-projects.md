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

Edit `content/pages/about.md`. Include `github` in `section_order` to position the
section. `blocks.github_heading` and `blocks.github_intro` control its heading
and introduction. Each item in `github_groups` has:

| Field | Meaning |
| --- | --- |
| `id` | Unique section identifier |
| `title` | Displayed group heading |
| `account` | GitHub user or organization name; use `null` for an unconfigured group |
| `enabled` | Whether the group is displayed; an enabled group requires an account |
| `repositories` | Ordered list of repository names owned by that account |

The personal group currently features only `rgmundo524/Reymundo-Gomez-info`.
Other public repositories are not automatically included. Review a project and
then add its name to the list. The list is curated, not an account-wide feed.
Remove a repository from this public selection when making it private or when
it is no longer appropriate to feature. The card service has no access to your
private repositories. Repository names are explicitly stored in this page's
Markdown, so visibility changes on GitHub do not edit that list automatically.

The Go-Crypto group is disabled with `account: null` until an organization exists.
Once created, set its actual account name, add selected public repository names,
and set `enabled: true`. Empty repository lists can still show the group's
GitHub profile link; disabled groups render nothing.

Cards have transparent backgrounds and follow the site's explicit light/dark
toggle. Images load lazily and request disabled SVG animations. If the external
service is unavailable, local development and builds still work and the ordinary
links remain present. `GitHubProjects.astro` owns the wrapper and theme parameters;
the external integration renders the repository cards.

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
