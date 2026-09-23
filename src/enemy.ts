// Enemy: 敵キャラクターの状態と自律移動
// Task 6.1 — Enemy クラスの実装
// Requirements: 3.1, 3.2

import { ENEMY_WIDTH, ENEMY_HEIGHT, ENEMY_SPEED, SCREEN_HEIGHT } from './constants.ts';
import { applyGravity, overlaps, getOverlap } from './physics.ts';
import type { PlatformDef } from './types.ts';

export class Enemy {
  x: number;
  y: number;
  width: number = ENEMY_WIDTH;
  height: number = ENEMY_HEIGHT;
  vx: number;
  vy: number = 0;
  isOnGround: boolean = false;
  isAlive: boolean = true;

  constructor(x: number, y: number, direction: 1 | -1 = -1) {
    this.x = x;
    this.y = y;
    // 初期速度: 方向に応じて ±ENEMY_SPEED（要件 3.1）
    this.vx = ENEMY_SPEED * direction;
  }

  /**
   * 毎フレーム呼ばれる更新処理。
   * 1. 重力を適用する
   * 2. 速度に基づいて位置を更新する
   * 3. Platform との衝突を解決し、端や壁での方向転換を処理する（要件 3.2）
   * 4. ステージ外（画面下端を超えた）場合に isAlive = false にする
   *
   * Requirements: 3.1, 3.2
   */
  update(platforms: PlatformDef[], canvasHeight: number = SCREEN_HEIGHT): void {
    if (!this.isAlive) return;

    // 1. 重力を適用（空中にいる場合のみ vy += GRAVITY）
    this.isOnGround = false;
    applyGravity(this);

    // 2. 位置を更新
    this.x += this.vx;
    this.y += this.vy;

    // 3. Platform との衝突解決
    this._resolvePlatformCollisions(platforms);

    // 4. 画面下端を超えた場合は消滅
    if (this.y > canvasHeight + 1) {
      this.isAlive = false;
    }
  }

  /**
   * Platform 群との衝突を解決し、上面着地・側面壁反転・プラットフォーム端反転を処理する。
   * 衝突解決後も |vx| === ENEMY_SPEED を常に保つ（要件 3.1, 3.2）。
   */
  private _resolvePlatformCollisions(platforms: PlatformDef[]): void {
    for (const platform of platforms) {
      if (!overlaps(this, platform)) continue;

      const { overlapX, overlapY } = getOverlap(this, platform);

      if (overlapY <= overlapX) {
        // 垂直衝突（上面着地 or 天井）
        if (this.vy >= 0) {
          // 上面着地
          this.y = platform.y - this.height;
          this.vy = 0;
          this.isOnGround = true;
        } else {
          // 天井
          this.y = platform.y + platform.height;
          this.vy = 0;
        }
      } else {
        // 側面衝突 → 方向反転（要件 3.2）
        if (this.x + this.width / 2 < platform.x + platform.width / 2) {
          this.x = platform.x - this.width;
        } else {
          this.x = platform.x + platform.width;
        }
        this.vx = -this.vx; // 方向反転
      }
    }

    // プラットフォーム端での方向転換（要件 3.2）:
    // 現在立っているプラットフォームの端を超えたら方向を反転する。
    if (this.isOnGround) {
      const standingPlatform = this._findStandingPlatform(platforms);
      if (standingPlatform) {
        const enemyLeft = this.x;
        const enemyRight = this.x + this.width;
        // 敵の左端がプラットフォームの左端を超えた、または右端が右端を超えた
        if (enemyLeft < standingPlatform.x || enemyRight > standingPlatform.x + standingPlatform.width) {
          this.vx = -this.vx; // 方向反転
          // 端から出ないように押し戻す
          if (enemyLeft < standingPlatform.x) {
            this.x = standingPlatform.x;
          } else {
            this.x = standingPlatform.x + standingPlatform.width - this.width;
          }
        }
      }
    }
  }

  /**
   * 敵が現在立っているプラットフォームを返す。
   * 敵の下端がプラットフォームの上面と一致（±1px）していれば「立っている」と判定する。
   */
  private _findStandingPlatform(platforms: PlatformDef[]): PlatformDef | null {
    const enemyBottom = this.y + this.height;
    for (const platform of platforms) {
      const platformTop = platform.y;
      // 水平方向の重なり確認
      const horizontalOverlap =
        this.x < platform.x + platform.width &&
        this.x + this.width > platform.x;
      if (horizontalOverlap && Math.abs(enemyBottom - platformTop) <= 1) {
        return platform;
      }
    }
    return null;
  }
}
