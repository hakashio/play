window.gLocalAssetContainer["Yume"] = function(g) { (function(exports, require, module, __filename, __dirname) {
var Block = require('./Block');

module.exports.yume_x = [
    224 / 2,
    424 / 2,
    624 / 2,
    824 / 2,
    1024 / 2
];

// 成宮由愛のy座標
module.exports.yume_y = 1450 / 2;

// ブロックの投げ硬直
module.exports.block_throw_wait = 8;

module.exports.init = function () {
    g.game.game_scene.yume = {};

    var yume = g.game.game_scene.yume;

    var scene = g.game.game_scene;
    var images = g.game.game_scene.images;

    yume.is_standing = true;

    yume.sprite = new g.FrameSprite({
        scene: scene,
        src: images['yume'],
        anchorX: 0.5,
        anchorY: 0.5,
        // エンティティのサイズ
        width: 256,
        height: 256,
        scaleX: 0.5,
        scaleY: 0.5,
        // 初期座標
        x: module.exports.yume_x[2],
        y: module.exports.yume_y,
        // 元画像のフレーム1つのサイズ
        srcWidth: 256,
        srcHeight: 256,
        // アニメーションに利用するフレームのインデックス配列
        // インデックスは元画像の左上から右にsrcWidthとsrcHeightの矩形を並べて数え上げ、右端に達したら一段下の左端から右下に達するまで繰り返す
        frames: [0, 1],
        // アニメーションをループする（省略した場合ループする）
        loop: false
    });
    var sprite = yume.sprite;

    scene.append(sprite);

    sprite.onUpdate.add(function () {
        try {
            // 時間で強制停止
            if (g.game.game_scene.time.time > 0) {
                module.exports.throwing();
                module.exports.waiting();
                // プレイヤーの座標に変更があった場合、 modified() を実行して変更をゲームに通知します
                sprite.modified();
            }
        } catch (error) {
        }
    });
}

/**
 * 特定のレーンに移動する。
 * @param {number} lane 
 */
module.exports.move = function (lane) {
    var yume = g.game.game_scene.yume;

    yume.lane = lane;
    yume.sprite.x = module.exports.yume_x[lane];
    if (yume.block) yume.block.x = Block.block_x[yume.lane];
}

/**
 * 立ち状態にする。
 */
module.exports.stand = function () {
    var yume = g.game.game_scene.yume;

    yume.is_standing = true;
    yume.sprite.frameNumber = 0;
}

/**
 * ブロックをキャッチする
 */
module.exports.catch = function () {
    var yume = g.game.game_scene.yume;

    // // タイマーが動いていない場合は無効
    if (!g.game.game_scene.time.is_timing) return;
    // // デフォルト時以外は無効
    if (!yume.is_standing) return;

    yume.is_standing = false;
    yume.is_catching = true;
    g.game.game_scene.audios.block_catch.play();
    yume.sprite.frameNumber = 1;

    yume.block = g.game.game_scene.blocks[yume.lane].pop();
    Block.catch(yume.block);
    Block.add(yume.lane);
    Block.fall(yume.lane);
}

/**
 * ブロックを持った状態にする。
 */
module.exports.hold = function () {
    var yume = g.game.game_scene.yume;

    yume.is_holding = true;
}

/**
 * ブロックを投げる
 */
module.exports.throw = function () {
    var yume = g.game.game_scene.yume;

    // タイマーが動いていない場合は無効
    if (!g.game.game_scene.time.is_timing) return;
    // ブロックを持ってる時以外は無効
    if (!yume.is_holding) return;

    g.game.game_scene.audios.block_throw.play();

    yume.is_holding = false;
    yume.is_throwing = true;
    Block.throw(yume.block, yume.lane);
    yume.block = null;
    yume.sprite.y -= 35;
}

/**
 * ブロック投げ中のアニメーション
 */
module.exports.throwing = function () {
    var yume = g.game.game_scene.yume;

    if (!yume.is_throwing) return;
    yume.sprite.y += 5; // 7フレーム
    if (yume.sprite.y >= module.exports.yume_y) {
        yume.sprite.y = module.exports.yume_y;
    }
}

/**
 * 硬直状態にする。
 */
module.exports.wait = function () {
    var yume = g.game.game_scene.yume;

    yume.is_waiting = true;
    yume.wait_counter = module.exports.block_throw_wait;
}

/**
 * 硬直中のアニメーション
 */
module.exports.waiting = function () {
    var yume = g.game.game_scene.yume;

    if (!yume.is_waiting) return;

    yume.wait_counter--;
    if (yume.wait_counter <= 0) {
        yume.is_waiting = false;
        module.exports.stand();
    }
}


})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}