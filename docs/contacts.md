# Contact information and service links

Edit `content/contacts/reymundo.md` to change the contact page introduction,
organization cards, personal contact information, and social accounts. No Astro
or CSS changes are needed to update the displayed information.

`content/pages/contact.md` selects this record with `contact: reymundo` and
continues to control the page title, metadata, and publication status. The
selected contact record's Markdown body supplies the visible introduction.

## Organization cards

Each entry under `services` becomes one card. Copy an entry to add another
organization, then change its `id`, content, and links.

| Field | Purpose |
| --- | --- |
| `id` | Unique, stable identifier; lowercase words separated by hyphens |
| `name` | Organization name |
| `description` | Plain-text explanation of its services and audience |
| `display_order` | Lower numbers appear first; defaults to 100; ties use `id` |
| `enabled` | Set to `false` to hide the card without deleting its configuration |
| `website.label` / `website.url` | Optional website link and its visible text |
| `action.label` / `action.url` | Required button text and direct enquiry/onboarding destination |
| `email` | Optional public organization email; omit or use `null` to hide |
| `phone.label` / `phone.number` | Optional displayed phone number and international dialing number |

For example, a phone may use `label: '903-705-5802'` and
`number: '+19037055802'`. The displayed label can contain spaces and punctuation;
the dialing number must start with `+` and contain only digits after it.

The current cards link to Go-Crypto's Report Fraud page and CipherBlade's
Contact page. These are ordinary external links, opening in the same tab. The
site does not collect enquiries or automatically redirect someone on page load.

## Personal and social card

`social` supplies a single combined card:

- `title`, `name`, and `description` control its visible text.
- `email` and `phone` work like organization contact fields. They are currently
  `null` because no personal email or phone has been selected for this site.
- `links` is a list of `label` / `url` pairs displayed in the written order.
  LinkedIn and GitHub are populated; add other accounts to the same list.
- Set `enabled: false` or remove `social` to hide the entire card. A card without
  any links, email, or phone is also omitted.

Social URLs and service details are not inferred from platform names, jobs, or
the profile. The old profile `public_email` field has been replaced by
`social.email` here. The homepage, header, and footer link to `/contact/` when
that page is visible, so visitors can choose a destination.

## Visibility and validation

The new record remains a draft, like the rest of the supplied content. Local
development and draft builds show it. To publish the contact page, its selected
profile and contact record must also be published; the content checker rejects
missing references and published pages that select draft records.

Use `npm run check:content` after editing. Website and action URLs must use HTTP
or HTTPS. Emails, dialing numbers, unique service IDs, and misspelled fields are
validated. Disabled entries are still validated so they can be enabled later.

Only displayed fields are rendered. `editorial_note` remains an authoring note,
and personal contact information is not added to the case-search index. No
database, form backend, email-delivery service, or new package is needed.

## Initial link sources

Checked September 7, 2026:

- [Go-Crypto intake and public email](https://www.go-crypto.org/report-fraud)
- [Go-Crypto website and public phone](https://www.go-crypto.org/)
- [Go-Crypto service descriptions](https://www.go-crypto.org/copy-of-educational-victim-services)
- [CipherBlade enquiry page](https://cipherblade.com/contact/)
- [CipherBlade services](https://cipherblade.com/)

The LinkedIn account comes from the supplied resume. GitHub uses the account
provided for this project. No additional personal accounts or email addresses
were inferred. Start another directory from `templates/contacts.md` if needed.
