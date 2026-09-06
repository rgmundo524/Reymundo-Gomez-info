# Reymundo Gómez: personal site foundation

Astro, reusable Markdown, and a local devenv environment for
`https://reymundo-gomez.info`.

This first version establishes the content model and a simple content preview.
The visual website design and public deployment come later. Resume-based example
entries are drafts; an ordinary production build excludes them.

## Start locally

Install Nix and [devenv](https://devenv.sh/getting-started/) on your computer, then
run these commands from this repository:

```sh
devenv shell
npm ci
npm run dev
```

Open the localhost URL printed by Astro, normally `http://127.0.0.1:4321`.
After installing dependencies, `devenv up` also starts the configured site process.

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

The devenv shell also provides `site-setup`, `site-check`, `site-build`, and
`site-drafts` as shortcuts. All invoke the same npm commands.

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
| `content/pages/` | Page introductions and selected content IDs |
| `templates/` | Copyable examples; never loaded into the site |
| `src/content/schemas.ts` | Shared authoring rules |
| `src/components/` | Reusable rendering components |
| `src/pages/` | Website routes |

The home page selection lives in `content/pages/home.md`. Its lists determine
which entries appear and in which order. Other content files supply the writing.

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

## Source material

Initial examples were drafted from the supplied August 21, 2026 resume. They need
editorial review, including dates, exact titles, credential names, and attribution.
The original PDF, home address, personal email addresses, and references' contact
details are not included. This repository is not licensed for third-party reuse.
