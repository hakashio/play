"use strict";

/*
 * Flappy Game - Phaser 3
 * 1000 x 1000 / PC + smartphone
 */

// ============================================================
// 調整用定数
// ============================================================

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 1000;

// 鳥：スプライトシート1コマのサイズ
const BIRD_WIDTH = 130;
const BIRD_HEIGHT = 130;

// 鳥の当たり判定
const BIRD_HITBOX_WIDTH = 20;
const BIRD_HITBOX_HEIGHT = 90;

// 鳥の初期位置
const BIRD_START_X = 200;
const BIRD_START_Y = 500;

// 鳥の物理
const BIRD_GRAVITY = 200;
const BIRD_JUMP_POWER = -300;

// パイプ：合計ブロック数
const PIPE_COUNT = 3;

// パイプ1ブロックの画像サイズ
const PIPE_WIDTH = 200;
const PIPE_HEIGHT = 200;

// パイプ1ブロックの当たり判定
const PIPE_HITBOX_WIDTH = 100;
const PIPE_HITBOX_HEIGHT = 100;

// パイプの速度
const PIPE_SPEED = 130;

// パイプ生成間隔
const PIPE_SPAWN_INTERVAL = 3000;

// マスター音量（全体音量）
const MASTER_VOLUME = 0.1;

// ボタンの色
const BUTTON_COLOR = "0x008b8b";

// ============================================================
// Boot Scene
// ============================================================

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.spritesheet("bird", "assets/yume.png", {
      frameWidth: BIRD_WIDTH,
      frameHeight: BIRD_HEIGHT
    });

    // 背景画像のロード
    this.load.image("background", "assets/background.png");

    // 4種類のブロック画像を読み込み
    this.load.image("block1", "assets/block1.png");
    this.load.image("block2", "assets/block2.png");
    this.load.image("block3", "assets/block3.png");
    this.load.image("block4", "assets/block4.png");

    this.load.audio("bgm", "assets/bgm.mp3");
    this.load.audio("hit", "assets/hit.mp3");

    // タイトルロゴ画像のロード
    this.load.image("logo", "assets/logo.png");
  }

  create() {
    // タイトル画面へ遷移
    this.scene.start("TitleScene");
  }
}

// ============================================================
// Title Scene
// ============================================================

class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create() {
    // 背景画像を追加して画面サイズに合わせる
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "background");
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // ロゴ画像（アセットが読み込めない場合のフォールバック表示例）
    if (this.textures.exists("logo")) {
      this.add.image(GAME_WIDTH / 2, 280, "logo").setOrigin(0.5);
    } else {
      this.add.text(GAME_WIDTH / 2, 280, "ゆめチル", {
        fontFamily: "Arial, sans-serif",
        fontSize: "80px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 10
      }).setOrigin(0.5);
    }

    // --- 自機（鳥）の表示 ---
    const titleBird = this.add.sprite(BIRD_START_X, 480, "bird");
    titleBird.setDisplaySize(BIRD_WIDTH, BIRD_HEIGHT);

    // ふわふわ上下に浮遊するアニメーション（Tween）
    this.tweens.add({
      targets: titleBird,
      y: titleBird.y + 20,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1
    });

    // スタートボタン（文字：PUSH、色：0x1e90ff）
    const startButton = this.createButton(
      GAME_WIDTH / 2,
      700,
      "PUSH"
    );

    startButton.on("pointerdown", () => {
      this.scene.start("GameScene");
    });
  }

  createButton(x, y, text) {
    const width = 360;
    const height = 110;
    const radius = 30;
    const color = BUTTON_COLOR;

    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

    const btnText = this.add.text(0, 0, text, {
      fontFamily: "Arial, sans-serif",
      fontSize: "56px",
      color: "#ffffff"
    }).setOrigin(0.5);

    container.add([bg, btnText]);

    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on("pointerover", () => container.setScale(1.05));
    container.on("pointerout", () => container.setScale(1.0));

    return container;
  }
}

