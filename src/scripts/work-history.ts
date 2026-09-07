import type { CareerChartData } from '../lib/career-timeline';
import type { CareerChart } from '../lib/career-chart';

export function mountCareerTimelines() {
  const cleanups = Array.from(document.querySelectorAll<HTMLElement>('[data-career-timeline]'), (figure) => {
    const abort = new AbortController();
    const options = { signal: abort.signal };
    const panel = figure.querySelector<HTMLElement>('[data-career-interactive]');
    const status = figure.querySelector<HTMLElement>('[data-career-status]');
    const host = figure.querySelector<HTMLElement>('[data-career-chart]');
    const dataText = figure.querySelector('[data-career-data]')?.textContent;
    const data: CareerChartData | undefined = dataText ? JSON.parse(dataText) : undefined;
    const links = Array.from(figure.querySelectorAll<HTMLAnchorElement>('[data-position-link]'));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let chart: CareerChart | undefined;
    let generation = 0;
    let wanted = false;
    let suspended = false;
    let viewport = { start: 0, end: 1 };
    let selected = '';

    function selectPosition() {
      selected = links.find((link) => link.hash === window.location.hash)?.hash.slice(1) ?? '';
      for (const link of links) {
        if (link.hash === `#${selected}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
      if (selected) {
        const details = document.getElementById(selected)?.querySelector('details');
        if (details) details.open = true;
      }
      chart?.select(selected);
    }
    function navigate(id: string) {
      const article = document.getElementById(id);
      if (!article) return;
      const details = article.querySelector('details');
      if (details) details.open = true;
      if (window.location.hash !== `#${id}`) window.location.hash = id;
      selectPosition();
      article.focus({ preventScroll: true });
      article.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'instant' : 'smooth' });
    }
    for (const link of links) link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(link.hash.slice(1));
    }, options);
    window.addEventListener('hashchange', selectPosition, options);
    selectPosition();

    async function render() {
      if (!wanted || suspended || !host || !data || !panel) return;
      const revision = ++generation;
      if (chart) viewport = chart.window();
      chart?.dispose();
      chart = undefined;
      if (status) status.hidden = false;
      try {
        const { createCareerChart } = await import('../lib/career-chart');
        if (revision !== generation || suspended || abort.signal.aborted) return;
        panel.hidden = false;
        chart = createCareerChart(host, figure, data, navigate, viewport);
        chart.select(selected);
        if (status) status.hidden = true;
      } catch (error) {
        if (revision !== generation || abort.signal.aborted) return;
        chart?.dispose();
        chart = undefined;
        panel.hidden = true;
        if (status) {
          status.hidden = false;
          status.textContent = 'The interactive timeline is unavailable. Select a position below to read its details.';
        }
        console.error('Work history timeline could not load.', error);
      }
    }
    const observer = new IntersectionObserver((changes) => {
      if (changes.some(({ isIntersecting }) => isIntersecting)) {
        wanted = true;
        observer.disconnect();
        void render();
      }
    }, { rootMargin: '240px' });
    if (data) observer.observe(figure);
    const themeObserver = new MutationObserver(() => void render());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    reduced.addEventListener('change', () => void render(), options);
    window.addEventListener('pagehide', () => {
      suspended = true;
      generation++;
      if (chart) viewport = chart.window();
      chart?.dispose();
      chart = undefined;
    }, options);
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        suspended = false;
        selectPosition();
        void render();
      }
    }, options);
    return () => {
      generation++;
      abort.abort();
      observer.disconnect();
      themeObserver.disconnect();
      chart?.dispose();
    };
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
