// ゲーム定数

// 画面サイズ (px)
export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 600;

// プレイヤー移動速度 (px/frame) - 要件 1.1, 1.2
export const PLAYER_SPEED = 5;

// ジャンプ初速度 (px/frame) - 要件 1.3 (Y 軸下向き正なので負)
export const JUMP_VELOCITY = -15;

// 重力加速度 (px/frame²) - 要件 1.4
export const GRAVITY = 1;

// 敵移動速度 (px/frame) - 要件 3.1
export const ENEMY_SPEED = 2;

// プレイヤーサイズ (px)
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 32;

// 無敵フレーム数 (2秒 × 60fps) - 要件 3.6
export const INVINCIBLE_FRAMES = 120;

// 敵サイズ (px)
export const ENEMY_WIDTH = 32;
export const ENEMY_HEIGHT = 32;

// コインサイズ (px)
export const COIN_WIDTH = 16;
export const COIN_HEIGHT = 16;

// ゴールサイズ (px)
export const GOAL_WIDTH = 32;
export const GOAL_HEIGHT = 64;

// 初期ライフ数 - 要件 2.5, 2.6
export const INITIAL_LIVES = 3;

// スコア加算値
export const SCORE_ENEMY_STOMP = 100; // 敵踏みつけ - 要件 3.3
export const SCORE_COIN = 50;          // コイン取得 - 要件 4.1

// 踏みつけ判定閾値: Player 下端が Enemy 上端から何 px 以内で踏みつけ扱いか - 要件 3.3
export const STOMP_THRESHOLD = 8;
