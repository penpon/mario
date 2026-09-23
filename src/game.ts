// GameManager: ゲームループ管理・状態遷移
// Tasks 10.1, 10.2 — GameManager クラスと GameState、ゲームループの実装
// Requirements: 8.1, 6.3, 6.4, 8.2, 8.3

import { Player } from './player.ts';
import { Enemy } from './enemy.ts';
import { Camera } from './camera.ts';
import { Renderer } from './renderer.ts';
import { InputHandler } from './input.ts';
import {
  applyGravity,
  overlaps,
  resolvePlayerPlatformCollision,
  resolveEnemyPlatformCollision,
} from './physics.ts';
import { createStage } from './stage.ts';
import type { RuntimeCoin, RuntimePlatform, RuntimeGoal, StageData } from './types.ts';
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  INITIAL_LIVES,
  SCORE_COIN,
  SCORE_ENEMY_STOMP,
  STOMP_THRESHOLD,
} from './constants.ts';

export type GamePhase = 'playing' | 'gameover' | 'stageclear';

/**
 * ランタイムゲーム状態。
 * player は Player クラスインスタンス（applyInput / respawn メソッドが必要）。
 * enemies は Enemy クラスインスタンス（update メソッドが必要）。
 */
export interface GameState {
  phase: GamePhase;
  score: number;
  lives: number;
  player: Player;
  enemies: Enemy[];
  platforms: RuntimePlatform[];
  coins: RuntimeCoin[];
  goal: RuntimeGoal;
  stage: StageData;
  frameCount: number;
}

export class GameManager {
  private animationId: number | null = null;
  private state: GameState;
  private camera: Camera;
  private renderer: Renderer;
  private input: InputHandler;

  constructor(canvas: HTMLCanvasElement) {
    this.camera = new Camera();
    this.renderer = new Renderer(canvas);
    this.input = new InputHandler();
    this.state = this._buildInitialState();
  }

  /**
   * ゲームループを開始する（requestAnimationFrame）。
   * Requirements: 8.1
   */
  start(): void {
    if (this.animationId !== null) return; // 二重起動を防ぐ
    this._tick();
  }

  /**
   * ゲームループを停止する。
   * Requirements: 8.1
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * ゲーム状態を初期値（score=0, lives=3）に完全リセットしてループを再開する。
   * Requirements: 6.3, 6.4
   */
  restart(): void {
    this.stop();
    this.state = this._buildInitialState();
    this.camera = new Camera();
    this.start();
  }

  /**
   * 初期 GameState を構築して返す。
   * createStage() でステージオブジェクトを生成し、
   * Player / Enemy クラスインスタンスを設定する。
   */
  private _buildInitialState(): GameState {
    const objects = createStage();

    const player = new Player(objects.spawnX, objects.spawnY);

    const enemies: Enemy[] = objects.enemies.map((e) => {
      const direction: 1 | -1 = e.vx > 0 ? 1 : -1;
      return new Enemy(e.x, e.y, direction);
    });

    // RuntimeCoin / RuntimePlatform / RuntimeGoal はプレーンオブジェクト
    const coins: RuntimeCoin[] = objects.coins.map((c) => ({ ...c }));
    const platforms: RuntimePlatform[] = objects.platforms.map((p) => ({ ...p }));
    const goal: RuntimeGoal = { ...objects.goal };

    // StageData（スポーン座標・幅など）を組み立てる
    const stage: StageData = {
      width: objects.width,
      spawnX: objects.spawnX,
      spawnY: objects.spawnY,
      platforms: objects.platforms.map((p) => ({ ...p })),
      coins: [], // ランタイムではコインは coins 配列で管理するため不要
      enemies: [], // 同上
      goal: { ...objects.goal },
    };

    return {
      phase: 'playing',
      score: 0,
      lives: INITIAL_LIVES,
      player,
      enemies,
      platforms,
      coins,
      goal,
      stage,
      frameCount: 0,
    };
  }

  /**
   * 1 フレーム分の処理を実行し、phase が 'playing' の間だけ次フレームを予約する。
   * Requirements: 8.1, 8.2, 8.3
   */
  private _tick(): void {
    this._update();

    if (this.state.phase === 'playing') {
      this.animationId = requestAnimationFrame(() => this._tick());
    } else {
      // gameover / stageclear フェーズ: ループを停止するが最後の描画は実施済み
      this.animationId = null;
    }
  }

