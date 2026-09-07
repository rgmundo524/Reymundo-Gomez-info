# Case charts and the case tracker

Every count comes from `content/cases/*.md`. Chart Markdown defines primary
category IDs, labels, and explanatory copy. Case Markdown supplies each case’s
classification path. No stored counts or percentages are needed.

## Two independent sunburst filters

Criminal investigations and Professional investigations each have an amCharts 5
[drill-down sunburst](https://www.amcharts.com/demos/drill-down-sunburst-chart/)
and their own matching case list directly below it. These replace the earlier
broken-slice pies. Each investigation has one canvas, with no SVG overlay.

- The inner ring shows primary categories, such as Pig butchering or Divorce.
- The next ring shows subcategories. Each further path level adds another ring.
- Selecting a branch zooms into it and shows all its descendant cases below.
- Selecting a terminal slice filters to that exact classification; its parent
  remains in view because there are no deeper layers to reveal.
- Breadcrumbs return to any ancestor. The group buttons provide the same
  filtering as the slices, including keyboard access and small-screen use.
- **Reset filters** returns that investigation to its initial chart and all its
  cases. Selecting one investigation never changes the other.
- Theme changes retain the current selection. System reduced-motion preferences
  disable chart transitions.

The sunburst results and Pagefind search are separate ways to browse the same
eligible case records. Sunburst selections update their own lists; they do not
change the Pagefind query or its dropdowns. Each case title links to its full
existing case details. The force-directed explorer below remains available.

## Markdown classification paths

Existing single-level entries still work:

```yaml
chart: criminal-investigations
category: hacks
subcategory: bridge-exploit
```

For deeper classifications, use an ordered list under the same field:

```yaml
chart: criminal-investigations
category: pig-butchering
subcategory:
  - investment-platform
  - fake-exchange
  - withdrawal-fee
```

This means **Pig butchering → Investment Platform → Fake Exchange → Withdrawal
Fee**. A list is one parent-to-child path, not several unrelated tags. Add more
items for more levels. Use lowercase words separated by hyphens; display labels
are generated automatically. No central subcategory registry needs updating.
The same ID under different parents or investigation types stays separate.

`subcategory: null` or an omitted field becomes **Unspecified**. Empty lists,
blank items, nested lists, and invalid slugs fail validation.

Cases can stop at different depths. If some end at Investment Platform while
others go deeper, a **No further classification** bucket holds those shorter
paths. This prevents them from disappearing or being counted again. Selecting
Investment Platform still shows both the shorter and deeper cases.

Category pages group cases by the first subcategory and display the complete
classification path in each case’s facts. Existing category and case anchors
remain stable. Pagefind indexes every level of the path.

## Counting and publication rules

- One case contributes one count to one investigation and one classification
  path. Slugs remain unique even if files are renamed or copied.
- Parent counts equal the sum of their children. Only terminal buckets supply
  numeric values to amCharts, preventing parent/child double counting.
- Each investigation has its own denominator. Tooltips explicitly show shares
  of the entire investigation and the parent group. Zoom changes the visible
  branch, while the result summary shows the selected count out of the full
  investigation count. The count tables always describe the entire investigation.
- Zero cases means zero slices. Empty primary categories remain in the count
  tables, with links to their category pages.
- Real case studies and illustrative examples stay in separate datasets.
  Examples remain drafts and cannot be published as actual work.
- Production includes only published real cases in published charts. Draft
  preview includes the illustrative records. Chart JSON contains only explicitly
  selected display fields, never editorial notes or unused content blocks.

The fictional examples include two paths below Pig butchering and a deep
professional path below Divorce. They demonstrate navigation, not real findings.

## Appearance and fallback

The sunbursts remain transparent so the particle background shows through.
The force-directed explorer retains a solid theme-matched background for wheel,
pinch, and drag interaction. amCharts attribution remains visible.

Charts load near the viewport. Case summaries and expandable count tables are
server-rendered and available without JavaScript or when chart loading fails.
Printing includes all case summaries, even if the on-screen list was filtered.
Small slices retain tooltip and equivalent HTML button navigation.

Edit `src/config/case-visuals.json`:

| Setting | Meaning | Default |
| --- | --- | --- |
| `sunburst.radius` | Percentage of available chart radius | 96 |
| `sunburst.innerRadius` | Center hole as a percentage of radius | 12 |
| `sunburst.visibleLevels` | Visible descendant depth; null shows all available layers | null |
| `sunburst.transitionDuration` | Drill transition milliseconds, zero with reduced motion | 350 |
| `tree.minRadius` / `tree.maxRadius` | Force-tree node radius range in pixels | 26 / 62 |
| `tree.bulletDuration` | Milliseconds per traveling dot | 3500 |
| `tree.initialDepth` | Initially visible levels below the tree root | 2 |

## Force-directed case explorer

The explorer still follows **Casework → Investigation → Primary category → Case**.
Parents expand and collapse; individual cases open their details. Node size uses
case counts. Only case leaves have a numeric value of 1. Its text list remains
available alongside the canvas.

Zoom, reset, collapse, and pause controls remain available. Animated dots show
navigation relationships, not transactions or money movement. Pause stops both
the dots and simulation. Reduced motion produces a settled layout; offscreen
explorers and background tabs pause automatically.

`blocks.chart_label` optionally provides a short case-node label. Tooltips retain
full titles, summaries, status, classification, dates, and networks. This explorer
adapts the [Force-Directed Tree with Animated Bullets](https://www.amcharts.com/demos/force-directed-tree-with-animated-bullets/).

Read [the case record guide](case-tracker.md) for field definitions and publishing
rules. All visualizations use the existing amCharts dependency without a new
client framework, database, or remote chart service.
