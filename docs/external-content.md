# Separate site code from personal content

The builder can compile one person's site from a separate directory using
`SITE_DATA_DIR`. That directory can be a local folder or a checkout of a private
Git repository. The builder does not fetch it or require GitHub credentials.

Astro's built-in [glob loader](https://docs.astro.build/en/reference/content-loader-reference/#glob-loader)
reads the selected Markdown and MDX directly. Existing components, schemas,
Pagefind, charts, and draft rules use the same source. No new package is needed.

## Directory contract

| Path inside the selected directory | Purpose |
| --- | --- |
| `site.json` | Required configuration version and canonical site URL |
| `content/` | Required collection folders: `profile/`, `pages/`, `cases/`, etc. |
| `assets/` | Optional portrait images; badges go in `assets/credentials/` |
| `public/` | Optional files deliberately copied verbatim into the website |

For example, `../reymundo-site-data/content/experience/adc.md` is an employment
record. `../reymundo-site-data/assets/portrait.png` is selected by
`portrait.image: portrait.png` in a profile. Existing portrait and badge filenames
remain valid; the builder's previous `src/assets/` directory is now `assets/`.
Images under `assets/` are imported by the existing Astro/Vite image pipeline.
Only `public/` is copied wholesale; do not put unpublished content there.
Treat images in `assets/` as publishable too: the existing image globs can emit
matching portrait/badge files even when a record is draft or unselected. Draft
filtering controls rendered records, not confidentiality of source image files.
Shared application files such as the amCharts license stay with the builder.

`site.json` contains:

```json
{
  "version": 1,
  "url": "https://reymundo-gomez.info"
}
```

Use the origin of the person's own website, without a subpath. Canonical URLs
and social-image links use this value. Names come from the profile selected by
`content/pages/home.md`; other pages can select their profile in frontmatter.
Optional profile `blocks.initials`, `blocks.footer_tagline`, and
`blocks.portrait_caption` customize the monogram, footer, and portrait caption.
Without overrides, these derive from the name and headline. Unpublished profiles
do not supply public branding.

## Export the current site on your computer

From the builder repository, inside `devenv shell`:

```sh
site-export ../reymundo-site-data
```

The destination's parent must already exist. The command validates and copies
`site.json`, `content/`, `assets/`, and `public/` if present, plus a small Git ignore
file. It refuses an existing destination or a destination inside the builder.
It does not delete originals, create a GitHub repository, or change Git history.
If a copy fails partway through, inspect the new folder before retrying with a
new destination. The command exports the currently selected source.

## Select content through devenv

`devenv.nix` declares the default variables:

```nix
env = {
  SITE_DATA_DIR = lib.mkDefault ".";
  TAILSCALE_HOSTNAME = lib.mkDefault "";
};
```

`.` keeps using the data in this repository. Change the quoted default to your
content directory, or put a personal override in the already-ignored
`devenv.local.nix`:

```nix
{
  env.SITE_DATA_DIR = "../reymundo-site-data";
}
```

Keep content paths as quoted strings, not Nix path literals. The builder reads
the live content directory; Nix does not need to copy that data into its store.
All relative paths resolve from the builder root. Absolute paths also work.

For a one-time selection, use devenv's existing configuration override flag.
Run this from your ordinary terminal, outside an existing devenv shell:

```sh
devenv -O env.SITE_DATA_DIR:string ../reymundo-site-data shell
```

This opens Fish with that directory selected for the session. There is no manual
`export`, `.env` setup, or custom flag parser. `--option` is the long form of `-O`.
Quote paths with spaces, for example:

```sh
devenv -O env.SITE_DATA_DIR:string "../Reymundo site data" shell
```

Inside that shell, use `site-dev`, `site-check`, `site-build`, or `site-drafts`.
The `site-*` commands run from the builder root, including when invoked from a
subdirectory. Existing npm commands continue to inherit the selected variables.
You can also run a build or the managed development process without opening an
interactive shell:

