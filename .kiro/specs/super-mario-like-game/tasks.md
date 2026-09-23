# Implementation Plan: Super Mario-Like 2D Platformer

## Overview

TypeScript + HTML5 Canvas + Vite によるバニラ実装。外部ゲームエンジンを使用せず、独立したコンポーネント（Player, PhysicsEngine, Camera, Renderer 等）を段階的に構築し、最後にゲームループへ統合する。テストは Vitest + fast-check を使用し、純粋ロジックを対象にプロパティベーステストとユニットテストの両方を実施する。

## Tasks

- [x] 1. プロジェクト構成・共通型定義・定数の整備
  - [x] 1.1 Vite + TypeScript プロジェクトの初期化と `index.html` の作成
    - `npm create vite` で TypeScript テンプレートを生成する
    - `index.html` に `<canvas id="game-canvas">` 要素を追加する
    - `src/` ディレクトリ構成（`main.ts`, `types.ts`, `constants.ts` 等）を作成する
    - _Requirements: 8.1_
  - [x] 1.2 Vitest + fast-check のセットアップ
    - `vitest` と `fast-check` をインストールし `vite.config.ts` にテスト設定を追加する
    - `tests/` ディレクトリを作成し、`vitest.config.ts` でテスト対象パスを設定する
    - _Requirements: テスト基盤_
  - [x] 1.3 共通型定義（`src/types.ts`）の実装
    - `GameObject`, `AABB`, `KeyState`, `GamePhase`, `GameState` インターフェースを定義する
    - `PlatformDef`, `CoinDef`, `EnemyDef`, `GoalDef`, `StageData` インターフェースを定義する
    - _Requirements: 全要件の基盤_
  - [x] 1.4 ゲーム定数（`src/constants.ts`）の実装
    - `PLAYER_SPEED = 5`, `JUMP_VELOCITY = -15`, `GRAVITY = 1`, `ENEMY_SPEED = 2` を定義する
    - `PLAYER_WIDTH = 32`, `PLAYER_HEIGHT = 32`, `INVINCIBLE_FRAMES = 120` を定義する
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1_

- [x] 2. InputHandler の実装
  - [x] 2.1 `src/input.ts` に `InputHandler` クラスを実装する
    - `keydown` / `keyup` イベントをリッスンし `KeyState`（left / right / jump / restart）を更新する
    - ArrowLeft・A キー → `left`、ArrowRight・D キー → `right`、Space・ArrowUp → `jump`、R → `restart` をマッピングする
    - `getState(): KeyState` と `destroy(): void` を実装する
    - _Requirements: 1.1, 1.2, 1.3, 6.3, 6.4_
  - [ ]* 2.2 InputHandler のユニットテストを作成する
    - 各キーマッピングが `KeyState` に正しく反映されることを確認する
    - `destroy()` 呼び出し後にイベントが無視されることを確認する
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Player の実装
  - [x] 3.1 `src/player.ts` に `Player` クラスを実装する
    - `x, y, vx, vy, isOnGround, isInvincible, invincibleTimer` フィールドを実装する
    - `applyInput(keyState: KeyState): void` を実装する
      - 左右キーで `vx = ±PLAYER_SPEED`、キー離しで `vx = 0`
      - `isOnGround` が `true` かつジャンプキーで `vy = JUMP_VELOCITY`（二段ジャンプ禁止）
    - `respawn(spawnX, spawnY): void` を実装し、座標・速度・無敵タイマーをリセットする
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 2.5, 3.4, 3.6_
  - [ ]* 3.2 Property 1（水平移動の速度不変性）のプロパティテストを作成する
    - **Property 1: 水平移動の速度不変性**
    - **Validates: Requirements 1.1, 1.2, 1.6**
    - `// Feature: super-mario-like-game, Property 1: 水平移動の速度不変性`
    - ランダムな KeyState（left / right / none）を生成し `applyInput` 後の `vx` を検証する
  - [ ]* 3.3 Property 2（ジャンプ速度と二段ジャンプ禁止）のプロパティテストを作成する
    - **Property 2: ジャンプ速度と二段ジャンプ禁止**
    - **Validates: Requirements 1.3, 1.5**
    - `// Feature: super-mario-like-game, Property 2: ジャンプ速度と二段ジャンプ禁止`
    - 地上 / 空中状態のプレイヤー × ジャンプ入力で `vy` の変化を検証する

