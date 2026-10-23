# Contract: `vec.js` and `HeroKit.keys`

## `lessons/shared/vec.js`

DOM-free. In the browser it is `window.Vec`; in Node, `require('../lessons/shared/vec.js')`.
Vectors are plain arrays `[x, y]` or `[x, y, z]`. Nothing mutates its inputs.

| Function | Returns | Notes |
|---|---|---|
| `add(a, b)` | a + b | same length arrays |
| `sub(a, b)` | a − b | |
| `scale(a, k)` | k·a | |
| `len(a)` | √(Σ aᵢ²) | ≥ 0 |
| `unit(a)` | a / len(a), or `null` | `null` when len(a) < 1e-9 |
| `near(a, b, tol)` | every \|aᵢ − bᵢ\| ≤ tol | for mission criteria |
| `toParent(pB, oB)` | P in {A} = oB + pB | frames with the same orientation |
| `inFrame(pA, oB)` | P in {B} = pA − oB | |
| `cross3(a, b)` | a × b | 3D only |
| `det3(x, y, z)` | x · (y × z) | |
| `handedness(x, y, z)` | `'right'`, `'left'` or `null` | `null` when \|det\| < 1e-9 |
| `fmt(v, d)` | "(3.0, 4.0)" with a real minus sign | display only, d decimals (default 1) |

## `HeroKit.keys(cv, opts)`

```js
HeroKit.keys(cv, {
  handles: ['tail', 'tip'],          // cycle order; 'view' for a rotate-only scene
  move(name, dx, dy) {},             // dx, dy in scene units (step 0.5, Shift 0.1)
  describe(name) { return 'tip at (3.0, 2.0)'; },  // text for the live region
  active: () => current,             // optional: lets draw() ring the active handle
});
```

- Sets `tabindex="0"` on the canvas if it is missing. Arrow keys call `move` and
  `preventDefault` (no page scroll). `Enter`/`Space` go to the next handle. `Tab` is never
  captured.
- Creates or reuses `<p class="sr kb-live" aria-live="polite">` right after the canvas, and
  writes `describe(active)` after every key.
- Returns `{ get active() }`. The scene's `draw()` asks it which handle to ring while
  `document.activeElement === cv`.
