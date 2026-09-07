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
- Pie shares use all records in the selected dataset as the denominator.
  The category tables show shares within each investigation type, explicitly
  labeled in their captions. Stored counts and percentages are rejected.
- Zero records means zero cases. Empty charts show a zero total without slices;
  empty categories remain navigable.
- Chart slices, legend links, category counts, and case records share the same
  calculation and visibility rules.
- Real records (`case_study`) and examples (`example`) are separate datasets.
  Development shows examples when there are no real cases; once real cases are
  added, the examples remain in an expandable section. They never augment real
  totals. Example records cannot be published.

Table links lead to `/investigations/<chart>/<category>/#dataset-<kind>`, opening
the matching real or example group. Individual records also have
stable anchors using their slug. Links work with keyboard, pointer, and touch.

## Interactive charts

One amCharts 5 **Pie Chart with Broken Down Slices** replaces both previous donut
charts. There is one canvas and one pie series per dataset. The original SVG
donut markup and grainy donut renderer are removed.

The overview contains Criminal investigations and Professional investigations.
Selecting either parent replaces that slice with its existing case types, while
leaving the other investigation slice intact. Selecting a smaller slice returns
to the overview. The buttons provide the same selection/reset controls using
ordinary HTML. Hover or keyboard focus shows counts and shares.

This uses the existing `chart` and `category` fields in case Markdown. It does not
need a new subcategory field or duplicate records. For example, the Hacks slice
is a subcategory of Criminal investigations. Individual cases remain accessible
through the tables and case explorer.

All displayed slices always sum to the full dataset total. A selected parent's
count is replaced by its child counts; they are never added together. Pie
percentages continue to use the full dataset after expansion. Tooltips also
show each case type's share within its parent investigation type.

Below the pie, **Explore cases** is a force-directed tree:

`Casework → Investigation type → Primary category → Individual case`

Investigation types and categories expand/collapse on selection. A case node
opens its existing case details. Larger groups contain more records. Only case
leaves have a numeric value of 1; amCharts aggregates parent values, so parent
counts are not supplied a second time. Empty categories remain in the tables
but are omitted from the tree.

The tree has zoom, reset, collapse, and pause controls. Drag nodes or the map to
rearrange/explore it; touch devices can pinch to zoom. The mouse wheel zooms while
the pointer is over the explorer. Animated dots travel along visible links. The animation
illustrates navigation relationships, not transactions, money flow, or case
progress. Pause stops both dots and the force simulation. Reduced-motion system
preferences disable automatic motion and use a settled layout. Offscreen charts
and background tabs pause automatically.

The pie background remains transparent. The case explorer has a solid,
theme-matched background on its panel, canvas host, and zoom interaction surface.
This gives wheel, pinch, and drag gestures a continuous hit area. Node/slice
colors and tooltip colors follow the theme. The amCharts attribution remains
visible under its existing license.

Charts load when they approach the viewport. The HTML count tables remain visible
while loading, without JavaScript, on failure, and in print. The expandable text
case list stays available alongside the interactive tree. No client framework or remote chart
service is required; the existing amCharts dependency supplies both chart types.

### Appearance settings

Edit `src/config/case-visuals.json`:

| Setting | Meaning | Initial value |
| --- | --- | --- |
| `pie.radius` | Radius as a percentage of available chart space | 92 |
| `pie.transitionDuration` | Slice transition duration in milliseconds; zero with reduced motion | 250 |
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
Adding or reclassifying a Markdown record updates the pie, tree, tables, and
destinations in the same build. `src/lib/case-visuals.ts` projects the display
fields explicitly; editorial notes, unrelated blocks, and Markdown source are
not copied into chart JSON.

These charts adapt the [Pie Chart with Broken Down Slices](https://www.amcharts.com/demos/pie-chart-broken-slices/)
and [Force-Directed Tree with Animated Bullets](https://www.amcharts.com/demos/force-directed-tree-with-animated-bullets/)
examples.

Read [the case record guide](case-tracker.md) for a copyable workflow, field
meanings, financial coverage rules, and the example files.
