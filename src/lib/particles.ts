import type { ISourceOptions } from '@tsparticles/engine';
import settings from '../config/particles.json';

export function particleOptions(dark: boolean, compact: boolean, hover: boolean): ISourceOptions {
  const color = dark ? '#c94c44' : '#7a3a50';
  return {
    fullScreen: false,
    fpsLimit: 30,
    detectRetina: false,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    resize: { enable: true },
    particles: {
      number: { value: compact ? settings.count.mobile : settings.count.desktop, density: { enable: false } },
      paint: { color: { value: color } },
      shape: { type: 'circle' },
      opacity: { value: dark ? 0.5 : 0.35 },
      size: { value: settings.size },
      links: { enable: true, color, distance: settings.connectionDistance, opacity: dark ? 0.24 : 0.17, width: 1 },
      move: { enable: true, speed: settings.speed, outModes: { default: 'bounce' } },
    },
    interactivity: {
      // The plugin converts window coordinates to the document-height canvas on pointer movement.
      detectsOn: 'window',
      events: { onHover: { enable: hover, mode: 'grab' }, onClick: { enable: false } },
      modes: { grab: { distance: settings.hoverDistance, links: { color, opacity: 0.35 } } },
    },
  };
}
