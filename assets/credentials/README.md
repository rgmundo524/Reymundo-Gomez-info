# Credential badges

Place issuer-provided badge or seal files here. Use lowercase filenames ending
in `.png`, `.jpg`, `.jpeg`, `.webp`, or `.svg`. Images are bundled locally;
training pages are never scraped at runtime.

Reference a filename from the credential Markdown's `badge.image`, add descriptive
`badge.alt`, and retain the official source page as `badge.source_url`.
Use the badge for the exact credential and version recorded in that file. A
program badge is separate from an individual's award verification link.

No badges are supplied yet. Omit the `badge` object until the asset is available;
the card displays its name, issuer, year, description, and links without a placeholder.
See `docs/credentials.md` for the full authoring workflow.
