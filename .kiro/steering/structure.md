# Project Structure

## Directory Layout

```
mario/
├── index.html              # Entry HTML; contains <canvas id="game-canvas">
├── src/
│   ├── main.ts             # Entry point: initializes Canvas, creates and starts GameManager
│   ├── game.ts             # GameManager class, GameState, game loop (requestAnimationFrame)
│   ├── input.ts            # InputHandler: keyboard events → KeyState
│   ├── player.ts           # Player class: movement, jump, respawn, invincibility timer
│   ├── enemy.ts            # Enemy class: patrol movement, direction reversal
│   ├── physics.ts          # PhysicsEngine: gravity, AABB collision detection & resolution
│   ├── camera.ts           # Camera class: horizontal scroll, stage-edge clamping
│   ├── renderer.ts         # Renderer class: Canvas drawing, HUD, game over/clear overlays
│   ├── stage.ts            # StageData definition and sample stage layout
│   ├── types.ts            # Shared interfaces: GameObject, AABB, KeyState, GameState, etc.
│   └── constants.ts        # All numeric constants (speeds, gravity, dimensions)
├── tests/
│   └── *.test.ts           # Vitest + fast-check property and unit tests
├── vite.config.ts          # Vite + Vitest configuration
└── tsconfig.json
```

## Architectural Patterns

### Component Separation
Each concern maps to exactly one file. Components are independent classes/modules with no circular dependencies.

### Game Loop Order (per frame)
1. `InputHandler.getState()` — read keyboard state
2. `player.applyInput(keyState)` — apply input to player velocity
3. `PhysicsEngine.update()` — apply gravity, resolve collisions
4. Game event checks — coins, enemy stomps, damage, goal, fall-out
5. `Camera.update()` — scroll to follow player
6. `Renderer.render()` — draw everything to Canvas

### State Management
All mutable game state lives in a single `GameState` object owned by `GameManager`. Components receive what they need as parameters — they do not hold global references.

### Game Phases
`GamePhase = 'playing' | 'gameover' | 'stageclear'`
The game loop only runs (`requestAnimationFrame` re-registers) when `phase === 'playing'`.

## Testing Conventions
- Property-based tests use `fast-check` and target pure logic (physics, scoring, camera, player input)
- Each property test includes a comment: `// Feature: super-mario-like-game, Property {N}: {description}`
- Unit tests cover concrete boundary scenarios (e.g., goal + life-0 same frame → stage clear wins)
- Canvas rendering, keyboard input, and 60fps feel are verified manually in the browser only
- Always run tests with `vitest --run` (never `--watch`)

## Coding Conventions
- TypeScript strict mode; avoid `any`
- Numeric game constants placement and usage: see `constants-convention.md` (canonical). Do not duplicate the rule here — `constants.ts` is the single source.
- Interfaces for all game objects defined in `types.ts`
- HUD elements (`drawHUD`, `drawGameOver`, `drawStageClear`) are drawn without camera transform (fixed screen position)
- Collected coins (`isCollected === true`) and dead enemies (`isAlive === false`) must be excluded from both rendering and collision checks
