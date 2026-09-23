// Camera: スクロール表示制御
// Requirements: 7.1, 7.2, 7.3

export class Camera {
  offsetX: number = 0;

  /**
   * カメラのオフセットを更新する。
   *
   * - プレイヤーの X 座標が画面幅の 50% を超えたらプレイヤーを中央に維持するように追従する。
   * - offsetX は [0, stageWidth - screenWidth] にクランプする。
   *
   * Requirements: 7.1, 7.2, 7.3
   */
  update(playerX: number, stageWidth: number, screenWidth: number): void {
    // プレイヤーを画面中央に収めるターゲットオフセット
    const target = playerX - screenWidth / 2;
    // ステージ端でクランプ（左端: 0、右端: stageWidth - screenWidth）
    const maxOffset = Math.max(0, stageWidth - screenWidth);
    this.offsetX = Math.max(0, Math.min(target, maxOffset));
  }

  /**
   * ワールド座標 X をスクリーン座標 X に変換する。
   */
  worldToScreen(worldX: number): number {
    return worldX - this.offsetX;
  }

  /**
   * ワールド座標 Y をスクリーン座標 Y に変換する。
   * 垂直スクロールはないため、そのまま返す。
   */
  worldToScreenY(worldY: number): number {
    return worldY;
  }
}
