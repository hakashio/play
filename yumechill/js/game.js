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
const BIRD_WIDTH = 100;
const BIRD_HEIGHT = 100;

// 鳥の当たり判定
const BIRD_HITBOX_WIDTH = 50;
const BIRD_HITBOX_HEIGHT = 100;

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

// BGM
const BGM_VOLUME = 0.5;

// ============================================================
// Boot Scene
// ============================================================

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.spritesheet("bird", "assets/bird.svg", {
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

    this.load.audio("bgm", "assets/bgm.wav");

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

    // ロゴ画像（アセットが読み込めない場合のフォールバック表示例としてテキストも添えています）
    if (this.textures.exists("logo")) {
      this.add.image(GAME_WIDTH / 2, 350, "logo").setOrigin(0.5);
    } else {
      this.add.text(GAME_WIDTH / 2, 350, "FLAPPY GAME", {
        fontFamily: "Arial, sans-serif",
        fontSize: "80px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 10
      }).setOrigin(0.5);
    }

    // スタートボタン
    const startButton = this.createButton(
      GAME_WIDTH / 2,
      650,
      "START"
    );

    startButton.on("pointerdown", () => {
      this.scene.start("GameScene");
    });
  }

  createButton(x, y, text) {
    const button = this.add.text(
      x,
      y,
      text,
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "56px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          left: 60,
          right: 60,
          top: 25,
          bottom: 25
        }
      }
    ).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });

    button.on("pointerover", () => button.setScale(1.05));
    button.on("pointerout", () => button.setScale(1.0));

    return button;
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
    this.gameStartTime = this.time.now;
    this.score = 0;

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
    ).setOrigin(0.5);

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

    this.bird.play("bird-fly");

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

    // BGM
    this.bgm = this.sound.add("bgm", {
      volume: BGM_VOLUME,
      loop: true
    });

    this.audioStarted = false;
  }

  startBGM() {
    if (this.audioStarted) {
      return;
    }

    this.audioStarted = true;

    if (!this.bgm.isPlaying) {
      this.bgm.play();
    }
  }

  jump() {
    if (this.isGameOver) {
      return;
    }

    this.startBGM();
    this.bird.setVelocityY(BIRD_JUMP_POWER);
  }

  spawnPipe() {
    if (this.isGameOver) {
      return;
    }

    const x = GAME_WIDTH + PIPE_WIDTH;

    // A, B, C パターンからランダムに1つ選ぶ (0: A, 1: B, 2: C)
    const patternType = Phaser.Math.Between(0, 2);
    // const patternType = 1;

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

    this.gameOver();
  }

  gameOver() {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    this.score =
      (this.time.now - this.gameStartTime) / 1000;

    this.score =
      Math.max(0, Math.floor(this.score * 10) / 10);

    if (this.bgm && this.bgm.isPlaying) {
      this.bgm.stop();
    }

    this.pipes.setVelocityX(0);

    this.bird.setVelocity(0);
    this.bird.body.allowGravity = false;

    this.scene.start("GameOverScene", {
      score: this.score
    });
  }

  update() {
    if (this.isGameOver) {
      return;
    }

    this.score =
      (this.time.now - this.gameStartTime) / 1000;

    this.scoreText.setText(
      this.score.toFixed(1)
    );

    // 鳥の速度を取得
    const velocityY =
      this.bird.body.velocity.y;

    // 上昇中は frame 0、下降中（および水平）は frame 1 を表示
    if (velocityY < 0) {
      this.bird.setFrame(0);
    } else {
      this.bird.setFrame(1);
    }

    // 鳥の傾き
    this.bird.angle = Phaser.Math.Clamp(
      velocityY * 0.08,
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
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x222222,
      0.9
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
      `SCORE\n${this.finalScore.toFixed(1)} sec`,
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "64px",
        color: "#ffffff",
        align: "center",
        stroke: "#000000",
        strokeThickness: 6
      }
    ).setOrigin(0.5);

    const restartButton =
      this.createButton(
        GAME_WIDTH / 2,
        650,
        "RESTART"
      );

    restartButton.on("pointerdown", () => {
      this.scene.start("GameScene");
    });

    const postButton =
      this.createButton(
        GAME_WIDTH / 2,
        800,
        "POST TO X"
      );

    postButton.on("pointerdown", () => {
      this.postToX();
    });
  }

  createButton(x, y, text) {
    const button = this.add.text(
      x,
      y,
      text,
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "48px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          left: 50,
          right: 50,
          top: 20,
          bottom: 20
        }
      }
    ).setOrigin(0.5);

    button.setInteractive({
      useHandCursor: true
    });

    button.on("pointerover", () => {
      button.setScale(1.05);
    });

    button.on("pointerout", () => {
      button.setScale(1.0);
    });

    return button;
  }

  postToX() {
    const text =
      `Flappy Gameで ${this.finalScore.toFixed(1)} 秒生き残りました！`;

    const url =
      "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(text);

    window.open(url, "_blank");
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