- [x] 4. PhysicsEngine の実装
  - [x] 4.1 `src/physics.ts` に `overlaps` と `getOverlap` ヘルパー関数を実装する
    - AABB どうしの重なり検出と `overlapX / overlapY` 量の計算を実装する
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 4.2 `applyGravity` を実装する
    - 空中にいるエンティティに対して毎フレーム `vy += GRAVITY` を適用する
    - `isOnGround` が `false` の場合のみ適用する
    - _Requirements: 1.4_
  - [ ]* 4.3 Property 3（重力による速度の単調増加）のプロパティテストを作成する
    - **Property 3: 重力による速度の単調増加**
    - **Validates: Requirements 1.4**
    - `// Feature: super-mario-like-game, Property 3: 重力による速度の単調増加`
    - ランダムな初期 `vy` × フレーム数 N で `vy` が `初期値 + N × GRAVITY` になることを検証する
  - [x] 4.4 `resolvePlayerPlatformCollision` を実装する
    - 上面衝突（`vy > 0`）: `vy = 0`、`isOnGround = true`、プレイヤー下端を Platform 上面に揃える
    - 側面衝突（水平移動）: `vx = 0`
    - 天井衝突（`vy < 0`）: `vy = 0`
    - 上面 vs 側面の同時衝突は上面を優先する（要件 2.4）
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 4.5 Property 5（プラットフォーム衝突解決の正確性）のプロパティテストを作成する
    - **Property 5: プラットフォーム衝突解決の正確性**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - `// Feature: super-mario-like-game, Property 5: プラットフォーム衝突解決の正確性`
    - ランダムな速度 × プラットフォーム位置で衝突後の速度・座標を検証する
  - [ ]* 4.6 Property 6（上面衝突と側面衝突の優先順位不変性）のプロパティテストを作成する
    - **Property 6: 上面衝突と側面衝突の優先順位不変性**
    - **Validates: Requirements 2.4**
    - `// Feature: super-mario-like-game, Property 6: 上面衝突と側面衝突の優先順位不変性`
    - 上面・側面両接触の境界条件を生成し、`vx` が変化せず `vy` のみ 0 になることを検証する
  - [x] 4.7 `resolveEnemyPlatformCollision` を実装する
    - 上面衝突処理と、ステージ端・壁での方向転換ロジックを実装する
    - 敵がステージ外（`y > canvas.height + 1`）に落ちた場合、`isAlive = false` にする
    - _Requirements: 3.1, 3.2_

- [x] 5. Checkpoint — ここまでのテストがすべてパスすることを確認する
  - 全テストがパスすることを確認し、疑問があればユーザーに確認する。

- [x] 6. Enemy の実装
  - [x] 6.1 `src/enemy.ts` に `Enemy` クラスを実装する
    - `x, y, vx, isAlive` フィールドと初期速度（`ENEMY_SPEED` または `-ENEMY_SPEED`）を実装する
    - `update(platforms: Platform[]): void` を実装し、移動・衝突による方向転換を処理する
    - _Requirements: 3.1, 3.2_
  - [ ]* 6.2 Property 7（敵の速度不変と方向転換）のプロパティテストを作成する
    - **Property 7: 敵の速度不変と方向転換**
    - **Validates: Requirements 3.1, 3.2**
    - `// Feature: super-mario-like-game, Property 7: 敵の速度不変と方向転換`
    - ランダムな Enemy 状態 × Platform 端条件で `|vx| === ENEMY_SPEED` を常に検証する

