# Tech Stack

## Language & Runtime
- **TypeScript** — strict typing throughout; no `any` unless unavoidable
- Runs in modern browsers (Chrome / Firefox / Safari); no Node.js runtime required

## Rendering
- **HTML5 Canvas 2D API** — vanilla, no external game engine (Phaser, Pixi, etc.)
- Single `<canvas id="game-canvas">` element in `index.html`

## Build Tooling
- **Vite** — dev server and ESModule bundler
- TypeScript template (`npm create vite`)

## Testing
- **Vitest** — test runner (always use `--run` flag, never watch mode)
- **fast-check** — property-based testing; minimum 100 iterations per property test
- Tests live in `tests/` directory

## Key Libraries / APIs
- `requestAnimationFrame` — game loop, targeting 60 fps
- No external state management, no UI frameworks

## Physics Constants (values listed here, enforcement in `constants-convention.md`)
| Constant | Value | Purpose |
|---|---|---|
| `PLAYER_SPEED` | 5 px/frame | Horizontal movement |
| `JUMP_VELOCITY` | -15 px/frame | Jump initial velocity (negative = up) |
| `GRAVITY` | 1 px/frame² | Gravitational acceleration |
| `ENEMY_SPEED` | 2 px/frame | Enemy patrol speed |
| `PLAYER_WIDTH/HEIGHT` | 32 px | Player hitbox dimensions |
| `INVINCIBLE_FRAMES` | 120 frames | Post-damage invincibility (2 seconds) |

> Rule enforcement (OK/NG, exceptions, how to add): see `constants-convention.md`. This section is the value dictionary only.

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests (single pass — do not use watch mode)
npx vitest --run

# Build for production
npm run build
```

## Collision Detection
AABB (Axis-Aligned Bounding Box) — top-face collisions take priority over side-face collisions when both occur in the same frame.

## Y-Axis Convention
Y increases downward. Upward velocity is negative (e.g., `JUMP_VELOCITY = -15`).