  /**
   * 各フレームの更新処理。
   * 順序:
   *   1. 入力取得
   *   2. プレイヤー入力適用
   *   3. 物理演算（重力・移動・衝突解決）
   *   4. ゲームイベント検知（Task 10.3 で実装）
   *   5. ステージ端クランプ（要件 1.7）
   *   6. カメラ更新
   *   7. 描画
   *   8. 無敵タイマー処理
   *   9. フレームカウンタ更新
   */
  private _update(): void {
    const { state, camera, renderer, input } = this;
    const { player, enemies, platforms, stage } = state;

    // ── 1. 入力取得 ────────────────────────────────────────────────
    const keyState = input.getState();

    // ── 2. プレイヤー入力適用 ──────────────────────────────────────
    player.applyInput(keyState);

    // ── 3. 物理演算 ────────────────────────────────────────────────

    // isOnGround をリセット（衝突解決で再設定される）
    player.isOnGround = false;
    for (const enemy of enemies) {
      if (enemy.isAlive) enemy.isOnGround = false;
    }

    // プレイヤーに重力を適用して位置を更新
    applyGravity(player);
    player.x += player.vx;
    player.y += player.vy;

    // 敵に重力を適用して位置を更新
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      applyGravity(enemy);
      enemy.x += enemy.vx;
      enemy.y += enemy.vy;
    }

    // プレイヤーとプラットフォームの衝突解決
    resolvePlayerPlatformCollision(player, platforms);

    // 敵とプラットフォームの衝突解決
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      resolveEnemyPlatformCollision(enemy, platforms, SCREEN_HEIGHT);
    }

    // ── 4. ゲームイベント検知（Task 10.3 で実装） ──────────────────
    this._checkGameEvents();

    // ── 5. ステージ端クランプ（要件 1.7） ─────────────────────────
    player.x = Math.max(0, Math.min(player.x, stage.width - player.width));

    // ── 6. カメラ更新 ───────────────────────────────────────────────
    camera.update(player.x, stage.width, SCREEN_WIDTH);

    // ── 7. 描画 ────────────────────────────────────────────────────
    // Player クラスは GameState['player'] の構造的型（同一フィールド）を満たしているため
    // as-cast で Renderer.render に渡す。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderer.render(state as any, camera);

    // ── 8. 無敵タイマー処理 ────────────────────────────────────────
    if (player.invincibleTimer > 0) {
      player.invincibleTimer--;
      if (player.invincibleTimer === 0) {
        player.isInvincible = false;
      }
    }

    // ── 9. フレームカウンタ更新 ─────────────────────────────────────
    state.frameCount++;

    // ── リスタートキー（gameover / stageclear 中のみ有効）──────────
    // phase が変わった後にキーを拾う（次フレームはないので_tick内で処理）
    if (state.phase !== 'playing' && keyState.restart) {
      this.restart();
    }
  }

  /**
   * ゲームイベント検知ロジック。
   * 優先順位:
   *   1. ゴール接触 → ステージクリア（要件 6.1）
   *   2. コイン取得（要件 4.1, 4.2）
   *   3. 敵との衝突（踏みつけ or ダメージ）（要件 3.3, 3.4, 3.5, 3.6）
   *   4. プレイヤー落下（要件 2.5, 2.6）
   * Requirements: 2.5, 2.6, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 6.1, 6.2
   */
  private _checkGameEvents(): void {
    const { state } = this;
    const { player, enemies, coins, goal, stage } = state;

    // ── 1. ゴール接触（最優先 - 要件 6.1）─────────────────────────
    if (state.phase === 'playing' && overlaps(player, goal)) {
      state.phase = 'stageclear';
      return; // 他のイベントは評価しない
    }

    // ── 2. コイン取得（要件 4.1, 4.2）─────────────────────────────
    for (const coin of coins) {
      if (coin.isCollected) continue;
      if (overlaps(player, coin)) {
        coin.isCollected = true;
        state.score += SCORE_COIN;
      }
    }

    // ── 3. 敵との衝突（要件 3.3, 3.4, 3.5, 3.6）───────────────────
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      if (!overlaps(player, enemy)) continue;

      const playerBottom = player.y + player.height;
      const enemyTop = enemy.y;

      // 踏みつけ判定: Player 下端が Enemy 上端から STOMP_THRESHOLD 以内 かつ vy > 0
      if (
        playerBottom >= enemyTop &&
        playerBottom <= enemyTop + STOMP_THRESHOLD &&
        player.vy > 0
      ) {
        // 踏みつけ成功（要件 3.3）
        enemy.isAlive = false;
        state.score += SCORE_ENEMY_STOMP;
        player.vy = -8; // 踏みつけ後の小バウンス
      } else if (!player.isInvincible) {
        // 側面・下面衝突（無敵でない場合）- 要件 3.4, 3.5
        state.lives -= 1;
        if (state.lives <= 0) {
          state.phase = 'gameover'; // 要件 6.2
        } else {
          player.respawn(stage.spawnX, stage.spawnY); // 要件 3.4, 3.6
        }
      }
    }

    // ── 4. プレイヤー落下（要件 2.5, 2.6）────────────────────────
    if (state.phase === 'playing' && player.y > SCREEN_HEIGHT + 1) {
      state.lives -= 1;
      if (state.lives <= 0) {
        state.phase = 'gameover'; // 要件 2.6
      } else {
        player.respawn(stage.spawnX, stage.spawnY); // 要件 2.5
      }
    }
  }

  /**
   * InputHandler のリソースを解放する。
   * ゲームを破棄する際に呼ぶ。
   */
  destroy(): void {
    this.stop();
    this.input.destroy();
  }
}
