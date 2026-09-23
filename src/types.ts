// 共通型定義

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface KeyState {
  left: boolean;    // ArrowLeft または A
  right: boolean;   // ArrowRight または D
  jump: boolean;    // Space または ArrowUp
  restart: boolean; // R
}

export type GamePhase = 'playing' | 'gameover' | 'stageclear';

export interface PlatformDef {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CoinDef {
  x: number;
  y: number;
}

export interface EnemyDef {
  x: number;
  y: number;
  direction: 1 | -1; // 1: 右向き, -1: 左向き
}

export interface GoalDef {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StageData {
  width: number;       // ステージ総幅 (px)
  spawnX: number;      // プレイヤー初期 X 座標
  spawnY: number;      // プレイヤー初期 Y 座標
  platforms: PlatformDef[];
  coins: CoinDef[];
  enemies: EnemyDef[];
  goal: GoalDef;
}

// ランタイム用ゲームオブジェクト（状態付き）
export interface RuntimeCoin extends GameObject {
  isCollected: boolean;
}

export interface RuntimeEnemy extends GameObject {
  vx: number;
  isAlive: boolean;
}

export interface RuntimePlatform extends GameObject {}

export interface RuntimeGoal extends GameObject {}

// ゲーム全状態
export interface GameState {
  phase: GamePhase;
  score: number;
  lives: number;           // 残機数（0〜3）
  player: {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    isOnGround: boolean;
    isInvincible: boolean;
    invincibleTimer: number;
  };
  enemies: RuntimeEnemy[];
  platforms: RuntimePlatform[];
  coins: RuntimeCoin[];
  goal: RuntimeGoal;
  stage: StageData;
  frameCount: number;
}
