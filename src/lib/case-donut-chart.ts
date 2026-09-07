import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import settings from '../config/case-visuals.json';
import { caseChartStyle } from './case-chart-style';
import type { CaseDonutData, CaseVisual } from './case-visuals';

export function createCaseDonut(host: HTMLElement, figure: HTMLElement, data: CaseDonutData, motionEnabled: boolean): CaseVisual {
  const root = am5.Root.new(host);
  try {
    const { dark, ink, tooltip } = caseChartStyle(root, figure);
    const chart = root.container.children.push(am5percent.PieChart.new(root, {
      radius: am5.percent(88), innerRadius: am5.percent(settings.donut.innerRadius),
      startAngle: -90, endAngle: 270, paddingTop: 12, paddingBottom: 12,
      paddingLeft: 12, paddingRight: 12,
    }));
    chart.get('background')?.setAll({ fillOpacity: 0, strokeOpacity: 0 });
    const series = chart.series.push(am5percent.PieSeries.new(root, {
      categoryField: 'label', valueField: 'count', startAngle: -90, endAngle: 270,
      alignLabels: false,
    }));
    series.labels.template.set('forceHidden', true);
    series.ticks.template.set('forceHidden', true);
    series.slices.template.setAll({
      templateField: 'sliceSettings', toggleKey: 'none', interactive: true,
      focusable: true, hoverOnFocus: true, role: 'link', cursorOverStyle: 'pointer',
      tooltip, tooltipText: 'Open category', tooltipPosition: 'pointer',
      strokeOpacity: 0, cornerRadius: 3, stateAnimationDuration: motionEnabled ? 150 : 0,
      fillGradient: am5.RadialGradient.new(root, {
        stops: [{ offset: 0, brighten: -0.45 }, { offset: 0.58, brighten: -0.2 }, { offset: 1, brighten: 0.12 }],
      }),
      fillPattern: am5.GrainPattern.new(root, { size: 1, density: settings.donut.grainDensity,
        minOpacity: 0, maxOpacity: settings.donut.grainOpacity, colors: [am5.color(0x000000)] }),
    });
    type Slice = CaseDonutData['categories'][number];
    series.slices.template.adapters.add('tooltipText', (_text, slice) => (slice.dataItem?.dataContext as Slice)?.tooltip ?? 'Open category');
    series.slices.template.adapters.add('ariaLabel', (_text, slice) => (slice.dataItem?.dataContext as Slice)?.tooltip.replace(/\n/g, '. ') ?? 'Open category');
    series.slices.template.events.on('click', ({ target }) => {
      const item = target.dataItem?.dataContext as Slice | undefined;
      if (item?.url) window.location.assign(item.url);
    });
    series.children.push(am5.Label.new(root, {
      text: `[fontSize:36 fontWeight:600]${data.total.toLocaleString('en-US')}[/]\n[fontSize:14]${data.kind === 'example' ? 'examples' : 'cases'}[/]`,
      centerX: am5.p50, centerY: am5.p50, textAlign: 'center', fill: ink,
      interactive: false,
    }));
    // No amCharts legend or slice toggling: the denominator always includes
    // every record in this investigation type, exactly like the HTML table.
    series.data.setAll(data.categories.filter(({ count }) => count > 0).map((category) => ({
      ...category, sliceSettings: { fill: am5.color(dark ? category.dark : category.light) },
    })));
    return {
      state: () => ({}), visible() {},
      motion(enabled) { series.slices.template.set('stateAnimationDuration', enabled ? 150 : 0); },
      dispose() { root.dispose(); },
    };
  } catch (error) { root.dispose(); throw error; }
}
