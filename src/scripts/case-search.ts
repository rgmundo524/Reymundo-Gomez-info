import { caseSearchController, type PagefindCaseInstance } from '../lib/case-search-filters';
import { readable } from '../lib/cases';

type PagefindGlobal = { getInstanceManager(): { getInstance(name: string): PagefindCaseInstance } };

export function mountCaseSearch() {
  const search = document.querySelector<HTMLElement>('[data-case-search]');
  if (!search) return () => {};
  const abort = new AbortController();
  const reset = search.querySelector<HTMLButtonElement>('[data-case-search-reset]');
  const selection = search.querySelector<HTMLElement>('[data-case-search-selection]');
  const output = search.querySelector<HTMLElement>('[data-case-search-output]');
  const path = search.querySelector<HTMLElement>('[data-case-search-path]');
  const status = search.querySelector<HTMLElement>('[data-case-search-status]');
  const unsubscribe = caseSearchController.subscribe(({ filters, term }) => {
    const active = Boolean(term.trim()) || Object.values(filters).some((values) => values.length > 0);
    // Hide the parent so Pagefind's own rendering cannot reveal an idle result
    // list. Preloading can still prepare the filter options in the background.
    if (output) { output.hidden = !active; output.inert = !active; }
    if (selection) selection.hidden = !active;
    if (reset) reset.disabled = !active;
    const classification = filters.CasePath?.[0]?.split('/').slice(2).map((part) => part === '@unclassified' ? 'No further classification' : readable(part)) ?? [];
    const labels = [...(filters.Investigation ?? []), ...(filters.Category ?? []), ...classification];
    if (path) { path.textContent = labels.join(' → '); path.hidden = !labels.length; }
  });
  reset?.addEventListener('click', () => {
    caseSearchController.reset();
    search.querySelector<HTMLElement>('pagefind-input')?.focus();
  }, { signal: abort.signal });
  let disconnect: (() => void) | undefined;
  async function connect() {
    try {
      const url = '/pagefind/pagefind-component-ui.js';
      await import(/* @vite-ignore */ url);
      if (abort.signal.aborted) return;
      const components = (window as unknown as { PagefindComponents: PagefindGlobal }).PagefindComponents;
      disconnect = caseSearchController.connect(components.getInstanceManager().getInstance('cases'));
      if (status) status.hidden = true;
    } catch (error) {
      if (abort.signal.aborted) return;
      if (status) { status.hidden = false; status.textContent = 'Search could not load. Use the category links or Browse the case list below.'; }
      console.error('Case search could not load.', error);
    }
  }
  void connect();
  return () => { abort.abort(); unsubscribe(); disconnect?.(); };
}
