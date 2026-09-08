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
npm run content:export -- ../reymundo-site-data
```

The destination's parent must already exist. The command validates and copies
`site.json`, `content/`, `assets/`, and `public/` if present, plus a small Git ignore
file. It refuses an existing destination or a destination inside the builder.
It does not delete originals, create a GitHub repository, or change Git history.
If a copy fails partway through, inspect the new folder before retrying with a
new destination. The command exports the currently selected source.

Point the builder at your exported directory:

```sh
export SITE_DATA_DIR=../reymundo-site-data
npm run dev
```

The same variable works for all commands:

```sh
SITE_DATA_DIR=../reymundo-site-data npm run check:content
SITE_DATA_DIR=../reymundo-site-data npm run build:drafts
SITE_DATA_DIR=../reymundo-site-data npm run build
```

An unset or blank variable keeps using the existing repository data for a smooth
migration. A nonempty invalid path or invalid `site.json` stops the command; it
never silently falls back to the bundled personal content. Paths resolve from
the builder root, and absolute paths are also supported. Quote paths with spaces;
use an absolute path instead of a literal `~` inside an environment file.

For a persistent local devenv setting, create the already-ignored
`devenv.local.nix` in the builder:

```nix
{
  env.SITE_DATA_DIR = "../reymundo-site-data";
}
```

Re-enter `devenv shell` after changing that file. Alternatively add
`SITE_DATA_DIR=../reymundo-site-data` to the ignored builder `.env` file.
Node 24's native environment loader supplies it to both scripts and Astro;
existing shell/devenv variables take precedence. No dotenv package is needed.
Restart development after changing the source directory, site settings, or
adding the first record to a previously empty collection. Existing records
continue to use Astro's normal file watching; case search watches the selected
content directory too.

## Start another person's site

Copy `examples/site-data` to a separate folder, then choose that folder with
`SITE_DATA_DIR`. It includes a generic profile, Home, and an MDX About example
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
