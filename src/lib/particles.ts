import type { ISourceOptions } from '@tsparticles/engine';

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
      number: { value: compact ? 22 : 42, density: { enable: false } },
      paint: { color: { value: color } },
      shape: { type: 'circle' },
      opacity: { value: dark ? 0.5 : 0.35 },
      size: { value: { min: 1, max: 2.4 } },
      links: { enable: true, color, distance: 140, opacity: dark ? 0.24 : 0.17, width: 1 },
      move: { enable: true, speed: 0.35, outModes: { default: 'bounce' } },
    },
    interactivity: {
      // Window coordinates remain accurate when the pointer is over nested hero content.
      detectsOn: 'window',
      events: { onHover: { enable: hover, mode: 'grab' }, onClick: { enable: false } },
      modes: { grab: { distance: 160, links: { color, opacity: 0.35 } } },
    },
  };
}
