# Resume content review

Source: the supplied resume, updated August 21, 2026. Content prepared September
7, 2026. Wording is adapted for a personal website and expert witness directories;
it has not been independently credential-verified. All 53 entries remain drafts.
The current development version also includes ten explicitly illustrative case
summaries and chart values accepted as sample data by the owner.

## Inventory

| Collection | Entries | Purpose |
| --- | ---: | --- |
| Profile | 1 | Biography, short bio, directory bio, professional focus |
| Experience | 5 | One file per role, including both CipherBlade periods |
| Credentials | 11 | Separate certifications, certificates, and training |
| Education | 3 | Degree labels and attendance without inferred graduation |
| Expertise | 7 | Reusable subject descriptions and technical skills |
| Projects | 2 | ADA report contribution and a grouping of custom-tool work |
| Interests | 9 | One file per hobby listed in the resume |
| Callouts | 2 | Evidence limitations and investigative experience |
| Charts | 2 | Criminal and professional non-criminal investigation breakdowns |
| Cases | 10 | Illustrative summaries, one per chart category |
| Pages | 1 | Home page introduction and ordered content selection |

The home page selects every entry for local review. Later, shorten its lists to
curate the public page without deleting the underlying records. Templates remain
generic and available for future additions.

## Items to confirm

| Item | Current treatment | Confirmation needed |
| --- | --- | --- |
| MS Computer Science and BA Physics | Source labels retained; completion is `unspecified` | Whether each degree was awarded and the award date |
| United States Military Academy | Attendance only | Program and preferred public wording; no degree is listed |
| CipherBlade | Two periods: September 2022–June 2025 and January 2026–present | Confirm the ongoing role when updating the site |
| Go-Crypto | Ongoing role from June 2025, operating within Go Mobile Education Zone | Formal board affiliation and preferred organizational description |
| Army and ACI Federal | Source dates retained, including an October–November 2019 overlap | Whether the overlap is accurate |
| Credential names and validity | Names and years retained, no expiration or verification URLs invented | Current validity, exact designation, and any public verification links |
| Master CCIE | Provisionally categorized as a certificate | Exact issuer designation and classification |
| Pioneer programs and Alchemy University | Training entries | Completion status and any separate certificate awarded |
| ADA report | Contributor wording; original report URL retained | Verify the contributor credit and preferred description of the work |
| Custom investigation tools | Portfolio grouping of resume-described work | Which specific tools or examples can be described publicly |
| Technical skills | Named technologies without numeric self-ratings | Which technologies should be featured and how to describe proficiency |
| Interests | Minimal copy using only the named hobbies | Personal detail, examples, or stories to add later |
| Public contact | No email, telephone, street address, or profile link selected | Preferred public contact method and links |

The ADA report could not be retrieved when this update was prepared. Its linked
URL comes from the resume; contributor attribution has not been checked against
the report itself.

## Case statistics

The source narrative describes more than 51 criminal investigations and six expert
witness cases. The criminal chart's PDF text layer contains category counts of
21, 13, 5, 5, 4, and 3, totaling 51. Those counts are now included as provisional
data in the local draft chart. The Hacks label in the visible resume says 35.5%,
but 13 / 51 yields 25.5%. Website percentages are calculated from the counts.

The original expert witness chart contained conflicting values: Divorce 50%, Corporate civil
lawsuits 33.3%, and Bankruptcy 16.7% already sum to 100%, but a separate Other
slice is also present. Its PDF text layer contains 30, 20, 10, and 4, totaling 64,
which cannot be assumed to be case counts for the stated six cases. Enter the
actual count for each category before using that source for historical statistics.
For current development, the owner requested one sample case in each category
and renamed this chart to Professional investigations, covering non-criminal
work. It now displays four cases and four 25% slices. The criminal values are
also treated as sample data, preserving unequal proportions for development.
No reconciliation is needed to continue implementing the website. See
`docs/case-charts.md`.

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
