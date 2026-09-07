import * as am5 from '@amcharts/amcharts5';
import { Sunburst } from '@amcharts/amcharts5/hierarchy';
import settings from '../config/case-visuals.json';
import { caseChartStyle } from './case-chart-style';
import { caseSunburst, sunburstNodes, sunburstSelection, type SunburstNode } from './case-sunburst';
import type { CaseSunburstData, CaseVisual, CaseVisualState } from './case-visuals';

export function createCaseSunburst(host: HTMLElement, figure: HTMLElement, data: CaseSunburstData,
  motionEnabled: boolean, saved: CaseVisualState = {}): CaseVisual {
  const root = am5.Root.new(host);
  let resize: ResizeObserver | undefined;
  try {
    const { dark, ink, tooltip } = caseChartStyle(root, figure);
    const hierarchy = caseSunburst(data);
    const nodes = sunburstNodes(hierarchy);
    let selected = sunburstSelection(hierarchy, saved.sunburstNode);
    let ready = false;
    const series = root.container.children.push(Sunburst.new(root, {
      idField: 'id', categoryField: 'label', valueField: 'value', childDataField: 'children',
      topDepth: 1, upDepth: 0, initialDepth: settings.sunburst.visibleLevels ?? Infinity,
      downDepth: settings.sunburst.visibleLevels ?? Infinity, singleBranchOnly: true,
      radius: am5.percent(settings.sunburst.radius), innerRadius: am5.percent(settings.sunburst.innerRadius),
      animationDuration: motionEnabled ? settings.sunburst.transitionDuration : 0,
    }));
    series.nodes.template.setAll({
      toggleKey: 'none', interactive: true, focusable: true, hoverOnFocus: true,
      role: 'button', cursorOverStyle: 'pointer', tooltip, tooltipText: 'Filter cases', tooltipPosition: 'pointer',
    });
    const context = (item: { dataItem?: { dataContext?: unknown } }) => item.dataItem?.dataContext as SunburstNode | undefined;
    series.nodes.template.adapters.add('tooltipText', (_text, target) => context(target)?.tooltip ?? 'Filter cases');
    series.nodes.template.adapters.add('ariaLabel', (_text, target) => context(target)?.tooltip.replace(/\n/g, '. ') ?? 'Filter cases');
    series.nodes.template.events.on('click', ({ target }) => {
      const node = context(target);
      if (node) select(node.id);
    });
    series.slices.template.setAll({ stroke: ink, strokeOpacity: 0.25, strokeWidth: 1, interactive: false });
    series.slices.template.adapters.add('fill', (fill, target) => {
      const node = context(target);
      return node ? am5.Color.brighten(am5.color(dark ? node.dark : node.light), Math.min(0.24, Math.max(0, node.path.length - 1) * 0.08)) : fill;
    });
    series.slices.template.adapters.add('strokeWidth', (_width, target) => context(target)?.id === selected.node.id ? 3 : 1);
    series.slices.template.adapters.add('strokeOpacity', (_opacity, target) => context(target)?.id === selected.node.id ? 1 : 0.25);
    series.labels.template.setAll({
      fontSize: 14, textType: 'circular', oversizedBehavior: 'hide',
      populateText: false, ignoreFormatting: true, interactive: false,
      fill: dark ? am5.color('#142131') : am5.color('#ffffff'),
    });
    series.labels.template.adapters.add('text', (_text, target) => context(target)?.label ?? '');

    const breadcrumbs = figure.querySelector<HTMLElement>('[data-sunburst-breadcrumbs]');
    const branches = figure.querySelector<HTMLElement>('[data-sunburst-branches]');
    const hint = figure.querySelector<HTMLElement>('[data-sunburst-hint]');
    const summary = figure.querySelector<HTMLElement>('[data-case-results-summary]');
    const results = [...figure.querySelectorAll<HTMLElement>('[data-case-result]')];
    const reset = figure.querySelector<HTMLButtonElement>('[data-visual-action="sunburst-reset"]');
    function button(node: SunburstNode, current = false) {
      const element = document.createElement('button');
      element.type = 'button'; element.dataset.visualAction = `sunburst-select:${node.id}`;
      element.textContent = `${node.label} (${node.count})`;
      element.setAttribute('aria-controls', `${host.id} ${host.id}-results`);
      if (current) element.setAttribute('aria-current', 'true');
      return element;
    }
    function select(id: string) {
      selected = sunburstSelection(hierarchy, id);
      if (ready) {
        const item = series.getDataItemById(selected.focus.id);
        if (item) series.set('selectedDataItem', item);
        for (const slice of series.slices) { slice.markDirtyKey('strokeWidth'); slice.markDirtyKey('strokeOpacity'); }
      }
      for (const result of results) result.hidden = !selected.caseIds.has(result.dataset.caseResult!);
      if (summary) summary.textContent = `Showing ${selected.node.count} of ${data.total} ${data.kind === 'example' ? 'example ' : ''}cases${selected.node === hierarchy ? '' : `: ${selected.ancestors.slice(1).map(({ label }) => label).join(' → ')}`}.`;
      if (reset) reset.disabled = selected.node === hierarchy;
      // Keep keyboard navigation on the same control when rebuilding breadcrumbs.
      const active = document.activeElement;
      const action = active instanceof HTMLElement && (breadcrumbs?.contains(active) || branches?.contains(active)) ? active.dataset.visualAction : undefined;
      breadcrumbs?.replaceChildren(...selected.ancestors.map((node) => button(node, node === selected.node)));
      branches?.replaceChildren(...(selected.node.children ?? []).map((node) => button(node)));
      if (hint) hint.textContent = selected.node.children?.length
        ? 'Choose a slice or group to narrow these results.'
        : 'This is the deepest recorded classification. Choose a parent group or reset to broaden the results.';
      if (action) {
        const replacement = [...figure.querySelectorAll<HTMLButtonElement>('[data-visual-action]')].find((element) => element.dataset.visualAction === action);
        (replacement ?? breadcrumbs?.querySelector<HTMLButtonElement>('[aria-current]'))?.focus({ preventScroll: true });
      }
    }
    // Hierarchy's built-in toggle selects only branches. We own both branch and
    // leaf selection so filtering, breadcrumbs, and restored state cannot diverge.
    series.events.once('datavalidated', () => { ready = true; select(selected.node.id); });
    series.data.setAll([hierarchy]);
    select(selected.node.id);
    resize = new ResizeObserver(() => tooltip.label.set('maxWidth', Math.min(330, Math.max(160, host.clientWidth - 40))));
    resize.observe(host);
    return {
      state: () => ({ sunburstNode: selected.node.id }), visible() {},
      motion(enabled) { series.set('animationDuration', enabled ? settings.sunburst.transitionDuration : 0); },
      action(action) {
        if (action === 'sunburst-reset') select(hierarchy.id);
        else if (action.startsWith('sunburst-select:')) {
          const id = action.slice('sunburst-select:'.length);
          if (nodes.some((node) => node.id === id)) select(id);
        }
      },
      dispose() { resize?.disconnect(); root.dispose(); },
    };
  } catch (error) { resize?.disconnect(); root.dispose(); throw error; }
}
