// Player: プレイヤーキャラクターの状態と振る舞い

import type { KeyState } from './types.ts';
import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  JUMP_VELOCITY,
  INVINCIBLE_FRAMES,
} from './constants.ts';

export class Player {
  x: number;
  y: number;
  width: number = PLAYER_WIDTH;
  height: number = PLAYER_HEIGHT;
  vx: number = 0;
  vy: number = 0;
  isOnGround: boolean = false;
  isInvincible: boolean = false;
  invincibleTimer: number = 0;

  constructor(spawnX: number, spawnY: number) {
    this.x = spawnX;
    this.y = spawnY;
  }

  /**
   * キー入力に基づいてプレイヤーの速度を更新する。
   * - 左右キー: vx を ±PLAYER_SPEED に設定（どちらも押されていなければ 0）
   * - ジャンプキー: 地上にいる場合のみ vy = JUMP_VELOCITY（二段ジャンプ禁止）
   * Requirements: 1.1, 1.2, 1.3, 1.5, 1.6
   */
  applyInput(keyState: KeyState): void {
    // 水平移動 (要件 1.1, 1.2, 1.6)
    if (keyState.left && !keyState.right) {
      this.vx = -PLAYER_SPEED;
    } else if (keyState.right && !keyState.left) {
      this.vx = PLAYER_SPEED;
    } else {
      this.vx = 0;
    }

    // ジャンプ（地上のみ、二段ジャンプ禁止）(要件 1.3, 1.5)
    if (keyState.jump && this.isOnGround) {
      this.vy = JUMP_VELOCITY;
      this.isOnGround = false;
    }
  }

  /**
   * プレイヤーをスポーン座標にリセットし、無敵状態を付与する。
   * Requirements: 2.5, 3.4, 3.6
   */
  respawn(spawnX: number, spawnY: number): void {
    this.x = spawnX;
    this.y = spawnY;
    this.vx = 0;
    this.vy = 0;
    this.isOnGround = false;
    this.isInvincible = true;
    this.invincibleTimer = INVINCIBLE_FRAMES;
  }
}
