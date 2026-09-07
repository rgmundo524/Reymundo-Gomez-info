import * as am5 from '@amcharts/amcharts5';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';

export function caseChartStyle(root: am5.Root, element: HTMLElement) {
  const dark = document.documentElement.dataset.theme === 'dark';
  const style = getComputedStyle(element);
  const ink = am5.color(style.getPropertyValue('--ink').trim());
  const muted = am5.color(style.getPropertyValue('--muted').trim());
  const paper = am5.color(style.getPropertyValue('--paper').trim());
  if (dark) root.setThemes([am5themes_Dark.new(root)]);
  root.fps = 30;
  root.interfaceColors.setAll({ text: ink, grid: muted });
  root.container.get('background')?.setAll({ fillOpacity: 0, strokeOpacity: 0 });
  const tooltip = am5.Tooltip.new(root, {
    autoTextColor: false, getFillFromSprite: false, getStrokeFromSprite: false,
    getLabelFillFromSprite: false, getFillGradientFromSprite: false,
  });
  tooltip.get('background')?.setAll({ fill: paper, fillOpacity: 0.97, stroke: muted, strokeOpacity: 0.5 });
  tooltip.label.setAll({ fill: ink, fontSize: 14, maxWidth: Math.min(330, Math.max(160, element.clientWidth - 45)),
    oversizedBehavior: 'wrap', populateText: false, ignoreFormatting: true });
  return { dark, ink, muted, tooltip };
}
