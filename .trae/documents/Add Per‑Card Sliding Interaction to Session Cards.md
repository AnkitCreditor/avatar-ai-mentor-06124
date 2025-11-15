## Overview

Implement an index‑aware horizontal slide animation on each session card when the card is interacted with (hover, pointer down/up, focus, touch). Use CSS transforms with a 300ms ease‑in‑out transition for smooth, GPU‑accelerated performance. Preserve existing behavior and mobile swipe.

## Key Decisions

* Animation tech: CSS `transform` + `transition` (300ms, ease‑in‑out)

* Index‑aware offset: compute per card and expose via a CSS variable `--slide-x`

* Events: pointer (mouse/touch/pen) + focus; avoid `preventDefault` to keep clicks and scroller drag intact

* Mobile swipe: keep `touch-action: pan-y` on the scroller; no changes to scroll logic

* Accessibility: include `:focus-within` activation and respect `prefers-reduced-motion`

## File Changes

### 1) `src/pages/Index.tsx`

* Add helper to compute per‑card slide offset by index:

  * `const getSlideOffset = (i: number) => (i % 2 === 0 ? '14px' : '-14px');`

* Add `interactingIndex` state: `const [interactingIndex, setInteractingIndex] = useState<number | null>(null);`

* Update list rendering to pass `index` and expose `--slide-x` CSS var on the wrapper. Add event handlers that set/clear `interactingIndex`:

  * Change map: `items.map((session, index) => ...)`

  * Wrapper `div.card-scroller-item` additions:

    * `style={{ '--slide-x': getSlideOffset(index) } as React.CSSProperties}`

    * `data-interacting={interactingIndex === index ? 'true' : 'false'}`

    * Handlers: `onPointerEnter`, `onPointerLeave`, `onPointerDown`, `onPointerUp`, `onTouchStart`, `onTouchEnd`, plus optional `onFocus`/`onBlur`

* Preserve card functionality: keep `renderSessionCard(session)` unchanged, or optionally accept `index` if needed for future styling. No `preventDefault` or stopPropagation calls.

Code sketch (illustrative):

```tsx
// top-level in Index
const [interactingIndex, setInteractingIndex] = useState<number | null>(null);
const getSlideOffset = (i: number) => (i % 2 === 0 ? '14px' : '-14px');

// inside renderEmblaCarousel
{items.map((session, index) => (
  <div
    key={session.id}
    className="card-scroller-item"
    style={{ ['--slide-x' as any]: getSlideOffset(index) }}
    data-interacting={interactingIndex === index ? 'true' : 'false'}
    onPointerEnter={() => setInteractingIndex(index)}
    onPointerLeave={() => setInteractingIndex(prev => (prev === index ? null : prev))}
    onPointerDown={() => setInteractingIndex(index)}
    onPointerUp={() => setInteractingIndex(prev => (prev === index ? null : prev))}
    onTouchStart={() => setInteractingIndex(index)}
    onTouchEnd={() => setInteractingIndex(prev => (prev === index ? null : prev))}
    onFocus={() => setInteractingIndex(index)}
    onBlur={() => setInteractingIndex(prev => (prev === index ? null : prev))}
  >
    {renderSessionCard(session)}
  </div>
))}
```

### 2) `src/pages/Index.css`

* Add index‑aware sliding styles; activate on interaction states and data attribute:

```css
.card-scroller-item[data-interacting="true"] .carousel-card,
.card-scroller-item:active .carousel-card,
.card-scroller-item:focus-within .carousel-card,
.card-scroller-item:hover .carousel-card {
  transform: translateX(var(--slide-x));
  transition: transform 300ms ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .card-scroller-item[data-interacting="true"] .carousel-card,
  .card-scroller-item:active .carousel-card,
  .card-scroller-item:focus-within .carousel-card,
  .card-scroller-item:hover .carousel-card {
    transition-duration: 0ms;
  }
}
```

* Keep existing `.carousel-card` transition/animation rules; the new rule only overrides transform during interaction.

* Maintain `touch-action: pan-y` (already present) to allow vertical scroll while enabling horizontal drag gestures.

## Cross‑Browser & Performance

* Use `transform: translateX(...)` for GPU‑accelerated, jank‑free animation.

* Pointer events unify mouse/touch/pen across modern browsers; `:active` covers iOS Safari edge cases.

* Avoid layout thrashing; no `offsetWidth` reads or JS animations; only class/attribute toggles.

## Documentation

* Add concise comments to `Index.tsx` near `getSlideOffset`, `interactingIndex`, and wrapper handlers explaining the animation trigger and index‑based offset.

* Add a short comment block in `Index.css` above the new rules documenting activation states and the `--slide-x` contract.

## Validation

* Desktop: hover and click each card = slides left/right based on index; buttons still work; scroller arrows still work.

* Mobile: tap on card anywhere, including inner controls, triggers slide without blocking horizontal swipe.

* Keyboard: tab into card controls triggers `focus-within` slide.

## Notes

* No external libraries added. If you prefer a library (e.g., Framer Motion), we can adapt, but CSS covers requirements cleanly.

