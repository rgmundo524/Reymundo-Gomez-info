# Case charts and the case tracker

Charts now derive every count from `content/cases/*.md`. The former manual
category counts, `data_status`, and `source_date` fields have been removed.
Chart Markdown holds category IDs, labels, and explanatory copy only.

The two groups remain Criminal investigations and Professional investigations
(non-criminal). Add a category to the appropriate chart file before assigning a
case to it. Add a new chart slug to the Casework page's `charts` selection if you
create another group.

## Counting rules

- One case record contributes one count to exactly one chart and primary category.
- Slugs are unique. Renaming the file does not create another case; copying it
  with the same slug fails validation.
- Category share is its record count divided by all records in that chart's
  dataset. Stored counts and percentages are rejected.
- Zero records means zero cases. Empty charts show a zero total without slices;
  empty categories remain navigable.
- Chart slices, legend links, category counts, and case records share the same
  calculation and visibility rules.
- Real records (`case_study`) and examples (`example`) are separate datasets.
  Development shows examples when there are no real cases; once real cases are
  added, the examples remain in an expandable section. They never augment real
  totals. Example records cannot be published.

Chart links lead to `/investigations/<chart>/<category>/#dataset-<kind>`, so a
slice opens the matching real or example group. Individual records also have
stable anchors using their slug. Links work with keyboard, pointer, and touch.

The chart component uses SVG sectors and HTML legend links. It requires no chart
service or client framework. Both the SVG and legend use the same derived data.

Read [the case record guide](case-tracker.md) for a copyable workflow, field
meanings, financial coverage rules, and the example files.
