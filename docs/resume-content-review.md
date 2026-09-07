# Resume content review

Source: the supplied resume, updated August 21, 2026. Content prepared September
7, 2026. Wording is adapted for a personal website and expert witness directories;
it has not been independently credential-verified. All 62 entries remain drafts.
The current development version includes thirteen illustrative case records.
All statistics are derived from records, with examples separate from actual work.

## Inventory

| Collection | Entries | Purpose |
| --- | ---: | --- |
| Profile | 1 | Biography, short bio, directory bio, professional focus |
| Experience | 6 | One file per role, including both CipherBlade periods and the newly confirmed current ADC LTD NM role |
| Credentials | 11 | Separate certifications, certificates, and training |
| Education | 3 | Degree labels and attendance without inferred graduation |
| Expertise | 7 | Reusable subject descriptions and technical skills |
| Projects | 2 | ADA report contribution and a grouping of custom-tool work |
| Interests | 9 | One file per hobby listed in the resume |
| Callouts | 2 | Evidence limitations and investigative experience |
| Charts | 2 | Criminal and professional non-criminal investigation breakdowns |
| Cases | 13 | Illustrative records covering every chart category |
| Pages | 6 | Curated home page and five supporting page selections |

The home page now selects a short professional introduction, three expertise
areas, three organizations, and one project. Supporting pages retain the full
background, credentials, interests, and case material. Templates remain generic
and available for future additions.

## Items to confirm

| Item | Current treatment | Confirmation needed |
| --- | --- | --- |
| MS Computer Science and BA Physics | Source labels retained; completion is `unspecified` | Whether each degree was awarded and the award date |
| United States Military Academy | Attendance only | Program and preferred public wording; no degree is listed |
| CipherBlade | Two periods: September 2022–June 2025 and January 2026–present | Confirm the ongoing role when updating the site |
| ADC LTD NM | Current federal background investigator role confirmed by the owner; no dates invented | Start month, location, detailed duties, and achievements |
| Go-Crypto | Ongoing role from June 2025, operating within Go Mobile Education Zone | Formal board affiliation and preferred organizational description |
| Army and ACI Federal | Source dates retained, including an October–November 2019 overlap | Whether the overlap is accurate |
| Credential names and validity | Names and years retained, no expiration or verification URLs invented | Current validity, exact designation, and any public verification links |
| Master CCIE | Provisionally categorized as a certificate | Exact issuer designation and classification |
| Pioneer programs and Alchemy University | Training entries | Completion status and any separate certificate awarded |
| ADA report | Contributor wording; original report URL retained | Verify the contributor credit and preferred description of the work |
| Custom investigation tools | Portfolio grouping of resume-described work | Which specific tools or examples can be described publicly |
| Technical skills | Named technologies without numeric self-ratings | Which technologies should be featured and how to describe proficiency |
| Interests | Minimal copy using only the named hobbies | Personal detail, examples, or stories to add later |
| Public contact | LinkedIn link from the resume; no email or telephone selected | Preferred public email if direct email contact is wanted |

The ADA report could not be retrieved when this update was prepared. Its linked
URL comes from the resume; contributor attribution has not been checked against
the report itself.

## Case statistics

The original resume's investigation charts contain conflicting labels and totals.
For example, the criminal chart text layer totals 51 and gives Hacks as 13,
while the visible Hacks percentage says 35.5% instead of 25.5%. The expert
witness chart likewise has conflicting proportions and counts.

Those provisional aggregate values are no longer used by the website. Each
case record now contributes exactly one count to its chart and category.
Litigation Support Investigations covers non-criminal work, as requested by the owner.
The current 13 examples yield 8 criminal and 5 professional cases. None of these
fictional details assert actual historical engagement facts. Build out real
`case_study` records to establish a documented historical dataset. See
`docs/case-tracker.md`.

The resume also lists approximately $25,204,222.66 in stolen funds and $431,407.29
recovered, valued at the time of transfer. Before using these figures, confirm the
cutoff date, population of cases, valuation method, personal contribution, and
wording. Do not infer a recovery rate by dividing these figures.

The existence of expert witness engagements does not establish the number of
trials, depositions, or court qualification decisions. Those categories would
need their own verified records if they are to be advertised.

## Editorial choices

- Use first person for the full biography and job narratives; directory bios are
  available in third person under `blocks`.
- Review professional-approach wording in the tracing, OSINT, and limitations
  entries. Statements about corroboration and attribution are editorial drafts
  informed by the source, not verbatim descriptions of a documented methodology.
- Preserve source dates rather than silently resolving overlaps or missing dates.
- Keep named highlights addressable by ID and dates in frontmatter. Do not copy
  date ranges into every narrative or add a redundant active-position flag.
- Describe unnamed cases by subject. Specific parties, recovery stories, and
  incident attribution need review before they are added to public copy.
- Omit the historical TS-SCI label from the public role title; current clearance
  status is not established by the source.
- Keep the nonprofit relationship factual without asserting a separate tax-exempt
  status for Go-Crypto.
- Keep the source PDF and reference contact information outside the site.

`editorial_note` is for the content owner and is not rendered by the current
components. It still exists in Git source and is visible while the repository
is public. Website publication and repository visibility are separate settings.

## Reuse examples

| Need | Canonical content |
| --- | --- |
| Compact biography | `profile/reymundo.md` → `description_short` |
| Short directory biography | `profile/reymundo.md` → `blocks.directory_bio_short` |
| Longer directory biography | `profile/reymundo.md` → `blocks.directory_bio` |
| Full personal biography | Body of `profile/reymundo.md` |
| One accomplishment | Experience entry → matching item in `highlights` |
| Role relevance to litigation | Experience entry → `blocks.litigation_relevance`, where present |
| Programming inventory | `expertise/investigative-tooling.md` → `blocks.programming_languages` |
| Brief explanation of limitations | `callouts/analytical-limitations.md` → `blocks.one_sentence` |

Fields and relationship validation are described in `docs/content-guide.md`.