- [x] 7. Camera の実装
  - [x] 7.1 `src/camera.ts` に `Camera` クラスを実装する
    - `offsetX` フィールドを実装する
    - `update(playerX, stageWidth, screenWidth)`: プレイヤーが画面中央を超えたら追従し、ステージ端でクランプする
    - `worldToScreen(worldX): number` を実装する（`worldX - offsetX`）
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ]* 7.2 Property 4（ステージ水平端クランプ）のプロパティテストを作成する
    - **Property 4: ステージ水平端クランプ（プレイヤー座標）**
    - **Validates: Requirements 1.7**
    - `// Feature: super-mario-like-game, Property 4: ステージ水平端クランプ`
    - ランダムなプレイヤー X 座標 × ステージ幅で、座標が `[0, stageWidth - playerWidth]` に収まることを検証する
  - [ ]* 7.3 Property 12（カメラのステージ端クランプ）のプロパティテストを作成する
    - **Property 12: カメラのステージ端クランプ**
    - **Validates: Requirements 7.2, 7.3**
    - `// Feature: super-mario-like-game, Property 12: カメラのステージ端クランプ`
    - ランダムなプレイヤー X 座標 × ステージ幅で `offsetX` が `[0, stageWidth - screenWidth]` に収まることを検証する

- [x] 8. Stage データの実装
  - [x] 8.1 `src/stage.ts` に `StageData` の定義とサンプルステージを実装する
    - プラットフォーム（地面・ブロック）、コイン、敵、ゴール、スポーン座標を配置する
    - ステージ幅は画面幅の3〜4倍程度とし、適切な難易度を持つレイアウトにする
    - _Requirements: 全体_

- [x] 9. Renderer の実装
  - [x] 9.1 `src/renderer.ts` に `Renderer` クラスを実装する
    - `render(state: GameState, camera: Camera): void` を実装し、各フレームで Canvas をクリアして全オブジェクトを描画する
    - Camera の `worldToScreen` でワールド座標→スクリーン座標変換を行い、Platform / Player / Enemy / Coin / Goal を描画する
    - 取得済みコイン（`isCollected === true`）と死亡敵（`isAlive === false`）は描画しない
    - `drawHUD(score, lives)`: Score を左上、Lives を右上に固定位置で描画する（カメラ変換なし）
    - `drawGameOver()` と `drawStageClear()` のオーバーレイ画面を実装する
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 8.2_

