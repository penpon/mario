# Requirements Document

## Introduction

本仕様は、スーパーマリオブラザースにインスパイアされたシンプルな2D横スクロールプラットフォームゲームを定義する。プレイヤーキャラクターが左右に移動・ジャンプしながらコースを進み、敵を倒してゴールを目指す。1週間程度での開発を想定し、コアゲームプレイに絞ったシンプルなスコープとする。

## Glossary

- **Game**: ゲーム全体のシステム
- **Player**: プレイヤーが操作するキャラクター
- **Enemy**: プレイヤーを妨害するキャラクター（踏みつけで倒せる）
- **Platform**: プレイヤーや敵が乗れる足場（地面・ブロックを含む）
- **Coin**: プレイヤーが取得するとスコアが加算されるアイテム
- **Goal**: ステージのクリア地点（旗など）
- **Stage**: 1つのプレイ可能なコース
- **Score**: プレイヤーのゲーム内得点
- **Life**: プレイヤーの残機数（初期値: 3）
- **Renderer**: 画面描画を担当するコンポーネント
- **Physics_Engine**: 重力・衝突判定を担当するコンポーネント
- **Input_Handler**: キーボード入力を受け付けるコンポーネント
- **Camera**: スクロール表示を制御するコンポーネント

## Requirements

### Requirement 1: プレイヤーの移動操作

**User Story:** プレイヤーとして、キーボードでキャラクターを左右に移動・ジャンプさせたいので、ステージを進めることができる。

#### Acceptance Criteria

1. WHEN 左矢印キーまたは「A」キーが押された場合、THE Player SHALL 一定速度（5 px/フレーム）で左方向に移動する
2. WHEN 右矢印キーまたは「D」キーが押された場合、THE Player SHALL 一定速度（5 px/フレーム）で右方向に移動する
3. WHEN スペースキーまたは上矢印キーが押され、かつ Player が Platform 上に立っている場合、THE Player SHALL 初速度（15 px/フレーム 上方向）でジャンプする
4. WHILE Player が空中にいる場合、THE Physics_Engine SHALL 重力加速度（1 px/フレーム²）を Player の垂直速度に毎フレーム加算し、Player を下方向に引き寄せる
5. IF Player が空中にいる状態でジャンプ入力が行われた場合、THEN THE Player SHALL ジャンプ入力を無視し、現在の軌道を維持する（二段ジャンプなし）
6. WHEN 移動キーが離された場合、THE Player SHALL 次のフレーム以内に水平方向の速度を 0 px/フレーム にする
7. IF Player の移動により Player の位置が Stage の水平端に達した場合、THEN THE Player SHALL それ以上その方向への移動を停止し、端の位置に留まる

### Requirement 2: プラットフォームと衝突判定

**User Story:** プレイヤーとして、足場の上に立ったり壁に遮られたりしたいので、物理的なコースを体験できる。

#### Acceptance Criteria

1. WHEN Player の下端が Platform の上面に接触し、かつ Player が下方向に移動している場合、THE Physics_Engine SHALL Player の Y 方向速度を 0 に設定し、Player の下端を Platform の上面 Y 座標に一致させる
2. WHEN Player の左端または右端が Platform の側面に接触し、かつ Player が水平方向に移動している場合、THE Physics_Engine SHALL Player の X 方向速度を 0 に設定する
3. WHEN Player の上端が Platform の下面に接触し、かつ Player が上方向に移動している場合、THE Physics_Engine SHALL Player の Y 方向速度を 0 に設定する
4. IF 同一フレームで Player が Platform の上面と側面に同時に接触した場合、THEN THE Physics_Engine SHALL 上面との衝突判定を側面との衝突判定より優先して適用する
5. IF Player の Y 座標が画面下端 Y 座標を 1 pixel 以上超え、かつ Player の Life が 2 以上の場合、THEN THE Game SHALL Player の Life を 1 減らし、Player をステージ開始座標に再配置する
6. IF Player の Y 座標が画面下端 Y 座標を 1 pixel 以上超え、かつ Player の Life が 1 の場合、THEN THE Game SHALL Life を 0 にしてゲームオーバー処理を即座に開始し、リスポーンを行わない

### Requirement 3: 敵キャラクター

