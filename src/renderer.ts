// Renderer: Canvas 2D API を使用して全ゲームオブジェクトを描画する
// Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 8.2

import type { GameState } from './types.ts';
import type { Camera } from './camera.ts';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants.ts';

// ゲームオブジェクトの描画色
const COLOR_PLATFORM = '#8B4513'; // ブラウン
const COLOR_PLAYER = '#FF0000';   // 赤
const COLOR_PLAYER_INVINCIBLE = '#FF8800'; // オレンジ（無敵中）
const COLOR_ENEMY = '#006400';    // ダークグリーン
const COLOR_COIN = '#FFD700';     // ゴールド
const COLOR_GOAL_POLE = '#C0C0C0'; // シルバー（旗竿）
const COLOR_GOAL_FLAG = '#FFFFFF'; // 白（旗）
const COLOR_HUD_TEXT = '#FFFFFF'; // HUD テキスト
const COLOR_OVERLAY_BG = 'rgba(0, 0, 0, 0.6)'; // オーバーレイ背景
const COLOR_OVERLAY_TITLE = '#FFFFFF'; // オーバーレイタイトル
const COLOR_OVERLAY_SUBTITLE = '#CCCCCC'; // オーバーレイサブテキスト

// HUD フォント設定
const HUD_FONT = 'bold 16px monospace';
const OVERLAY_TITLE_FONT = 'bold 48px monospace';
const OVERLAY_SUBTITLE_FONT = '20px monospace';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context from canvas');
    }
    this.ctx = ctx;
    this.width = canvas.width || SCREEN_WIDTH;
    this.height = canvas.height || SCREEN_HEIGHT;
  }

  /**
   * ゲーム全状態を 1 フレーム描画する。
   * 処理順:
   * 1. Canvas をクリア（空背景）
   * 2. Platform を描画
   * 3. Goal を描画
   * 4. コイン（未取得のみ）を描画
   * 5. 敵（生存中のみ）を描画
   * 6. プレイヤーを描画（無敵中は色を変える）
   * 7. HUD を描画（カメラ変換なし）
   * 8. phase に応じたオーバーレイを描画
   * Requirements: 5.1, 5.2, 5.3, 8.2
   */
  render(state: GameState, camera: Camera): void {
    const { ctx } = this;

    // 1. Canvas クリア（空色の背景）
    ctx.fillStyle = '#87CEEB'; // スカイブルー
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Platform を描画
    for (const platform of state.platforms) {
      const sx = camera.worldToScreen(platform.x);
      const sy = camera.worldToScreenY(platform.y);
      // 画面外のものはスキップ（パフォーマンス最適化）
      if (sx + platform.width < 0 || sx > this.width) continue;
      ctx.fillStyle = COLOR_PLATFORM;
      ctx.fillRect(sx, sy, platform.width, platform.height);
      // プラットフォームの上面に少し明るい線を追加して立体感を出す
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(sx, sy, platform.width, 3);
    }

    // 3. Goal を描画（旗竿 + 旗）
    {
      const goal = state.goal;
      const sx = camera.worldToScreen(goal.x);
      const sy = camera.worldToScreenY(goal.y);
      if (sx + goal.width >= 0 && sx <= this.width) {
        // 旗竿（細い矩形）
        const poleX = sx + goal.width / 2 - 2;
        ctx.fillStyle = COLOR_GOAL_POLE;
        ctx.fillRect(poleX, sy, 4, goal.height);
        // 旗（竿の上部に三角形っぽく描画）
        ctx.fillStyle = COLOR_GOAL_FLAG;
        ctx.beginPath();
        ctx.moveTo(poleX + 4, sy);
        ctx.lineTo(poleX + 4 + 24, sy + 12);
        ctx.lineTo(poleX + 4, sy + 24);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 4. コイン（未取得のみ）を描画
    for (const coin of state.coins) {
      if (coin.isCollected) continue;
      const sx = camera.worldToScreen(coin.x);
      const sy = camera.worldToScreenY(coin.y);
      if (sx + coin.width < 0 || sx > this.width) continue;
      ctx.fillStyle = COLOR_COIN;
      // コインは円形で描画
      const cx = sx + coin.width / 2;
      const cy = sy + coin.height / 2;
      const r = Math.min(coin.width, coin.height) / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // コインの内側の模様（小さなリング）
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 5. 敵（生存中のみ）を描画
    for (const enemy of state.enemies) {
      if (!enemy.isAlive) continue;
      const sx = camera.worldToScreen(enemy.x);
      const sy = camera.worldToScreenY(enemy.y);
      if (sx + enemy.width < 0 || sx > this.width) continue;
      ctx.fillStyle = COLOR_ENEMY;
      ctx.fillRect(sx, sy, enemy.width, enemy.height);
      // 敵の目（方向によって位置を変える）
      const eyeY = sy + enemy.height * 0.3;
      const eyeR = 3;
      ctx.fillStyle = '#FF0000';
      if (enemy.vx < 0) {
        // 左向き: 左側に目
        ctx.beginPath();
        ctx.arc(sx + enemy.width * 0.3, eyeY, eyeR, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 右向き: 右側に目
        ctx.beginPath();
        ctx.arc(sx + enemy.width * 0.7, eyeY, eyeR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 6. プレイヤーを描画（無敵中はオレンジ、通常は赤）
    {
      const player = state.player;
      const sx = camera.worldToScreen(player.x);
      const sy = camera.worldToScreenY(player.y);
      // 無敵中は点滅効果（frameCount の偶数/奇数で描画/非描画）
      const shouldBlink = player.isInvincible && state.frameCount % 6 < 3;
      if (!shouldBlink) {
        ctx.fillStyle = player.isInvincible ? COLOR_PLAYER_INVINCIBLE : COLOR_PLAYER;
        ctx.fillRect(sx, sy, player.width, player.height);
        // プレイヤーの顔パーツ（簡易）
        // 目
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(sx + player.width * 0.25, sy + player.height * 0.25, 6, 6);
        ctx.fillRect(sx + player.width * 0.55, sy + player.height * 0.25, 6, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(sx + player.width * 0.3, sy + player.height * 0.3, 3, 3);
        ctx.fillRect(sx + player.width * 0.6, sy + player.height * 0.3, 3, 3);
      }
    }

    // 7. HUD を描画（カメラ変換なし）
    this.drawHUD(state.score, state.lives);

    // 8. フェーズに応じたオーバーレイ
    if (state.phase === 'gameover') {
      this.drawGameOver();
    } else if (state.phase === 'stageclear') {
      this.drawStageClear();
    }
  }

  /**
   * スコアと残機を画面上部に固定表示する（カメラ変換なし）。
   * Score: 左上 (x=10, y=25)
   * Lives: 右上
   * Requirements: 5.1
   */
  drawHUD(score: number, lives: number): void {
    const { ctx } = this;
    ctx.font = HUD_FONT;
    ctx.fillStyle = COLOR_HUD_TEXT;
    // スコアは影を付けて読みやすくする
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;

    // Score（左上）
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 10, 25);

    // Lives（右上）
    const livesText = `LIVES: ${lives}`;
    ctx.textAlign = 'right';
    ctx.fillText(livesText, this.width - 10, 25);

    // シャドウをリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
  }

  /**
   * ゲームオーバーオーバーレイを描画する。
   * 半透明の黒背景 + "GAME OVER" + "Press R to restart"
   * Requirements: 6.2
   */
  drawGameOver(): void {
    const { ctx } = this;
    const cx = this.width / 2;
    const cy = this.height / 2;

    // 半透明の黒背景
    ctx.fillStyle = COLOR_OVERLAY_BG;
    ctx.fillRect(0, 0, this.width, this.height);

    // タイトル: "GAME OVER"
    ctx.font = OVERLAY_TITLE_FONT;
    ctx.fillStyle = COLOR_OVERLAY_TITLE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 8;
    ctx.fillText('GAME OVER', cx, cy - 30);

    // サブテキスト
    ctx.font = OVERLAY_SUBTITLE_FONT;
    ctx.fillStyle = COLOR_OVERLAY_SUBTITLE;
    ctx.shadowBlur = 4;
    ctx.fillText('Press R to restart', cx, cy + 30);

    // リセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
  }

  /**
   * ステージクリアオーバーレイを描画する。
   * 半透明の黒背景 + "STAGE CLEAR!" + "Press R to restart"
   * Requirements: 6.1
   */
  drawStageClear(): void {
    const { ctx } = this;
    const cx = this.width / 2;
    const cy = this.height / 2;

    // 半透明の黒背景
    ctx.fillStyle = COLOR_OVERLAY_BG;
    ctx.fillRect(0, 0, this.width, this.height);

    // タイトル: "STAGE CLEAR!"
    ctx.font = OVERLAY_TITLE_FONT;
    ctx.fillStyle = '#FFD700'; // ゴールド色でステージクリアを強調
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 8;
    ctx.fillText('STAGE CLEAR!', cx, cy - 30);

    // サブテキスト
    ctx.font = OVERLAY_SUBTITLE_FONT;
    ctx.fillStyle = COLOR_OVERLAY_SUBTITLE;
    ctx.shadowBlur = 4;
    ctx.fillText('Press R to restart', cx, cy + 30);

    // リセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
  }
}
