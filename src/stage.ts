// StageData: ステージデータ定義
// Requirements: 全体

import type { StageData } from './types.ts';
import {
  SCREEN_HEIGHT,
  COIN_WIDTH,
  COIN_HEIGHT,
  ENEMY_WIDTH,
  ENEMY_HEIGHT,
  ENEMY_SPEED,
  GOAL_WIDTH,
  GOAL_HEIGHT,
} from './constants.ts';

// ステージ幅: 画面幅 800px の 4 倍
const STAGE_WIDTH = 3200;

// 地面 Y 座標 (画面下部)
const GROUND_Y = SCREEN_HEIGHT - 32; // 568

/**
 * ステージ 1 の静的データ定義。
 * この定数はゲームの初期化・リスタート時に参照する。
 */
export const STAGE_1: StageData = {
  width: STAGE_WIDTH,

  // プレイヤー初期スポーン（地面のすぐ上）
  spawnX: 50,
  spawnY: GROUND_Y - 32, // 536

  platforms: [
    // ========== 地面 ==========
    // 全幅の地面プラットフォーム
    { x: 0,    y: GROUND_Y, width: STAGE_WIDTH, height: 32 },

    // ========== 低い足場 (1段) ==========
    { x: 300,  y: GROUND_Y - 80,  width: 128, height: 16 },
    { x: 550,  y: GROUND_Y - 80,  width: 96,  height: 16 },

    // ========== 中段の足場 ==========
    { x: 750,  y: GROUND_Y - 160, width: 160, height: 16 },
    { x: 1000, y: GROUND_Y - 120, width: 128, height: 16 },

    // ========== 高台 ==========
    { x: 1250, y: GROUND_Y - 200, width: 192, height: 16 },
    { x: 1550, y: GROUND_Y - 160, width: 128, height: 16 },

    // ========== 飛び石 ==========
    { x: 1800, y: GROUND_Y - 80,  width: 80,  height: 16 },
    { x: 1960, y: GROUND_Y - 140, width: 80,  height: 16 },
    { x: 2120, y: GROUND_Y - 80,  width: 80,  height: 16 },

    // ========== 終盤の足場 ==========
    { x: 2400, y: GROUND_Y - 160, width: 160, height: 16 },
    { x: 2700, y: GROUND_Y - 120, width: 192, height: 16 },
    { x: 2950, y: GROUND_Y - 200, width: 128, height: 16 },
  ],

  coins: [
    // 地上のコイン（序盤）
    { x: 150, y: GROUND_Y - 48 },
    { x: 200, y: GROUND_Y - 48 },

    // 低い足場の上
    { x: 320, y: GROUND_Y - 80 - 24 },
    { x: 370, y: GROUND_Y - 80 - 24 },

    // 中段足場の上
    { x: 780, y: GROUND_Y - 160 - 24 },
    { x: 830, y: GROUND_Y - 160 - 24 },

    // 高台の上（要ジャンプ）
    { x: 1280, y: GROUND_Y - 200 - 24 },
    { x: 1340, y: GROUND_Y - 200 - 24 },
    { x: 1400, y: GROUND_Y - 200 - 24 },

    // 飛び石エリア（リスクのあるコイン）
    { x: 1870, y: GROUND_Y - 120 },
    { x: 1980, y: GROUND_Y - 190 },

    // 終盤
    { x: 2720, y: GROUND_Y - 120 - 24 },
  ],

  enemies: [
    // 序盤：地上の敵（左向き）
    { x: 500,  y: GROUND_Y - ENEMY_HEIGHT, direction: -1 },

    // 中盤：中段の足場の上（左向き）
    { x: 1050, y: GROUND_Y - 120 - ENEMY_HEIGHT, direction: -1 },

    // 終盤：終盤地上（左向き）
    { x: 2200, y: GROUND_Y - ENEMY_HEIGHT, direction: -1 },

    // 終盤足場の上（右向き）
    { x: 2750, y: GROUND_Y - 120 - ENEMY_HEIGHT, direction: 1 },
  ],

  goal: {
    x: STAGE_WIDTH - 100,
    y: GROUND_Y - GOAL_HEIGHT,
    width: GOAL_WIDTH,
    height: GOAL_HEIGHT,
  },
};

// ================================================================
// ゲームオブジェクトの型（ランタイム状態付き）
// ================================================================

export interface Coin {
  x: number;
  y: number;
  width: number;
  height: number;
  isCollected: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  isAlive: boolean;
}

export interface Goal {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameObjects {
  platforms: Platform[];
  coins: Coin[];
  enemies: Enemy[];
  goal: Goal;
  spawnX: number;
  spawnY: number;
  width: number;
}

/**
 * ステージデータからランタイム用のゲームオブジェクトを生成する。
 * - コインは isCollected=false で初期化
 * - 敵は isAlive=true、方向に応じた vx で初期化
 * 各呼び出しで新しいオブジェクトが返されるため、リスタート時に安全に使用できる。
 */
export function createGameObjects(stage: StageData = STAGE_1): GameObjects {
  const platforms: Platform[] = stage.platforms.map((p) => ({ ...p }));

  const coins: Coin[] = stage.coins.map((c) => ({
    x: c.x,
    y: c.y,
    width: COIN_WIDTH,
    height: COIN_HEIGHT,
    isCollected: false,
  }));

  const enemies: Enemy[] = stage.enemies.map((e) => ({
    x: e.x,
    y: e.y,
    width: ENEMY_WIDTH,
    height: ENEMY_HEIGHT,
    vx: ENEMY_SPEED * e.direction,
    isAlive: true,
  }));

  const goal: Goal = { ...stage.goal };

  return {
    platforms,
    coins,
    enemies,
    goal,
    spawnX: stage.spawnX,
    spawnY: stage.spawnY,
    width: stage.width,
  };
}

/**
 * デフォルトステージ (STAGE_1) からゲームオブジェクトを生成するショートカット。
 * `createGameObjects(STAGE_1)` と同等。
 */
export function createStage(): GameObjects {
  return createGameObjects(STAGE_1);
}
