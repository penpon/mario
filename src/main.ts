// エントリポイント: Canvas 要素を取得し GameManager を生成して start() を呼ぶ
// Requirements: 6.3, 6.4, 8.1

import { GameManager } from './game.ts';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element #game-canvas not found');
}

const game = new GameManager(canvas);
game.start();
