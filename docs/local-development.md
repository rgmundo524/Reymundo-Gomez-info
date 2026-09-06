# Local development with devenv

`devenv.nix` provides Node 24, npm, Git, and a foreground site process. No services,
databases, container runtime, or deployment account are required.

## Reproducibility

Run `devenv shell` and commit the resulting `devenv.lock` after successful
activation. The existing `devenv.yaml` already selects an exact nixpkgs commit.
Update the input deliberately when you want a newer Node/Nix package set; then
regenerate and commit the lockfile. npm's separate lockfile is already included.

Use `npm ci` after cloning or after `package-lock.json` changes. It installs the
locked dependency graph. Do not enable automatic dependency updates on shell
activation. For project changes, edit the manifest intentionally and use
`npm install` to update the lockfile.

The example input is documented by [devenv's input guide](https://devenv.sh/inputs/).
See [JavaScript options](https://devenv.sh/languages/javascript/) and
[process management](https://devenv.sh/processes/).

## Local settings

Use `devenv.local.nix` or `devenv.local.yaml` for machine-specific overrides; both
are ignored by Git. The optional `.envrc` enables direnv integration. Export
`TAILSCALE_HOSTNAME` in the shell before starting Astro if using Tailscale Serve.
The `.env.example` documents that variable; the Astro config intentionally reads
the shell environment, rather than assuming a copied `.env` file is loaded.

## Serving through Tailscale

Astro listens on `127.0.0.1`. Set the exact Tailscale hostname so Astro accepts the
proxy's Host header, then run `tailscale serve 4321` in a separate terminal. Use
the actual port printed by Astro if it differs. Ctrl+C ends the foreground Serve
session. For an existing background Serve configuration, inspect
`tailscale serve status` before changing it.

Tailscale Serve is restricted to the tailnet and provides a tailnet HTTPS name.
It may request enabling tailnet HTTPS on first use. Tailscale is assumed to be
installed and managed on your host OS; it is not installed as a development daemon.

For a permanently running version on your home server, use `npm run build` and
serve the resulting `dist/` through your normal static web server, then point
Tailscale Serve at that server. `astro preview` is a development preview, not a
production server. [Tailscale documentation](https://tailscale.com/docs/features/tailscale-serve)

## Cloudflare Pages later

When ready, create a Pages project with Git integration and authorize access to
this repository. Set Node 24, build command `npm run build`, and output directory
`dist`. Keep `CONTENT_PREVIEW` unset. The same validation runs locally and there.

Git integration can later have automatic builds disabled while still accepting
manual Wrangler deployments. A Direct Upload project cannot later enable Git
integration without creating a new project.

Add `reymundo-gomez.info` to the Pages project's custom domains at launch. Serving
the apex through Pages requires Cloudflare nameservers; registration can remain
with the existing registrar. No GitHub Actions workflow is needed.

References: [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/),
[build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/),
[custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).