// ============================================================
// Game Scene
// ============================================================

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.isGameOver = false;
    // Phaserの内部時間ではなく、シーン生成時の絶対時間（ミリ秒）を取得
    this.gameStartTime = performance.now();
    this.score = 0;

    // ジャンプ時の2フレーム制御用フラグ・カウンター
    this.jumpFrameTimer = 0;

    // 背景画像を追加して画面サイズに合わせる
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "background");
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // スコア
    this.scoreText = this.add.text(
      GAME_WIDTH / 2,
      70,
      "0.0",
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "64px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8
      }
    )
    .setOrigin(0.5)
    .setDepth(100); // 最前面（パイプより前）に表示

    // 鳥
    this.bird = this.physics.add.sprite(
      BIRD_START_X,
      BIRD_START_Y,
      "bird"
    );

    this.bird.setDisplaySize(BIRD_WIDTH, BIRD_HEIGHT);

    this.bird.body.setSize(
      BIRD_HITBOX_WIDTH,
      BIRD_HITBOX_HEIGHT
    );

    this.bird.body.setOffset(
      (BIRD_WIDTH - BIRD_HITBOX_WIDTH) / 2,
      (BIRD_HEIGHT - BIRD_HITBOX_HEIGHT) / 2
    );

    // 画面外（上下左右）に出ないようにワールド境界を設定
    this.bird.setCollideWorldBounds(true);

    // 初期状態のフレームを指定
    this.bird.setFrame(0);

    // パイプ
    this.pipes = this.physics.add.group();

    this.pipeTimer = this.time.addEvent({
      delay: PIPE_SPAWN_INTERVAL,
      callback: this.spawnPipe,
      callbackScope: this,
      loop: true
    });

    // 最初の1回を即時生成する
    this.spawnPipe();

    this.physics.add.overlap(
      this.bird,
      this.pipes,
      this.hitPipe,
      null,
      this
    );

    // 入力（クリック / タップ）
    this.input.on("pointerdown", this.jump, this);

    // 入力（スペースキー）
    if (this.input.keyboard) {
      this.input.keyboard.on(
        "keydown-SPACE",
        this.jump,
        this
      );
    }

    // --- BGM制御部 ---
    // 既に他のシーン等で作成・管理されているBGMインスタンスがなければ生成
    if (!this.sound.get("bgm")) {
      this.bgm = this.sound.add("bgm", {
        volume: MASTER_VOLUME,
        loop: true
      });
    } else {
      this.bgm = this.sound.get("bgm");
    }

    // スタートボタンを押して GameScene に入った時点で BGM を開始
    this.startBGM();

    // ゲーム開始時に1回ジャンプ
    this.jump();
  }

  startBGM() {
    // 既にBGM再生中の場合は重複再生しない
    if (this.bgm && !this.bgm.isPlaying) {
      this.bgm.play();
    }
  }

  jump() {
    if (this.isGameOver) {
      return;
    }

    this.bird.setVelocityY(BIRD_JUMP_POWER);

    // 現在表示されているフレームが 0 の場合のみ、2フレーム間 frame 1 を表示
    if (this.bird.frame.name === "0" || this.bird.frame.name === 0) {
      this.jumpFrameTimer = 5;
      this.bird.setFrame(1);
    }
  }

  spawnPipe() {
    if (this.isGameOver) {
      return;
    }

    const x = GAME_WIDTH + PIPE_WIDTH;

    // A, B, C パターンからランダムに1つ選ぶ (0: A, 1: B, 2: C)
    // 0 ～ 99 のランダムな整数を取得
    const rand = Phaser.Math.Between(0, 99);
    let patternType = "";

    // 出現率の設定
    if (rand < 20) {
      patternType = 0;
    } else if (rand < 65) {
      patternType = 1
    } else {
      patternType = 2;
    }

    // ブロックが画面からはみ出さない有効な中心Y座標の最小・最大値 (50 ～ 950)
    const minEdge = PIPE_HITBOX_HEIGHT / 2;
    const maxEdge = GAME_HEIGHT - PIPE_HITBOX_HEIGHT / 2;

    // パターンごとの基準範囲 [minY, maxY]
    let baseRanges = [];
    switch (patternType) {
      case 0:
        // Aパターン
        baseRanges = [
          [0, 100],
          [100, 300],
          [300, GAME_HEIGHT]
        ];
        break;

      case 1:
        // Bパターン
        baseRanges = [
          [0, 200],
          [200, 800],
          [800, GAME_HEIGHT]
        ];
        break;

      case 2:
        // Cパターン
        baseRanges = [
          [0, 700],
          [700, 900],
          [900, GAME_HEIGHT]
        ];
        break;
    }

    let lastY = -Infinity;

    for (let i = 0; i < 3; i++) {
      // 画面端からはみ出ないように範囲を Clamp（50〜950に収める）
      let minY = Phaser.Math.Clamp(baseRanges[i][0], minEdge, maxEdge);
      let maxY = Phaser.Math.Clamp(baseRanges[i][1], minEdge, maxEdge);

      // 前のブロックと重ならないよう、前のY座標 + PIPE_HITBOX_HEIGHT 以降に最小値を調整
      if (lastY !== -Infinity) {
        minY = Math.max(minY, lastY + PIPE_HITBOX_HEIGHT);
      }

      // minY が maxY を超えてしまった場合の安全調整
      if (minY > maxY) {
        minY = maxY;
      }

      const y = Phaser.Math.Between(minY, maxY);
      this.createPipeBlock(x, y);

      lastY = y;
    }
  }

  createPipeBlock(x, y) {
    // 0 ～ 99 のランダムな整数を取得
    const rand = Phaser.Math.Between(0, 99);
    let blockKey = "";

    // 出現率の設定
    if (rand < 75) {
      blockKey = "block1";
    } else if (rand < 85) {
      blockKey = "block2";
    } else if (rand < 95) {
      blockKey = "block3";
    } else {
      blockKey = "block4";
    }

    // ランダムに選ばれた画像キーでスプライトを生成
    const pipe = this.pipes.create(
      x,
      y,
      blockKey
    );

    pipe.setDisplaySize(
      PIPE_WIDTH,
      PIPE_HEIGHT
    );

    pipe.body.setSize(
      PIPE_HITBOX_WIDTH,
      PIPE_HITBOX_HEIGHT
    );

    pipe.body.setOffset(
      (PIPE_WIDTH - PIPE_HITBOX_WIDTH) / 2,
      (PIPE_HEIGHT - PIPE_HITBOX_HEIGHT) / 2
    );

    // 重力を無効化
    pipe.body.allowGravity = false;

    // 固定障害物化
    pipe.setImmovable(true);

    // 左方向へ移動
    pipe.setVelocityX(-PIPE_SPEED);
  }

  hitPipe() {
    if (this.isGameOver) {
      return;
    }

    // ヒット音をマスター音量で再生
    this.sound.play("hit", { volume: MASTER_VOLUME });

    this.gameOver();
  }

  gameOver() {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    // スコア計算
    this.score = (performance.now() - this.gameStartTime) / 1000;
    this.score = Math.max(0, Math.floor(this.score * 10) / 10);

    // パイプ生成タイマーを停止
    if (this.pipeTimer) {
      this.pipeTimer.remove();
    }

    // パイプと鳥の物理動作をすべて静止
    this.pipes.setVelocityX(0);
    this.bird.setVelocity(0);
    this.bird.body.allowGravity = false;
    this.physics.pause(); // 物理シミュレーション全般を停止

    // 画面遷移ではなく、GameOverScene をオーバーレイとして起動する
    this.scene.launch("GameOverScene", {
      score: this.score
    });
  }

  update() {
    if (this.isGameOver) {
      return;
    }

    // performance.now() との差分から経過秒数を算出
    this.score = (performance.now() - this.gameStartTime) / 1000;

    this.scoreText.setText(
      this.score.toFixed(1)
    );

    // --- 鳥のフレーム切り替え制御 ---
    if (this.jumpFrameTimer > 0) {
      // ジャンプ直後の2フレーム間は強制的に frame 1 を表示
      this.bird.setFrame(1);
      this.jumpFrameTimer--;
    } else {
      // 速度による表示判定
      const velocityY = this.bird.body.velocity.y;

      if (velocityY <= 0) {
        // 停止中 (0) または 上昇中 (< 0) の場合は frame 0
        this.bird.setFrame(0);
      } else {
        // 下降中 (> 0) の場合は frame 1
        this.bird.setFrame(1);
      }
    }

    // 鳥の傾き
    const velocityY = this.bird.body.velocity.y;
    this.bird.angle = Phaser.Math.Clamp(
      velocityY * 0.04,
      -30,
      90
    );

    // 画面外のパイプを削除
    const children = this.pipes.getChildren().slice();
    children.forEach((pipe) => {
      if (
        pipe &&
        pipe.active &&
        pipe.x < -PIPE_WIDTH
      ) {
        pipe.destroy();
      }
    });
  }
}