**User Story:** プレイヤーとして、敵を踏みつけて倒したいので、ゲームに挑戦性と達成感が生まれる。

#### Acceptance Criteria

1. WHILE Enemy が自律移動状態にある場合、THE Enemy SHALL 水平方向に 2 px/フレームの速度で移動する
2. WHEN Enemy が Platform の端または壁に到達した場合、THE Enemy SHALL 移動方向を反転し、反転後も同じ速度（2 px/フレーム）で移動を継続する
3. WHEN Player の下端が Enemy の上面（Enemy 上部 8 pixel 以内）に接触し、かつ Player の垂直方向速度が下向き（> 0）である場合、THE Game SHALL Enemy を消滅させ、Score に 100 点を加算する
4. WHEN Player が Enemy の側面または下面に接触した場合、THE Game SHALL Player の Life を 1 減らし、Player をステージ開始座標に再配置するリスポーン処理を開始する
5. IF Player の Life が 0 の場合、THEN THE Game SHALL リスポーン処理を行わずゲームオーバー画面を表示する
6. WHILE Player がリスポーン処理中の場合、THE Player SHALL 2 秒間無敵状態を維持し、無敵状態中は Enemy との衝突判定を無効化する

### Requirement 4: コインの取得

**User Story:** プレイヤーとして、ステージに配置されたコインを集めたいので、スコアを積み重ねることができる。

#### Acceptance Criteria

1. WHEN Player が Coin に接触した場合、THE Game SHALL Coin を消滅させ、Score に 50 点を加算する
2. THE Game SHALL 取得済みの Coin を同一ゲームセッション中に再出現させない

### Requirement 5: スコアと残機の表示

**User Story:** プレイヤーとして、現在のスコアと残機数を常に確認したいので、ゲームの状況を把握できる。

#### Acceptance Criteria

1. THE Renderer SHALL Score を画面左上の HUD 領域に常時表示する
2. THE Renderer SHALL 残りの Life 数を画面右上の HUD 領域に常時表示する
3. WHEN Score または Life が変化した場合、THE Renderer SHALL 次のフレーム描画時に最新の値を表示する

### Requirement 6: ステージクリアとゲームオーバー

**User Story:** プレイヤーとして、ゴールに到達してステージをクリアしたり、残機がなくなってゲームオーバーになったりしたいので、ゲームの終了条件を理解できる。

#### Acceptance Criteria

1. WHEN Player が Goal に接触した場合、THE Game SHALL ステージクリア画面を表示し、ゲームループを停止する（同フレームで Life が 0 になった場合もステージクリアを優先する）
2. WHEN Life が 0 になった場合、THE Game SHALL ゲームオーバー画面を表示し、ゲームループを停止する
3. WHEN ゲームオーバー画面が表示されている場合、THE Game SHALL「R」キーの入力によりゲームを初期状態（Score=0, Life=3）でリスタートする
4. WHEN ステージクリア画面が表示されている場合、THE Game SHALL「R」キーの入力によりゲームを初期状態（Score=0, Life=3）でリスタートする

### Requirement 7: カメラのスクロール

**User Story:** プレイヤーとして、進行方向に合わせて画面がスクロールしてほしいので、ステージ全体を進んでいく感覚を味わえる。

#### Acceptance Criteria

1. WHILE Player の X 座標が画面幅の 50% より大きい場合、THE Camera SHALL Player の X 座標を画面中央に維持するように右方向へスクロールする
2. THE Camera SHALL ステージの左端（X=0）より左にスクロールしない
3. THE Camera SHALL ステージの右端（X=Stage 幅）より右にスクロールしない

### Requirement 8: ゲームループとレンダリング

**User Story:** プレイヤーとして、滑らかなアニメーションでゲームを体験したいので、快適にプレイできる。

#### Acceptance Criteria

1. THE Game SHALL requestAnimationFrame を使用して毎秒 60 フレームを目標としてゲームループを実行する
2. THE Renderer SHALL 各フレームで全ゲームオブジェクト（Player、Enemy、Platform、Coin、Goal）をカメラ座標に変換して描画する
3. THE Input_Handler SHALL 各フレームの開始時にキーボード入力の状態を取得し、ゲームロジックに渡す
