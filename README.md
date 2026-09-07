# Reymundo Gómez: personal site foundation

Astro, reusable Markdown, and a local devenv environment for
`https://reymundo-gomez.info`.

This version has a focused professional landing page, a profile portrait, and
supporting About, Expertise, Casework, and Credentials pages. Reusable Markdown
supplies the content across all routes. Content entries remain drafts for local
development; an ordinary production build excludes them.

## Start locally

Install Nix and [devenv](https://devenv.sh/getting-started/) on your computer, then
run these commands from this repository:

```sh
devenv shell
npm run dev
```

Open the localhost URL printed by Astro, normally `http://127.0.0.1:4321`.
devenv supplies Node and npm, installs Astro and the other project dependencies
from `package-lock.json`, and exposes the local commands inside the environment.
The first activation needs network access to download any uncached dependencies.
Subsequent activations reuse the installation while the dependency inputs match.

You can also run `devenv up` to initialize the environment and start the configured
site process in one command.

Node 24 is selected in `devenv.nix`. The npm dependency versions are pinned in
`package-lock.json`, and `devenv.yaml` pins the nixpkgs input to an exact revision.
The first `devenv shell` creates `devenv.lock`; commit that generated lockfile.
Nix and devenv were unavailable in the scaffold environment, so their activation
has not been executed there. The Astro checks and builds are verified separately.

The included `.envrc` is optional. If you use direnv, review it and run
`direnv allow`. Otherwise, continue using `devenv shell`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Live local preview, including drafts |
| `npm run check:content` | Check Markdown fields, dates, IDs, and references |
| `npm run check` | Content checks and Astro/TypeScript diagnostics |
| `npm run build` | Check and compile published content into `dist/` |
| `npm run preview` | Inspect the published-content build locally |
| `npm run build:drafts` | Check and compile all content into `dist-drafts/` |
| `npm run preview:drafts` | Inspect the separate draft build locally |
| `npm test` | Check important invalid-content cases |

The devenv shell also provides `site-check`, `site-build`, and `site-drafts` as
shortcuts. `site-setup` remains available to force a clean dependency reinstall
when troubleshooting; it is not required for normal startup.

All initial entries are drafts, so the ordinary build intentionally shows only
“Site in preparation.” Use `npm run dev` to see the populated content preview.
Draft builds are stored separately to keep them out of a future `dist/` upload.
Keep `CONTENT_PREVIEW` unset during normal builds. Both preview modes currently
include `noindex` metadata; public launch will include a deliberate metadata pass.

## Edit content

Start with [the content guide](docs/content-guide.md). Copy an appropriate file
from `templates/` into the matching collection under `content/`.

| Directory | Contents |
| --- | --- |
| `content/profile/` | Identity, public contact fields, and biography variants |
| `content/experience/` | Employment roles, date ranges, and achievement bullets |
| `content/education/` | Degrees and attendance records |
| `content/credentials/` | Certifications, certificates, and training |
| `content/expertise/` | Areas of expertise |
| `content/projects/` | Selected work and public project references |
| `content/interests/` | Personal interests |
| `content/callouts/` | Independently reusable passages |
| `content/charts/` | Case categories and counts for reusable donut charts |
| `content/cases/` | Individual case summaries linked to a chart category |
| `content/pages/` | Page introductions and selected content IDs |
| `templates/` | Copyable examples; never loaded into the site |
| `src/content/schemas.ts` | Shared authoring rules |
| `src/components/` | Reusable rendering components |
| `src/pages/` | Website routes |

Each file in `content/pages/` selects the entries for that page and their order.
The home page presents a small selection; the supporting pages provide the full
background and details. Other content files supply the writing. See
[the page structure guide](docs/page-structure.md) for the route map and portrait.

## Access through Tailscale

Keep Astro bound to localhost. If using Tailscale Serve, allow only your exact
Tailscale hostname before starting Astro:

```sh
export TAILSCALE_HOSTNAME=your-device.your-tailnet.ts.net
npm run dev
```

In a second terminal:

```sh
tailscale serve 4321
```

Use the HTTPS URL returned by Tailscale. Check Astro's printed port if 4321 is
already occupied. This project does not start or configure Tailscale automatically.
See [local development](docs/local-development.md) for persistent server notes.

## Public hosting later

The intended host is Cloudflare Pages connected directly to the private GitHub
repository. Use `npm run build` as its build command and `dist` as its output
directory, with Node 24. GitHub Actions is not required. No Cloudflare project,
DNS records, GitHub Actions workflows, or public site are created by this scaffold.

## Resume content

The content inventory contains 57 draft entries, including resume-based content
and illustrative case examples: one profile, five roles, eleven credentials and training records,
three education records, seven expertise areas, two selected-work entries,
nine interests, two callouts, two case charts, ten case examples, and five page selections.

The interactive case charts use the same reusable SVG component without additional packages.
Edit counts in `content/charts/criminal-investigations.md` and
`content/charts/professional-investigations.md`; totals and percentages are calculated.
The professional chart covers non-criminal investigations, with one sample case
in each of four categories (four total, 25% each). The criminal chart retains
varied sample counts to exercise unequal slices. Slice and legend links open
category pages populated from `content/cases/`. Aggregate counts stay independent
of the number of selected summaries. See
[case chart authoring](docs/case-charts.md) for the fields and review workflow.

See [the resume review notes](docs/resume-content-review.md) for source ambiguities
and details that still need confirmation. The supplied PDF, personal contact
details, and professional references are not included. Draft status controls the
website build; the Markdown and editorial notes remain visible in GitHub while
the repository is public.

This repository is not licensed for third-party reuse.
