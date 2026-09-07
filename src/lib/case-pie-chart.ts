import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import settings from '../config/case-visuals.json';
import { caseChartStyle } from './case-chart-style';
import { casePieSlices, type CasePieData, type CasePieSlice, type CaseVisual, type CaseVisualState } from './case-visuals';

export function createCasePie(host: HTMLElement, figure: HTMLElement, data: CasePieData,
  motionEnabled: boolean, saved: CaseVisualState = {}): CaseVisual {
  const root = am5.Root.new(host);
  let resize: ResizeObserver | undefined;
  try {
    const { dark, ink, tooltip } = caseChartStyle(root, figure);
    let expanded = data.categories.some(({ id, count }) => id === saved.pieCategory && count > 0) ? saved.pieCategory! : null;
    const chart = root.container.children.push(am5percent.PieChart.new(root, {
      radius: am5.percent(settings.pie.radius), innerRadius: 0,
      startAngle: -90, endAngle: 270, paddingTop: 28, paddingBottom: 28,
      paddingLeft: 28, paddingRight: 28,
    }));
    const series = chart.series.push(am5percent.PieSeries.new(root, {
      categoryField: 'label', valueField: 'count', startAngle: -90, endAngle: 270,
      alignLabels: false, interpolationDuration: motionEnabled ? settings.pie.transitionDuration : 0,
    }));
    series.ticks.template.set('forceHidden', true);
    series.labels.template.setAll({
      inside: true, baseRadius: am5.percent(65), radius: 0, fontSize: 14, textAlign: 'center',
      centerX: am5.p50, centerY: am5.p50, maxWidth: 140, oversizedBehavior: 'wrap',
      populateText: false, ignoreFormatting: true, interactive: false,
      fill: dark ? am5.color('#142131') : am5.color('#ffffff'),
    });
    series.labels.template.adapters.add('text', (_text, label) => {
      const slice = label.dataItem?.dataContext as CasePieSlice | undefined;
      if (!slice) return '';
      const compact = host.clientWidth < 600;
      if (slice.percentage < (compact ? 6 : 3)) return '';
      const percentage = `${slice.percentage.toFixed(1)}%`;
      return (slice.level === 'subcategory' && compact) || slice.percentage < (compact ? 18 : 12)
        ? percentage : `${slice.label}\n${percentage}`;
    });
    series.slices.template.setAll({
      templateField: 'sliceSettings', toggleKey: 'none', interactive: true,
      focusable: true, hoverOnFocus: true, role: 'button', cursorOverStyle: 'pointer',
      tooltip, tooltipText: 'Explore case types', tooltipPosition: 'pointer',
      stroke: ink, strokeOpacity: 0.2, strokeWidth: 1,
      stateAnimationDuration: motionEnabled ? settings.pie.transitionDuration : 0,
    });
    // Match the broken-slices demo: selected children pull out of the same pie.
    series.slices.template.states.create('active', { shiftRadius: 20 });
    series.slices.template.adapters.add('tooltipText', (_text, slice) => (slice.dataItem?.dataContext as CasePieSlice)?.tooltip ?? 'Explore case types');
    series.slices.template.adapters.add('ariaLabel', (_text, slice) => (slice.dataItem?.dataContext as CasePieSlice)?.tooltip.replace(/\n/g, '. ') ?? 'Explore case types');
    series.slices.template.events.on('click', ({ target }) => {
      const slice = target.dataItem?.dataContext as CasePieSlice | undefined;
      if (slice) select(slice.level === 'category' ? slice.category : null);
    });
    const controls = Array.from(figure.querySelectorAll<HTMLButtonElement>('[data-visual-action]'));
    const view = figure.querySelector<HTMLElement>('[data-pie-view]');
    function select(category: string | null) {
      expanded = data.categories.some(({ id, count }) => id === category && count > 0) ? category : null;
      // There is only one series. Never draw parent and child counts together.
      series.data.setAll(casePieSlices(data, expanded).map((slice) => ({
        ...slice, sliceSettings: { fill: am5.Color.brighten(am5.color(dark ? slice.dark : slice.light), slice.shade), active: slice.level === 'subcategory' },
      })));
      for (const button of controls) {
        const action = button.dataset.visualAction;
        if (action === 'pie-reset') button.disabled = expanded === null;
        else button.setAttribute('aria-pressed', String(action === `pie-category:${expanded}`));
      }
      if (view) {
        const label = data.categories.find(({ id }) => id === expanded)?.label;
        view.textContent = `${label ? `Showing subcategories of ${label}` : 'Showing all categories'}. Slice percentages use the ${data.total} ${data.kind === 'example' ? 'example ' : ''}cases in ${data.title.toLowerCase()}. Use the table below to open case summaries.`;
      }
    }
    select(expanded);
    resize = new ResizeObserver(() => {
      const compact = host.clientWidth < 500;
      series.labels.template.set('maxWidth', compact ? 105 : 140);
      for (const label of series.labels) label.markDirty();
      tooltip.label.set('maxWidth', Math.min(330, Math.max(160, host.clientWidth - 45)));
    });
    resize.observe(host);
    return {
      state: () => ({ pieCategory: expanded }), visible() {},
      motion(enabled) {
        const duration = enabled ? settings.pie.transitionDuration : 0;
        series.set('interpolationDuration', duration);
        series.slices.template.set('stateAnimationDuration', duration);
      },
      action(action) {
        if (action === 'pie-reset') select(null);
        else if (action.startsWith('pie-category:')) {
          const category = action.slice('pie-category:'.length);
          select(category === expanded ? null : category);
        }
      },
      dispose() { resize?.disconnect(); root.dispose(); },
    };
  } catch (error) { resize?.disconnect(); root.dispose(); throw error; }
}
