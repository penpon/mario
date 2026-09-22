---
inclusion: always
---

# Constants Convention: No Magic Numbers in Gameplay Code

## Rule

All physics values, game tuning values, and dimension constants MUST be defined in `src/constants.ts` and referenced by name everywhere else. Never hardcode numeric literals for these values inline.

## Applies To

Any value that affects gameplay behavior or balance:
- Speeds and velocities (player, enemy, projectile)
- Jump and gravity values
- Hitbox dimensions
- Timers and durations (invincibility, respawn delay)
- Score increments
- Thresholds (stomp detection range, fall-out Y boundary)

## Examples

**✅ OK — reference the constant by name**
```typescript
player.vx = PLAYER_SPEED;
player.vy = JUMP_VELOCITY;
vy += GRAVITY;
enemy.vx = ENEMY_SPEED;
if (player.y > canvas.height + 1)   // canvas.height is a runtime value, not a tuning value
```

**❌ NG — hardcoded magic number**
```typescript
player.vx = 5;
player.vy = -15;
vy += 1;
enemy.vx = 2;
if (player.y > canvas.height + 100) // 100 should be a named constant
```

## Adding New Constants

When introducing a new tuning value, always add it to `src/constants.ts` first:

```typescript
// src/constants.ts
export const STOMP_DETECTION_RANGE = 8;  // px — enemy top area that counts as a stomp
export const INVINCIBLE_FRAMES = 120;    // frames — 2 seconds at 60fps
```

Then import and use it:

```typescript
import { STOMP_DETECTION_RANGE } from './constants';

const isStomping = player.vy > 0 && enemyTop - playerBottom <= STOMP_DETECTION_RANGE;
```

## Exceptions

These are NOT subject to this rule:
- Indices and counts that are structural (`0`, `1`, array indices)
- Canvas/DOM runtime values (`canvas.width`, `canvas.height`)
- Boolean flags (`true`, `false`)
- String literals (phase names, key identifiers)

## Rationale

All balance tuning should require exactly one file change — `src/constants.ts`. If a value is hardcoded inline, changing it means hunting through multiple files and risking inconsistency. Keeping constants centralized also makes the design intent explicit: a reader can see all tuning knobs in one place.
