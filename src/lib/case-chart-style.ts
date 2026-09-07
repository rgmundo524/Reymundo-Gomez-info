import * as am5 from '@amcharts/amcharts5';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';

// Choose label ink from the actual fill, including brightened sunburst layers.
export function caseLabelColor(fill: am5.Color) {
  const channels = [fill.r, fill.g, fill.b].map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return am5.color(luminance > 0.179 ? '#000000' : '#ffffff');
}

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
