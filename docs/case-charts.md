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

## Interactive charts

The two summary donuts use amCharts 5 with a radial gradient and subtle grain.
Hover or keyboard focus shows the category, count, and share. Selecting a slice
opens its category. Selecting a legend row navigates too; it never hides slices
or changes the denominator. HTML count tables remain visible at all times.

Below the donuts, **Explore cases** is a force-directed tree:

`Casework → Investigation type → Primary category → Individual case`

Investigation types and categories expand/collapse on selection. A case node
opens its existing case details. Larger groups contain more records. Only case
leaves have a numeric value of 1; amCharts aggregates parent values, so parent
counts are not supplied a second time. Empty categories remain in donut tables
but are omitted from the tree.

The tree has zoom, reset, collapse, and pause controls. Drag nodes or the map to
rearrange/explore it; touch devices can pinch to zoom. Scrolling the page does
not capture wheel input. Animated dots travel along visible links. The animation
illustrates navigation relationships, not transactions, money flow, or case
progress. Pause stops both dots and the force simulation. Reduced-motion system
preferences disable automatic motion and use a settled layout. Offscreen charts
and background tabs pause automatically.

All broad chart surfaces are transparent, including in dark mode. Node/slice
colors and tooltip colors follow the theme. The amCharts attribution remains
visible under its existing license.

Charts load when they approach the viewport. SVG donuts are the loading,
no-JavaScript, failure, and print fallback. The expandable text case list stays
available alongside the interactive tree. No client framework or remote chart
service is required; the existing amCharts dependency supplies both chart types.

### Appearance settings

Edit `src/config/case-visuals.json`:

| Setting | Meaning | Initial value |
| --- | --- | --- |
| `donut.innerRadius` | Hole radius, as a percentage of the outer radius | 60 |
| `donut.grainDensity` | Grain density | 0.5 |
| `donut.grainOpacity` | Maximum grain opacity | 0.18 |
| `tree.minRadius` / `tree.maxRadius` | Node radius range in pixels | 26 / 62 |
| `tree.bulletDuration` | Milliseconds for a dot to travel along a link | 3500 |
| `tree.initialDepth` | Initially visible levels below the root | 2 |

An individual case can optionally provide a short node label:

```yaml
blocks:
  chart_label: Case 001
```

Otherwise the case slug is used. Full titles, short descriptions, status, dates,
and networks appear in case tooltips; the text list always uses full titles.
Adding or reclassifying a Markdown record updates the donuts, tree, tables, and
destinations in the same build. `src/lib/case-visuals.ts` projects the display
fields explicitly; editorial notes, unrelated blocks, and Markdown source are
not copied into chart JSON.

These charts adapt the [Grainy Gradient Pie](https://www.amcharts.com/demos/grained-gradient-pie/)
and [Force-Directed Tree with Animated Bullets](https://www.amcharts.com/demos/force-directed-tree-with-animated-bullets/)
examples.

Read [the case record guide](case-tracker.md) for a copyable workflow, field
meanings, financial coverage rules, and the example files.