- [x] 10. GameManager とゲームループの実装
  - [x] 10.1 `src/game.ts` に `GameManager` クラスと `GameState` を実装する
    - `start()`: `requestAnimationFrame` でゲームループを開始する
    - `stop()`: ループを停止する
    - `restart()`: `score = 0`, `lives = 3` でゲーム状態を完全リセットし `start()` を呼ぶ
    - _Requirements: 8.1, 6.3, 6.4_
  - [x] 10.2 ゲームループの各フレーム処理を実装する
    - `InputHandler.getState()` → `player.applyInput()` → `PhysicsEngine.update()` → ゲームイベント検知 → `Camera.update()` → `Renderer.render()` の順で実行する
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 10.3 ゲームイベント検知ロジックを実装する
    - プレイヤーとコインの衝突: `isCollected = true`、Score + 50
    - プレイヤーと敵の踏みつけ判定（下端が Enemy 上部 8px 以内 かつ `vy > 0`）: `isAlive = false`、Score + 100
    - プレイヤーと敵の側面・下面衝突（無敵でない場合）: Lives - 1、リスポーン or ゲームオーバー
    - プレイヤーとゴールの衝突: ステージクリア
    - プレイヤーの落下（`y > canvas.height + 1`）: Lives - 1、リスポーン or ゲームオーバー
    - イベント優先順位: ゴール接触 → Lives 0 チェックの順で評価する
    - 無敵タイマーのカウントダウンと解除を毎フレーム処理する
    - _Requirements: 2.5, 2.6, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 6.1, 6.2_
  - [ ]* 10.4 Property 8（スコアの正確な加算）のプロパティテストを作成する
    - **Property 8: スコアの正確な加算**
    - **Validates: Requirements 3.3, 4.1**
    - `// Feature: super-mario-like-game, Property 8: スコアの正確な加算`
    - ランダムなイベント列（敵踏みつけ × N 回、コイン取得 × M 回）でスコアが `100N + 50M` になることを検証する
  - [ ]* 10.5 Property 9（コインの取得と非再出現）のプロパティテストを作成する
    - **Property 9: コインの取得と非再出現**
    - **Validates: Requirements 4.1, 4.2**
    - `// Feature: super-mario-like-game, Property 9: コインの取得と非再出現`
    - `isCollected = true` になったコインが再度 `false` に戻らないことをランダムな操作列で検証する
  - [ ]* 10.6 Property 10（残機減少後のリスポーン座標）のプロパティテストを作成する
    - **Property 10: 残機減少後のリスポーン座標**
    - **Validates: Requirements 2.5, 3.4**
    - `// Feature: super-mario-like-game, Property 10: 残機減少後のリスポーン座標`
    - ランダムな残機数（≥1）× ダメージイベントで、リスポーン後の座標が `(spawnX, spawnY)` に一致することを検証する
  - [ ]* 10.7 Property 11（無敵状態中の敵衝突無効化）のプロパティテストを作成する
    - **Property 11: 無敵状態中の敵衝突無効化**
    - **Validates: Requirements 3.6**
    - `// Feature: super-mario-like-game, Property 11: 無敵状態中の敵衝突無効化`
    - ランダムな無敵残フレーム数 × 敵座標で、衝突してもライフが減少しないことを検証する
  - [ ]* 10.8 Property 13（リスタート後の状態完全リセット）のプロパティテストを作成する
    - **Property 13: リスタート後の状態完全リセット**
    - **Validates: Requirements 6.3, 6.4**
    - `// Feature: super-mario-like-game, Property 13: リスタート後の状態完全リセット`
    - ランダムなゲーム終了状態から `restart()` 後に `score === 0`、`lives === 3`、全コイン `isCollected === false`、全敵 `isAlive === true` を検証する
  - [ ]* 10.9 GameManager のユニットテストを作成する
    - ゴール接触と Lives 0 が同フレームで発生した場合にステージクリアが優先されることを確認する
    - _Requirements: 6.1_

- [x] 11. エントリポイントの実装とすべてのコンポーネントの統合
  - [x] 11.1 `src/main.ts` にエントリポイントを実装する
    - Canvas 要素を取得し `GameManager` を生成して `start()` を呼ぶ
    - 「R」キーのリスタート処理を `InputHandler` 経由で `GameManager.restart()` に接続する
    - _Requirements: 6.3, 6.4, 8.1_

- [x] 12. Final Checkpoint — すべてのテストがパスすることを確認する
  - 全テストを実行し（`vitest --run`）、すべてパスすることを確認する。疑問があればユーザーに確認する。

## Notes

- `*` 付きサブタスクはオプション。MVP を優先する場合はスキップ可
- 各タスクは前のタスクの成果物に依存する増分ビルドになっている
- プロパティテストは最低 100 イテレーションを実行すること（fast-check のデフォルトは 100）
- Canvas 描画・キーボード応答・60fps 体感は手動ブラウザテストで確認すること
- `vitest --run` で単発実行（ウォッチモードを使わない）

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "4.2"] },
    { "id": 2, "tasks": ["2.2", "3.2", "3.3", "4.3", "4.4", "8.1"] },
    { "id": 3, "tasks": ["4.5", "4.6", "4.7", "6.1", "7.1"] },
    { "id": 4, "tasks": ["6.2", "7.2", "7.3", "9.1"] },
    { "id": 5, "tasks": ["10.1", "10.2"] },
    { "id": 6, "tasks": ["10.3"] },
    { "id": 7, "tasks": ["10.4", "10.5", "10.6", "10.7", "10.8", "10.9", "11.1"] }
  ]
}
```
