"use strict";

/*
 * YumeChill - Phaser 3
 * 1000 x 1000 / PC + smartphone
 */

// ============================================================
// 調整用定数
// ============================================================
const YUMECHILL_VERSION = "v1.0";

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 1000;

// 自機：スプライトシート1コマのサイズ
const YUME_WIDTH = 130;
const YUME_HEIGHT = 130;

// 自機の当たり判定
const YUME_HITBOX_WIDTH = 20;
const YUME_HITBOX_HEIGHT = 90;

// 自機の初期位置
const YUME_START_X = 200;
const YUME_START_Y = 500;

// 自機の物理
const YUME_GRAVITY = 200;
const YUME_JUMP_POWER = -300;

// ブロック：合計ブロック数
const BLOCK_COUNT = 3;

// ブロック1ブロックの画像サイズ
const BLOCK_WIDTH = 200;
const BLOCK_HEIGHT = 200;

// ブロック1ブロックの当たり判定
const BLOCK_HITBOX_WIDTH = 100;
const BLOCK_HITBOX_HEIGHT = 100;

// ブロックの速度
const BLOCK_SPEED = 130;

// ブロック生成間隔
const BLOCK_SPAWN_INTERVAL = 3000;

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
    this.load.spritesheet("yume", "assets/yume.png", {
      frameWidth: YUME_WIDTH,
      frameHeight: YUME_HEIGHT
    });

    // 背景画像のロード
    this.load.image("background", "assets/background.png");

    // おやすみや画像のロード
    this.load.image("oyasumiya", "assets/oyasumiya.png");

    // タイトル画像のロード
    this.load.image("title", "assets/title.png");

    // PUSH画像のロード
    this.load.image("push_img", "assets/push.png");

    // ブロック画像のロード
    this.load.image("block1", "assets/block1.png");
    this.load.image("block2", "assets/block2.png");
    this.load.image("block3", "assets/block3.png");
    this.load.image("block4", "assets/block4.png");

    // 音声ロード
    this.load.audio("bgm", "assets/bgm.mp3");
    this.load.audio("hit", "assets/hit.mp3");
    this.load.audio("jump", "assets/jump.mp3");
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
    // 背景画像を画面中央に表示して画面サイズに合わせる
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "background");
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // タイトル画像を画面中央に表示して画面サイズに合わせる
    const titleBg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "title");
    titleBg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // --- 自機（自機）の表示 ---
    const titleYume = this.add.sprite(YUME_START_X, 480, "yume");
    titleYume.setDisplaySize(YUME_WIDTH, YUME_HEIGHT);

    // ふわふわ上下に浮遊するアニメーション
    this.tweens.add({
      targets: titleYume,
      y: titleYume.y + 20,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1
    });

    // PUSHの表示、点滅
    if (this.textures.exists("push_img")) {
      const pushImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "push_img").setOrigin(0.5);
      
      // アルファ値を変化させて点滅させる
      this.tweens.add({
        targets: pushImg,
        alpha: 0.13,
        duration: 800,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1
      });
    }

    // バージョン表示（画面右下）
    this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 20, YUMECHILL_VERSION, {
      fontFamily: "Arial, sans-serif",
      fontSize: "24px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4
    }).setOrigin(1, 1);

    // どこを押してもゲームスタートするイベントを設定
    this.input.once("pointerdown", () => {
      this.scene.start("GameScene");
    });

    // スペースキーでゲームスタートするイベントを設定
    if (this.input.keyboard) {
      this.input.keyboard.once("keydown-SPACE", () => {
        this.scene.start("GameScene");
      });
    }
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
    .setDepth(100); // 最前面（ブロックより前）に表示

    // 自機
    this.yume = this.physics.add.sprite(
      YUME_START_X,
      YUME_START_Y,
      "yume"
    );

    this.yume.setDisplaySize(YUME_WIDTH, YUME_HEIGHT);

    this.yume.body.setSize(
      YUME_HITBOX_WIDTH,
      YUME_HITBOX_HEIGHT
    );

    this.yume.body.setOffset(
      (YUME_WIDTH - YUME_HITBOX_WIDTH) / 2,
      (YUME_HEIGHT - YUME_HITBOX_HEIGHT) / 2
    );

    // 画面外に出ないようにワールド境界を設定
    this.yume.setCollideWorldBounds(true);

    // 初期状態のフレームを指定
    this.yume.setFrame(0);

    // ブロック
    this.blocks = this.physics.add.group();

    this.blockTimer = this.time.addEvent({
      delay: BLOCK_SPAWN_INTERVAL,
      callback: this.spawnBlock,
      callbackScope: this,
      loop: true
    });

    // 最初の1回を即時生成する
    this.spawnBlock();

    this.physics.add.overlap(
      this.yume,
      this.blocks,
      this.hitBlock,
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

    this.yume.setVelocityY(YUME_JUMP_POWER);

    // ジャンプ音をマスター音量で再生
    this.sound.play("jump", { volume: MASTER_VOLUME });

    // 現在表示されているフレームが 0 の場合のみ frame 1 を表示
    if (this.yume.frame.name === "0" || this.yume.frame.name === 0) {
      this.jumpFrameTimer = 5;
      this.yume.setFrame(1);
    }
  }

  spawnBlock() {
    if (this.isGameOver) {
      return;
    }

    const x = GAME_WIDTH + BLOCK_WIDTH;

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

    // ブロックが画面からはみ出さない有効な中心Y座標の最小・最大値
    const minEdge = BLOCK_HITBOX_HEIGHT / 2;
    const maxEdge = GAME_HEIGHT - BLOCK_HITBOX_HEIGHT / 2;

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
      // 画面端からはみ出ないように範囲を収める
      let minY = Phaser.Math.Clamp(baseRanges[i][0], minEdge, maxEdge);
      let maxY = Phaser.Math.Clamp(baseRanges[i][1], minEdge, maxEdge);

      // 前のブロックと重ならないよう、前のY座標 + BLOCK_HITBOX_HEIGHT 以降に最小値を調整
      if (lastY !== -Infinity) {
        minY = Math.max(minY, lastY + BLOCK_HITBOX_HEIGHT);
      }

      // minY が maxY を超えてしまった場合の調整
      if (minY > maxY) {
        minY = maxY;
      }

      const y = Phaser.Math.Between(minY, maxY);
      this.createBlockBlock(x, y);

      lastY = y;
    }
  }

  createBlockBlock(x, y) {
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
    const block = this.blocks.create(
      x,
      y,
      blockKey
    );

    block.setDisplaySize(
      BLOCK_WIDTH,
      BLOCK_HEIGHT
    );

    block.body.setSize(
      BLOCK_HITBOX_WIDTH,
      BLOCK_HITBOX_HEIGHT
    );

    block.body.setOffset(
      (BLOCK_WIDTH - BLOCK_HITBOX_WIDTH) / 2,
      (BLOCK_HEIGHT - BLOCK_HITBOX_HEIGHT) / 2
    );

    // 重力を無効化
    block.body.allowGravity = false;

    // 固定障害物化
    block.setImmovable(true);

    // 左方向へ移動
    block.setVelocityX(-BLOCK_SPEED);
  }

  hitBlock() {
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

    // ゲームオーバー時点での経過秒数を取得
    this.score = (performance.now() - this.gameStartTime) / 1000;

    // 画面上のスコア表示もゲームオーバー確定値（toFixed(1)）で上書き同期する
    this.scoreText.setText(this.score.toFixed(1));

    // ブロック生成タイマーを停止
    if (this.blockTimer) {
      this.blockTimer.remove();
    }

    // ブロックと自機の物理動作をすべて静止
    this.blocks.setVelocityX(0);
    this.yume.setVelocity(0);
    this.yume.body.allowGravity = false;
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

    // --- 自機のフレーム切り替え制御 ---
    if (this.jumpFrameTimer > 0) {
      // ジャンプ直後は強制的に frame 1 を表示
      this.yume.setFrame(1);
      this.jumpFrameTimer--;
    } else {
      // 速度による表示判定
      const velocityY = this.yume.body.velocity.y;

      if (velocityY <= 0) {
        // 停止中 (0) または 上昇中 (< 0) の場合は frame 0
        this.yume.setFrame(0);
      } else {
        // 下降中 (> 0) の場合は frame 1
        this.yume.setFrame(1);
      }
    }

    // 自機の傾き
    const velocityY = this.yume.body.velocity.y;
    this.yume.angle = Phaser.Math.Clamp(
      velocityY * 0.04,
      -30,
      90
    );

    // 画面外のブロックを削除
    const children = this.blocks.getChildren().slice();
    children.forEach((block) => {
      if (
        block &&
        block.active &&
        block.x < -BLOCK_WIDTH
      ) {
        block.destroy();
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
    // 既に GameScene 側で toFixed(1) された数値を受け取る
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

    // おやすみやを表示
    const oyasumiya = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "oyasumiya");
    oyasumiya.setDisplaySize(1000, 1000);

    this.add.text(
      GAME_WIDTH / 2,
      600,
      `きろく　${this.finalScore.toFixed(1)} びょう`,
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
      750,
      "もういちど"
    );

    const postButton = this.createButton(
      GAME_WIDTH / 2,
      900,
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

  async postToX() {
    const text = `きろく ${this.finalScore.toFixed(1)} びょう ゆめチル${YUMECHILL_VERSION} #ゆめチル`;
    const gameUrl = window.location.href;

    const shareUrl =
      "https://x.com/intent/post?text=" +
      encodeURIComponent(text + "\n") +
      "&url=" +
      encodeURIComponent(gameUrl);

    const ua = window.navigator.userAgent.toLowerCase();

    // iOS (iPhone / iPod / iPad) 判定
    const isIOS = /iphone|ipod/.test(ua);
    const isIPad = /ipad/.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
    const isIOSSafari = (isIOS || isIPad) && isSafari;

    if (isIOSSafari) {
      // 1. まず X アプリのカスタムURLスキームを試す
      const appUrl =
        "twitter://post?message=" +
        encodeURIComponent(text + "\n" + gameUrl);

      let appOpened = false;

      // アプリが起動してバックグラウンドに移動したかを検知
      const handleBlur = () => {
        appOpened = true;
      };
      window.addEventListener("pagehide", handleBlur, { once: true });
      window.addEventListener("blur", handleBlur, { once: true });

      // カスタムURLスキームの実行
      window.location.href = appUrl;

      // 2. アプリが起動しなかった場合（アプリ未インストール時など）のフォールバック処理
      setTimeout(async () => {
        window.removeEventListener("pagehide", handleBlur);
        window.removeEventListener("blur", handleBlur);

        // アプリが開かなかった場合のみ処理を実行
        if (!appOpened) {
          if (navigator.share) {
            // Web Share API を呼び出し
            try {
              await navigator.share({
                text: text,
                url: gameUrl
              });
            } catch (err) {
              if (err.name !== "AbortError") {
                console.error("Share failed:", err);
              }
            }
          } else {
            // Web Share API 未対応時の最終フォールバック
            window.location.href = shareUrl;
          }
        }
      }, 500);

    } else {
      // PC、Android、iOS上の他ブラウザ（Chrome/Firefox等）は常に新規タブ（_blank）で開く
      window.open(shareUrl, "_blank");
    }
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
        y: YUME_GRAVITY
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