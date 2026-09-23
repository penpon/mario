// PhysicsEngine: 重力適用・衝突判定・衝突解決
// Tasks 4.1, 4.2, 4.4, 4.7 — ヘルパー関数と重力適用・衝突解決の実装

import type { AABB } from './types.ts';
import type { Player } from './player.ts';
import { GRAVITY, ENEMY_SPEED } from './constants.ts';

/**
 * 2つの AABB が重なっているかを返す（辺が接しているだけの場合は false）
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function overlaps(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * 2つの AABB の各軸の重なり量を返す。
 * overlaps() が true の場合にのみ意味のある値になる。
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function getOverlap(
  a: AABB,
  b: AABB
): { overlapX: number; overlapY: number } {
  // 各軸の重なり量: 両矩形の端のうち内側にある端の差
  const overlapX =
    Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const overlapY =
    Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return { overlapX, overlapY };
}

/**
 * 空中にいるエンティティに重力を適用する。
 * isOnGround が false の場合のみ vy += GRAVITY を適用する。
 * Requirements: 1.4
 */
export function applyGravity(entity: { vy: number; isOnGround: boolean }): void {
  if (!entity.isOnGround) {
    entity.vy += GRAVITY;
  }
}

/**
 * プレイヤーとプラットフォーム群の衝突を解決する。
 *
 * 各プラットフォームについて以下のルールを適用する:
 * - 上面衝突（vy > 0）: vy = 0、isOnGround = true、プレイヤー下端を Platform 上面に揃える
 * - 天井衝突（vy < 0）: vy = 0、プレイヤー上端を Platform 下面に揃える
 * - 側面衝突（水平移動）: vx = 0、プレイヤーを水平方向に押し出す
 * - 上面 vs 側面の同時衝突は上面を優先する（要件 2.4）
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function resolvePlayerPlatformCollision(
  player: Player,
  platforms: AABB[]
): void {
  for (const platform of platforms) {
    if (!overlaps(player, platform)) {
      continue;
    }

    const { overlapX, overlapY } = getOverlap(player, platform);

    // 上面 vs 側面の優先判定（要件 2.4）:
    // overlapY <= overlapX のとき、または均等なとき → 垂直解決（上面優先）
    if (overlapY <= overlapX) {
      // 垂直方向の衝突
      if (player.vy >= 0) {
        // 上面衝突（下方向移動 or 静止）: 地面着地
        player.y = platform.y - player.height;
        player.vy = 0;
        player.isOnGround = true;
      } else {
        // 天井衝突（上方向移動）
        player.y = platform.y + platform.height;
        player.vy = 0;
      }
    } else {
      // 側面衝突
      if (player.x + player.width / 2 < platform.x + platform.width / 2) {
        // プレイヤーが Platform より左にいる → 右壁に当たった
        player.x = platform.x - player.width;
      } else {
        // プレイヤーが Platform より右にいる → 左壁に当たった
        player.x = platform.x + platform.width;
      }
      player.vx = 0;
    }
  }
}

/**
 * 敵とプラットフォーム群の衝突を解決する。
 *
 * 各フレームで以下を処理する:
 * - 敵がステージ外（y > canvasHeight + 1）に落ちた場合: isAlive = false
 * - 各プラットフォームとの重なりを検出し:
 *   - 上面衝突（overlapY <= overlapX）: 敵の下端を Platform 上面に揃える
 *   - 側面衝突（overlapX < overlapY）: 速度の方向を反転し、大きさを ENEMY_SPEED に保つ
 *
 * Requirements: 3.1, 3.2
 */
export function resolveEnemyPlatformCollision(
  enemy: { x: number; y: number; width: number; height: number; vx: number; isAlive: boolean },
  platforms: AABB[],
  canvasHeight: number
): void {
  // ステージ外（画面下端 + 1px）に落ちた場合は消滅
  if (enemy.y > canvasHeight + 1) {
    enemy.isAlive = false;
    return;
  }

  for (const platform of platforms) {
    if (!overlaps(enemy, platform)) {
      continue;
    }

    const { overlapX, overlapY } = getOverlap(enemy, platform);

    if (overlapY <= overlapX) {
      // 上面衝突（垂直方向）: 敵の下端を Platform 上面に揃える
      // 下から来た衝突（天井）は敵には通常発生しないが、念のため上面のみ処理
      if (enemy.y + enemy.height / 2 < platform.y + platform.height / 2) {
        // 敵が Platform より上にいる → 上面着地
        enemy.y = platform.y - enemy.height;
      }
      // 天井衝突の場合は何もしない（敵はジャンプしないため通常発生しない）
    } else {
      // 側面衝突: 速度の方向を反転し、大きさを ENEMY_SPEED に保つ（要件 3.2）
      enemy.vx = enemy.vx > 0 ? -ENEMY_SPEED : ENEMY_SPEED;

      // 敵を Platform の外側に押し出す
      if (enemy.x + enemy.width / 2 < platform.x + platform.width / 2) {
        // 敵が Platform より左 → 右壁に当たった → 左側に押し出す
        enemy.x = platform.x - enemy.width;
      } else {
        // 敵が Platform より右 → 左壁に当たった → 右側に押し出す
        enemy.x = platform.x + platform.width;
      }
    }
  }
}