// ============================================================
// Game Over Scene
// ============================================================

class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  init(data) {
    this.finalScore = data.score ?? 0;
  }

  create() {
    // 半透明の暗いシートを被せて、下のゲーム画面が見える状態にする
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.2
    );

    this.add.text(
      GAME_WIDTH / 2,
      300,
      "GAME OVER",
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "100px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 10
      }
    ).setOrigin(0.5);

    this.add.text(
      GAME_WIDTH / 2,
      450,
      `きろく\n${this.finalScore.toFixed(1)} びょう`,
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "64px",
        color: "#ffffff",
        align: "center",
        stroke: "#000000",
        strokeThickness: 6
      }
    ).setOrigin(0.5);

    // --- ボタン生成 ---
    const restartButton = this.createButton(
      GAME_WIDTH / 2,
      650,
      "もういちど"
    );

    const postButton = this.createButton(
      GAME_WIDTH / 2,
      800,
      "Xにとうこう"
    );

    // 初期状態は非表示かつクリック無効
    restartButton.setVisible(false).disableInteractive();
    postButton.setVisible(false).disableInteractive();

    // 1000ミリ秒（1秒）後にボタンを表示してイベントを設定
    this.time.delayedCall(1000, () => {
      // ボタンを表示してクリック可能にする
      restartButton.setVisible(true).setInteractive({ useHandCursor: true });
      postButton.setVisible(true).setInteractive({ useHandCursor: true });

      // フェードイン演出
      restartButton.setAlpha(0);
      postButton.setAlpha(0);
      this.tweens.add({
        targets: [restartButton, postButton],
        alpha: 1,
        duration: 300
      });

      // イベントリスナーの登録
      restartButton.on("pointerdown", () => {
        this.scene.stop("GameOverScene");
        this.scene.get("GameScene").scene.restart();
      });

      postButton.on("pointerdown", () => {
        this.postToX();
      });
    });
  }

  createButton(x, y, text) {
    // ボタンの幅・高さ・角丸半径・カラー設定
    const width = 400;
    const height = 110;
    const radius = 30;
    const color = BUTTON_COLOR;

    // ボタンの枠組みとなるコンテナを作成
    const container = this.add.container(x, y);

    // 角丸背景を描画
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

    // テキストを作成
    const btnText = this.add.text(0, 0, text, {
      fontFamily: "Arial, sans-serif",
      fontSize: "48px",
      color: "#ffffff"
    }).setOrigin(0.5);

    // コンテナに背景とテキストを追加
    container.add([bg, btnText]);

    // コンテナ全体の当たり判定サイズを指定
    container.setSize(width, height);

    // ホバー時の拡大・縮小アニメーション
    container.on("pointerover", () => container.setScale(1.05));
    container.on("pointerout", () => container.setScale(1.0));

    return container;
  }

  postToX() {
    const text = `ゆめチル きろく ${this.finalScore.toFixed(1)} びょう #ゆめチル\n`;
    const gameUrl = window.location.href; // 現在のページURLを取得する場合

    const shareUrl =
      "https://x.com/intent/post?text=" +
      encodeURIComponent(text) +
      "&url=" +
      encodeURIComponent(gameUrl);

    window.open(shareUrl, "_blank");
  }
}

// ============================================================
// Phaser Game
// ============================================================

const config = {
  type: Phaser.AUTO,

  width: GAME_WIDTH,
  height: GAME_HEIGHT,

  parent: "game-container",

  backgroundColor: "#87ceeb",

  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: BIRD_GRAVITY
      },
      // 当たり判定等デバッグ表示
      debug: false
    }
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },

  // TitleScene を配列に追加
  scene: [
    BootScene,
    TitleScene,
    GameScene,
    GameOverScene
  ]
};

new Phaser.Game(config);