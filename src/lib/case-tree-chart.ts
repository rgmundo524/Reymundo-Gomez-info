import * as am5 from '@amcharts/amcharts5';
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy';
import settings from '../config/case-visuals.json';
import { caseChartStyle, caseLabelColor } from './case-chart-style';
import type { CaseNode, CaseTreeData, CaseVisual, CaseVisualState } from './case-visuals';

export function createCaseTree(host: HTMLElement, figure: HTMLElement, data: CaseTreeData,
  motionEnabled: boolean, viewportVisible: boolean, saved: CaseVisualState = {}): CaseVisual {
  const root = am5.Root.new(host);
  let series: am5hierarchy.ForceDirected | undefined;
  try {
    const { dark, ink, muted, tooltip } = caseChartStyle(root, figure);
    const paper = am5.color(getComputedStyle(figure).getPropertyValue('--paper').trim());
    let enabled = motionEnabled;
    let visible = viewportVisible;
    let settle = true;
    let initialized = false;
    const duration = () => enabled ? 200 : 0;
    const zoom = root.container.children.push(am5.ZoomableContainer.new(root, {
      width: am5.p100, height: am5.p100, wheelable: true, pinchZoom: true,
      minZoomLevel: 1, maxZoomLevel: 5, zoomStep: 1.2, animationDuration: duration(),
      background: am5.Rectangle.new(root, { fill: paper, fillOpacity: 1 }),
    }));
    const tree = series = zoom.contents.children.push(am5hierarchy.ForceDirected.new(root, {
      width: am5.p100, height: am5.p100,
      categoryField: 'label', idField: 'id', childDataField: 'children', valueField: 'value',
      initialDepth: settings.tree.initialDepth, downDepth: 1, topDepth: 0, singleBranchOnly: false,
      minRadius: settings.tree.minRadius, maxRadius: settings.tree.maxRadius,
      nodePadding: 18, manyBodyStrength: -14, centerStrength: 0.6, velocityDecay: 0.6,
      showOnFrame: 0, animationDuration: duration(), stateAnimationDuration: duration(),
    }));
    // The ZoomableContainer's oversized background travels with its contents
    // and provides a continuous hit area for wheel, pinch, and drag gestures.
    zoom.contents.get('background')?.setAll({ fill: paper, fillOpacity: 1, strokeOpacity: 0 });
    const color = (node?: CaseNode) => node ? am5.color(dark ? node.dark : node.light) : muted;
    tree.nodes.template.setAll({
      interactive: true, focusable: true, hoverOnFocus: true, cursorOverStyle: 'pointer', role: 'button',
      tooltip, tooltipText: 'Explore cases', tooltipPosition: 'pointer', stateAnimationDuration: duration(),
    });
    tree.nodes.template.adapters.add('tooltipText', (_text, node) => (node.dataItem?.dataContext as CaseNode)?.tooltip ?? 'Explore cases');
    tree.nodes.template.adapters.add('ariaLabel', (_text, node) => (node.dataItem?.dataContext as CaseNode)?.tooltip.replace(/\n/g, '. ') ?? 'Explore cases');
    tree.nodes.template.adapters.add('role', (_role, node) => (node.dataItem?.dataContext as CaseNode)?.type === 'case' ? 'link' : 'button');
    tree.nodes.template.events.on('click', ({ target }) => {
      if (target.isDragging()) return;
      const node = target.dataItem?.dataContext as CaseNode | undefined;
      if (node?.type === 'case' && node.url) window.location.assign(node.url);
      else settle = true; // Built-in parent toggling remains intact.
    });
    tree.nodes.template.events.on('dragstop', () => { settle = true; });
    tree.circles.template.setAll({ strokeOpacity: 0.85, strokeWidth: 1, fillOpacity: 0.92 });
    tree.circles.template.adapters.add('fill', (_fill, circle) => color(circle.dataItem?.dataContext as CaseNode));
    tree.circles.template.adapters.add('stroke', (_stroke, circle) => color(circle.dataItem?.dataContext as CaseNode));
    tree.outerCircles.template.setAll({ fillOpacity: 0.08, strokeOpacity: 0.5, strokeWidth: 2 });
    tree.outerCircles.template.adapters.add('fill', (_fill, circle) => color(circle.dataItem?.dataContext as CaseNode));
    tree.outerCircles.template.adapters.add('stroke', (_stroke, circle) => color(circle.dataItem?.dataContext as CaseNode));
    tree.links.template.setAll({ stroke: muted, strokeWidth: 1.5, strokeOpacity: 0.4 });
    tree.labels.template.setAll({
      fill: dark ? am5.color('#142131') : am5.color('#ffffff'), fontSize: 12,
      textAlign: 'center', oversizedBehavior: 'wrap', breakWords: true,
      populateText: false, ignoreFormatting: true,
    });
    tree.labels.template.adapters.add('text', (_text, label) => {
      const node = label.dataItem?.dataContext as CaseNode | undefined;
      return node ? `${node.label}${node.type === 'case' ? '' : `\n${node.count}`}` : '';
    });
    tree.labels.template.adapters.add('fill', (fill, label) => {
      const node = label.dataItem?.dataContext as CaseNode | undefined;
      return dark && node ? caseLabelColor(color(node)) : fill;
    });

    const bullets: { animation: { pause(): void; play(): void }; endpointsVisible(): boolean }[] = [];
    tree.linkBullets.push((bulletRoot, source, target) => {
      const bullet = am5.Bullet.new(bulletRoot, {
        locationX: 0, sprite: am5.Circle.new(bulletRoot, {
          radius: 3, fill: color(target.dataContext as CaseNode), fillOpacity: 0.9, interactive: false,
        }),
      });
      const animation = bullet.animate({ key: 'locationX', from: 0, to: 1,
        duration: settings.tree.bulletDuration, loops: Infinity });
      bullets.push({ animation, endpointsVisible: () => [source, target].every((item) => {
        const node = item.get('node');
        return !node.isHidden() && !node.isHiding();
      }) });
      if (!enabled || !visible) animation.pause();
      return bullet;
    });
    function syncMotion() {
      const running = enabled && visible;
      for (const bullet of bullets) {
        if (running && bullet.endpointsVisible()) bullet.animation.play();
        else bullet.animation.pause();
      }
      if (!running) tree.d3forceSimulation.stop();
    }
    function resume() {
      if (enabled && visible) tree.d3forceSimulation.alpha(Math.max(tree.d3forceSimulation.alpha(), 0.3)).restart();
      // A preloaded, paused chart can have no active animation frame when it
      // first scrolls into view. Request one to compute its static layout.
      else if (visible && settle) tree.markDirtySize();
      syncMotion();
    }
    type Item = am5.DataItem<am5hierarchy.IForceDirectedDataItem>;
    function visit(items: Item[], callback: (item: Item) => void) {
      for (const item of items) { callback(item); visit(item.get('children', []), callback); }
    }
    function collapseCases() {
      // Restore investigations/categories while keeping case leaves collapsed.
      tree.enableDataItem(tree.dataItems[0], settings.tree.initialDepth, 0, 0);
      visit(tree.dataItems, (item) => {
        if ((item.dataContext as CaseNode).type === 'category') tree.disableDataItem(item, 0);
      });
      settle = true;
    }
    tree.data.setAll([structuredClone(data.tree)]);
    tree.set('selectedDataItem', tree.dataItems[0]);
    function restore(items: Item[], expanded: Set<string>) {
      for (const item of items) {
        const children = item.get('children', []);
        if (!children.length) continue;
        if (expanded.has((item.dataContext as CaseNode).id)) {
          tree.enableDataItem(item, 1, 0, 0);
          restore(children, expanded);
        } else tree.disableDataItem(item, 0);
      }
    }
    // Physics runs on a separate D3 timer. Pausing amCharts animations alone
    // would leave nodes moving and the simulation alive after disposal.
    root.events.on('frameended', () => {
      if (!initialized) {
        initialized = true;
        settle = true;
        // Hierarchy applies selectedDataItem on its first frame. Restore only
        // afterward so initialDepth cannot overwrite the saved expansion.
        if (saved.expanded) {
          restore(tree.dataItems, new Set(saved.expanded));
          if (saved.zoom) zoom.contents.setAll(saved.zoom);
          tree.markDirtySize();
          syncMotion();
          return;
        }
      }
      if (!enabled || !visible) {
        tree.d3forceSimulation.stop();
        if (settle && visible) {
          tree.updateNodePositions();
          tree.d3forceSimulation.alpha(1).tick(160);
          tree.updateNodePositions();
          settle = false;
        }
      } else settle = false;
      syncMotion();
    });
    tree.events.on('boundschanged', () => { settle = true; });
    // Explicit tooltip colors also apply to labels on dark and light canvases.
    root.interfaceColors.set('text', ink);
    return {
      state() {
        const expanded: string[] = [];
        visit(tree.dataItems, (item) => {
          if (item.get('children')?.length && !item.get('disabled')) expanded.push((item.dataContext as CaseNode).id);
        });
        return { expanded, zoom: { x: zoom.contents.x(), y: zoom.contents.y(), scale: zoom.contents.get('scale', 1) } };
      },
      motion(value) {
        enabled = value;
        zoom.set('animationDuration', duration());
        tree.setAll({ animationDuration: duration(), stateAnimationDuration: duration() });
        tree.nodes.template.set('stateAnimationDuration', duration());
        resume();
      },
      visible(value) { visible = value; resume(); },
      action(action) {
        if (action === 'zoom-in') zoom.zoomIn();
        if (action === 'zoom-out') zoom.zoomOut();
        if (action === 'reset') { zoom.goHome(); collapseCases(); }
        if (action === 'collapse') collapseCases();
        resume();
      },
      dispose() { tree.d3forceSimulation.stop(); root.dispose(); },
    };
  } catch (error) { series?.d3forceSimulation.stop(); root.dispose(); throw error; }
}
