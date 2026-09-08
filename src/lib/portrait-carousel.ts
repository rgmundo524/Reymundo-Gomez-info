const controllers = new Map<HTMLElement, () => void>();
let generation = 0;
let modules: Promise<[typeof import('embla-carousel'), typeof import('embla-carousel-autoplay')]> | undefined;

export function destroyPortraitCarousels() {
  generation++;
  controllers.forEach((cleanup) => cleanup());
  controllers.clear();
}

export async function initPortraitCarousels() {
  const roots = [...document.querySelectorAll<HTMLElement>('[data-portrait-carousel]')]
    .filter((root) => !controllers.has(root));
  if (!roots.length) return;
  const currentGeneration = generation;
  try {
    modules ??= Promise.all([import('embla-carousel'), import('embla-carousel-autoplay')]);
    const [{ default: EmblaCarousel }, { default: Autoplay }] = await modules;
    if (generation !== currentGeneration) return;
    for (const root of roots) {
      if (!root.isConnected || controllers.has(root)) continue;
      const viewport = root.querySelector<HTMLElement>('[data-portrait-viewport]');
      const controls = root.querySelector<HTMLElement>('[data-portrait-controls]');
      const previous = root.querySelector<HTMLButtonElement>('[data-portrait-prev]');
      const next = root.querySelector<HTMLButtonElement>('[data-portrait-next]');
      const toggle = root.querySelector<HTMLButtonElement>('[data-portrait-toggle]');
      const position = root.querySelector<HTMLElement>('[data-portrait-position]');
      const slides = [...root.querySelectorAll<HTMLElement>('[data-portrait-slide]')];
      if (!viewport || !controls || !previous || !next || !position || slides.length < 2) continue;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      const autoplay = Autoplay({
        delay: Number(root.dataset.interval ?? 6000), playOnInit: false,
        stopOnInteraction: true, stopOnMouseEnter: true, stopOnFocusIn: true,
        rootNode: () => root,
        breakpoints: { '(prefers-reduced-motion: reduce)': { active: false } },
      });
      slides.forEach((slide) => { slide.hidden = false; });
      let api: ReturnType<typeof EmblaCarousel>;
      try {
        api = EmblaCarousel(viewport, {
          loop: true, align: 'start',
          breakpoints: { '(prefers-reduced-motion: reduce)': { duration: 0 } },
        }, [autoplay]);
      } catch (error) {
        slides.forEach((slide, index) => { slide.hidden = index > 0; });
        console.warn('Profile photos could not be enhanced; showing the first photo.', error);
        continue;
      }

      let wantsPlayback = root.dataset.autoplay === 'true' && !reduced.matches
        && !root.contains(document.activeElement) && !root.matches(':hover');
      const updateRotation = (playing = autoplay.isPlaying()) => {
        position.setAttribute('aria-live', playing ? 'off' : 'polite');
        if (!toggle) return;
        toggle.hidden = reduced.matches;
        toggle.setAttribute('aria-label', playing ? 'Pause automatic photo rotation' : 'Play automatic photo rotation');
        toggle.querySelector('[data-portrait-play]')?.toggleAttribute('hidden', playing);
        toggle.querySelector('[data-portrait-pause]')?.toggleAttribute('hidden', !playing);
        const label = toggle.querySelector('[data-portrait-toggle-label]');
        if (label) label.textContent = playing ? 'Pause' : 'Play';
      };
      const updatePhoto = () => {
        const selected = api.selectedScrollSnap();
        slides.forEach((slide, index) => slide.setAttribute('aria-hidden', String(index !== selected)));
        position.textContent = `${selected + 1} / ${slides.length}`;
        previous.disabled = !api.canScrollPrev();
        next.disabled = !api.canScrollNext();
      };
      const stop = () => { wantsPlayback = false; autoplay.stop(); };
      const onPrevious = () => { stop(); api.scrollPrev(reduced.matches); };
      const onNext = () => { stop(); api.scrollNext(reduced.matches); };
      // Focus stops rotation before click. Preserve a pointer's original intent
      // so clicking Pause cannot accidentally restart it after that focus event.
      let requestedPlayback: boolean | undefined;
      const onTogglePointer = () => { requestedPlayback = !autoplay.isPlaying(); };
      const onToggle = () => {
        const play = requestedPlayback ?? !autoplay.isPlaying();
        requestedPlayback = undefined;
        if (play && !reduced.matches) { wantsPlayback = true; autoplay.play(); }
        else stop();
      };
      const onToggleCancel = () => { requestedPlayback = undefined; };
      const onMotionChange = () => { if (reduced.matches) stop(); updateRotation(); };
      const onVisibility = () => {
        if (wantsPlayback && !document.hidden && !reduced.matches) autoplay.play();
        else autoplay.stop();
      };
      let disposed = false;
      // A resize can reorder Embla's visibility listener. Reconcile after all
      // listeners so a remembered library resume cannot override a user's pause.
      const onDocumentVisibility = () => queueMicrotask(() => { if (!disposed) onVisibility(); });
      const onReInit = () => { updatePhoto(); onVisibility(); updateRotation(); };
      // Embla v8 emits these events before updating isPlaying(). Use the event's
      // explicit state so the pause control and live region never read the old flag.
      api.on('select', updatePhoto).on('reInit', onReInit).on('pointerDown', stop)
        .on('autoplay:play', () => updateRotation(true)).on('autoplay:stop', () => updateRotation(false));
      previous.addEventListener('click', onPrevious);
      next.addEventListener('click', onNext);
      toggle?.addEventListener('pointerdown', onTogglePointer);
      toggle?.addEventListener('pointercancel', onToggleCancel);
      toggle?.addEventListener('pointerleave', onToggleCancel);
      toggle?.addEventListener('keydown', onToggleCancel);
      toggle?.addEventListener('click', onToggle);
      root.addEventListener('focusin', stop);
      root.addEventListener('mouseenter', stop);
      reduced.addEventListener('change', onMotionChange);
      document.addEventListener('visibilitychange', onDocumentVisibility);
      controls.hidden = false;
      updatePhoto();
      updateRotation();
      onVisibility();

      controllers.set(root, () => {
        disposed = true;
        previous.removeEventListener('click', onPrevious);
        next.removeEventListener('click', onNext);
        toggle?.removeEventListener('pointerdown', onTogglePointer);
        toggle?.removeEventListener('pointercancel', onToggleCancel);
        toggle?.removeEventListener('pointerleave', onToggleCancel);
        toggle?.removeEventListener('keydown', onToggleCancel);
        toggle?.removeEventListener('click', onToggle);
        root.removeEventListener('focusin', stop);
        root.removeEventListener('mouseenter', stop);
        reduced.removeEventListener('change', onMotionChange);
        document.removeEventListener('visibilitychange', onDocumentVisibility);
        api.destroy();
        controls.hidden = true;
        slides.forEach((slide, index) => {
          slide.hidden = index > 0;
          slide.removeAttribute('aria-hidden');
        });
      });
    }
  } catch (error) {
    modules = undefined;
    console.warn('Profile photo controls are unavailable; showing the first photo.', error);
  }
}
