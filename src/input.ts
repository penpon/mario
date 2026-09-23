// InputHandler: キーボード入力管理
// Requirements: 1.1, 1.2, 1.3, 6.3, 6.4

import type { KeyState } from './types.ts';

export class InputHandler {
  private state: KeyState = {
    left: false,
    right: false,
    jump: false,
    restart: false,
  };

  private readonly onKeyDown: (e: KeyboardEvent) => void;
  private readonly onKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.onKeyDown = (e: KeyboardEvent) => this.handleKey(e.code, true);
    this.onKeyUp = (e: KeyboardEvent) => this.handleKey(e.code, false);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private handleKey(code: string, pressed: boolean): void {
    switch (code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.state.left = pressed;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.state.right = pressed;
        break;
      case 'Space':
      case 'ArrowUp':
        this.state.jump = pressed;
        break;
      case 'KeyR':
        this.state.restart = pressed;
        break;
    }
  }

  /** 現在のキー状態のスナップショットを返す */
  getState(): KeyState {
    return { ...this.state };
  }

  /** イベントリスナーを解除してリソースを解放する */
  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
