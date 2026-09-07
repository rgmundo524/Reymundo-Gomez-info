import type { ISourceOptions } from '@tsparticles/engine';
import settings from '../config/particles.json';

export function particleOptions(dark: boolean, compact: boolean, hover: boolean): ISourceOptions {
  const color = dark ? '#c99baa' : '#7a3a50';
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
      // Window coordinates remain accurate when the pointer is over nested page content.
      detectsOn: 'window',
      events: { onHover: { enable: hover, mode: 'grab' }, onClick: { enable: false } },
      modes: { grab: { distance: 160, links: { color, opacity: 0.35 } } },
    },
  };
}
