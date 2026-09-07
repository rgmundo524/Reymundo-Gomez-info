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
- Each pie and its table use that investigation type's records as the denominator.
  Criminal and professional cases have independent totals. Subcategory slices
  keep their chart's denominator during expansion. Stored counts and percentages
  are rejected.
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

There are two separate amCharts 5 **Pie Charts with Broken Down Slices**: Criminal
investigations and Professional investigations. Each chart has one canvas and
one series. The original SVG donuts and grainy renderer remain removed.

The criminal pie starts with Hacks, Pig butchering, Phishing, and the other
categories from its chart Markdown. The professional pie starts with Divorce,
Corporate civil lawsuits, Bankruptcy, and Other. Selecting a category replaces
only that slice with its subcategories. The other categories stay visible.
Selecting a smaller slice returns to categories. Each chart's buttons, selection,
and total are independent. Hover or keyboard focus shows counts and shares.

Each case supplies a single optional `subcategory` in its frontmatter:

```yaml
chart: criminal-investigations
category: hacks
subcategory: bridge-exploit
```

Or, for example:

```yaml
chart: professional-investigations
category: divorce
subcategory: asset-disclosure
```

Use lowercase words separated by hyphens. Labels are generated automatically
(`bridge-exploit` becomes “Bridge Exploit”). Add or change a value in a case file
to create/reclassify a subcategory; no second list needs updating. The same ID
under a different category or investigation type remains a separate group.
Use `subcategory: null`, or omit the field, for unknown classifications. These
records appear under “Unspecified” and still contribute to the parent total.
Lists are rejected because one case must have exactly one primary subcategory.

The expandable subcategory lists below each pie link to the matching records
on the category page. Their counts and percentages use the same chart total.
Category pages group cases by subcategory; existing individual case anchors
remain stable. Pagefind also indexes and filters by subcategory.

All displayed slices always sum to their chart's total. A selected parent's
count is replaced by its child counts; they are never added together. Pie
percentages continue to use that investigation type after expansion. Tooltips
also show each subcategory's share within its parent category.

Below the pies, **Explore cases** is a force-directed tree:

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

The pie backgrounds remain transparent. The case explorer has a solid,
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

### Other donut and hierarchy options

These options can all use the existing amCharts 5 dependency and the same case
classifications. Each would remain separate for criminal and professional work.

| Option | Interaction and tradeoff |
| --- | --- |
| [Broken-down slices](https://www.amcharts.com/demos/pie-chart-broken-slices/) | Current behavior: expand one category in place. Can be styled with a donut hole; the full chart denominator stays unchanged. |
| [Drill-down sunburst](https://www.amcharts.com/demos/drill-down-sunburst-chart/) | Best alternative for this hierarchy: categories and subcategories occupy concentric rings; select a branch to focus. A hollow center is supported. |
| [Two-level pie](https://www.amcharts.com/demos/two-level-pie-chart/) | Two series can be adapted into aligned category/subcategory rings, showing both levels at once. Small subcategories can become crowded. |
| [Pie of a pie](https://www.amcharts.com/demos/pie-of-a-pie/) | A selected category opens in a separate detail pie. It provides more room for detail but needs more space for two investigation charts, and detail shares use the selected category's total. |

These are alternatives for review, not additional charts loaded into the page.

Read [the case record guide](case-tracker.md) for a copyable workflow, field
meanings, financial coverage rules, and the example files.