```sh
devenv -O env.SITE_DATA_DIR:string ../reymundo-site-data shell -- site-build
devenv -O env.SITE_DATA_DIR:string ../reymundo-site-data up
```

The flag overrides the configured default for that invocation. It does not edit
`devenv.nix` or permanently save the selection. To keep a selection across future
sessions, use the Nix setting above. Devenv owns these environment variables;
the builder no longer reads them from `.env`. Without devenv, the existing npm
commands still accept ordinary inherited process environment variables.

A nonempty invalid directory or invalid `site.json` stops the command; it never
silently falls back to bundled personal content. Blank or unset `SITE_DATA_DIR`
retains the repository default for direct npm usage. Use an absolute path instead
of a literal `~` inside a quoted Nix setting.

Exit and re-enter the shell after changing the selected directory. Restart the
site development process after changing site settings or adding the first record
to a previously empty collection. Existing records continue to use Astro's normal
file watching; case search watches the selected content directory too.

## Fish shell

The project requires devenv 2.1 or newer and sets its native shell option in
`devenv.yaml`:

```yaml
require_version: ">=2.1"
shell: fish
```

`devenv.nix` supplies `pkgs.fish`, Node, npm, and the site commands. Run
`devenv shell` to open Fish. This does not change your system login shell.
Devenv chooses the interactive shell before evaluating the environment, so
`env.SHELL` in Nix is not the setting for this. No `exec fish` activation hook is
needed; devenv's native Fish prompt/reload integration remains in charge.

For an occasional Bash session, use `devenv --shell bash shell`. The optional
existing direnv setup only loads the environment into your current shell; use
`devenv shell` when you want the project to choose Fish.

Official references: [configuration override flags](https://devenv.sh/ad-hoc-developer-environments/),
[interactive shell setting](https://devenv.sh/reference/yaml-options/#shell), and
[devenv 2.1 native shells](https://devenv.sh/blog/2026/05/07/devenv-21-nix-with-zsh-fish-and-nushell-via-libghostty/).

## Start another person's site

Copy `examples/site-data` to a separate folder, then choose that folder using
the devenv `-O env.SITE_DATA_DIR:string` flag or the Nix default. It includes a generic profile, Home, and an MDX About example
that imports the existing Callout component. Replace the example content and
site URL; use `templates/` to add the collections and sections you need. Keep
ordinary prose in `.md` and use `.mdx` when a component helps.

MDX can import shared components using `@components/Callout.astro` and selected
images using `@site-assets/filename.png`. Relative imports remain relative to
the MDX file. MDX is trusted build input and can execute code; this is a builder
for organization-maintained content, not an untrusted upload service.

A practical repository split is one public builder and one private content repo
per person. Pin a tested builder commit/tag for reproducible builds and update
it when ready. No Git submodule or GitHub Actions subscription is required.

## Build output and migration boundaries

Only one selected directory supplies a build: bundled Markdown and images are
not merged into it. Build caches are separated by the resolved source directory
and preview mode. Empty collections are cleared. Keep builds sequential in a
single checkout: generated types and `dist/` are shared. Use separate builder
checkouts if you need concurrent builds for multiple people.

Published builds still go to `dist/`; draft builds go to `dist-drafts/`. Changing
the content source does not publish drafts. Private source storage also does
not make rendered published pages, search records, or files in `public/` private.
Only upload the intended output directory when hosting later.

The existing personal content is preserved in this repository until its private
replacement is stored and verified. After that migration, it can be removed from
the current builder tree and the generic starter can become the default. Removing
files does not erase earlier public Git commits, clones, or forks; changing public
history is a separate operation. This change does not claim to erase that history.

For Cloudflare later, the build machine needs both the public builder checkout
and the selected private content checkout (or a local build can upload `dist/`).
Selecting a local directory alone does not grant Cloudflare access to a private
repository. The present workflow stays local with devenv.
