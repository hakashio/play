window.gLocalAssetContainer["Block"] = function(g) { (function(exports, require, module, __filename, __dirname) {
var Light = require('./Light');
var Yume = require('./Yume');

module.exports.block_x = [
    224 / 2,
    424 / 2,
    624 / 2,
    824 / 2,
    1024 / 2,
];

module.exports.block_y = [
    100 / 2,
    300 / 2,
    500 / 2,
    700 / 2,
    900 / 2,
];

// ブロック追加位置
module.exports.add_block_y = -100 / 2;

// 追加時のブロックスピード
module.exports.block_add_speed = 13;

// 追加時のブロック移動距離
module.exports.block_add_move_y = 200 / 2;

// キャッチしたブロックの位置
module.exports.catch_block_y = 1300 / 2;

// キャッチ時のブロックスピード
module.exports.block_catch_speed = 60 / 2;

// スロー時のブロックスピード
module.exports.block_throw_speed = 60 / 2;

/**
 * ブロックオブジェクトを生成する。
 * @param {number} x x座標
 * @param {number} y y座標
 * @param {number} number 数字 指定しない場合はランダム
 */
module.exports.create = function (x, y, number = 0) {
    var scene = g.game.game_scene;
    var images = g.game.game_scene.images;

    // 1,2,4,5 の乱数を生成
    if (number === 0) {
        // 1〜4の乱数を生成
        number = Math.floor(g.game.random.generate() * 4) + 1;
        // 3は5に変更
        if (number === 3) number = 5;
    }
    var image = images['block_' + number];
    var new_block = new g.Sprite({
        scene: scene,
        src: image,
        width: image.width,
        height: image.height,
        anchorX: 0.5,
        anchorY: 0.5,
        x: x,
        y: y,
        scaleX: 0.5,
        scaleY: 0.5,
    });
    // ブロックのプロパティ
    new_block.number = number;

    new_block.onUpdate.add(function () {
        try {
            // 時間で強制停止
            if (g.game.game_scene.time.time > 0) {
                module.exports.falling(new_block);
                module.exports.catching(new_block);
                module.exports.throwing(new_block);
                module.exports.changing(new_block);
                module.exports.breaking(new_block);
                // 変更通知
                new_block.modified();
            }
        } catch (error) {
        }
    });
    scene.append(new_block);
    
    return new_block;
}

/**
 * ブロックを配置する。
 */
module.exports.init = function () {
    g.game.game_scene.blocks = [];
    for (let i = 0; i < 5; i++) {
        g.game.game_scene.blocks[i] = [];
        for (let j = 0; j < 5; j++) {
            g.game.game_scene.blocks[i][j] = module.exports.create(module.exports.block_x[i], module.exports.block_y[j]);
        }
    }
}

/**
 * ブロック追加
 * @param {number} lane 
 */
module.exports.add = function (lane) {
    // 先頭にブロックを追加
    g.game.game_scene.blocks[lane].unshift(
        module.exports.create(module.exports.block_x[lane], module.exports.add_block_y)
    );
}

/**
 * 1段落とす
 */
module.exports.fall = function (lane) {
    g.game.game_scene.blocks[lane].forEach(function (sprite) {
        sprite.is_falling = true;
        // 移動距離
        sprite.move_y = module.exports.block_add_move_y;
        // 目的地
        sprite.to_y = sprite.y + module.exports.block_add_move_y;
    });
}

/**
 * 1段落とすアニメーション
 */
module.exports.falling = function (sprite) {
    if (!sprite.is_falling) return;
    sprite.y += module.exports.block_add_speed;
    sprite.move_y -= module.exports.block_add_speed;
    // 移動距離がなくなったら
    if (sprite.move_y <= 0) {
        // 座標を目的地にセット
        sprite.y = sprite.to_y;
        sprite.is_falling = false;
    }
}

/**
 * ブロックキャッチ
 */
module.exports.catch = function (sprite) {
    sprite.is_catching = true;
}

/**
 * キャッチされたブロックのアニメーション
 */
module.exports.catching = function (sprite) {
    if (!sprite.is_catching) return;
    sprite.y += module.exports.block_catch_speed;
    if (sprite.y >= module.exports.catch_block_y) {
        sprite.y = module.exports.catch_block_y;
        sprite.is_catching = false;
        Yume.hold();
    }
}

/**
 * ブロックを投げる
 */
module.exports.throw = function (sprite, throw_lane) {
    sprite.is_throwing = true;
    sprite.throw_lane = throw_lane;
}

/**
 * ブロック投げ中のアニメーション
 */
module.exports.throwing = function (sprite) {
    if (!sprite.is_throwing) return;
    sprite.y -= module.exports.block_throw_speed;
    if (sprite.y <= module.exports.block_y[4]) {
        sprite.y = module.exports.block_y[4];
        module.exports.hit(sprite);
        sprite.is_throwing = false;
        Yume.wait();
    }
}

/**
 * ブロックヒット
 */
module.exports.hit = function (throw_sprite) {
    var lane = throw_sprite.throw_lane;
    var hit_sprite = g.game.game_scene.blocks[lane].pop();

    g.game.game_scene.audios.block_hit.play();

    // 新しいブロックを合成
    let after_block_number = throw_sprite.number + hit_sprite.number;
    if (after_block_number > 10) after_block_number = 10;
    var new_block = this.create(module.exports.block_x[lane], module.exports.block_y[4], after_block_number);
    new_block.number = after_block_number;
    new_block.throw_lane = lane;

    // 合成済みのブロックを消去
    throw_sprite.destroy(true);
    hit_sprite.destroy(true);

    // 2,4,5 の場合はブロック変化
    if (new_block.number === 2 || new_block.number === 4 || new_block.number === 5) {
        module.exports.change(new_block);
        g.game.game_scene.blocks[lane][4] = new_block;
    } else {
        // それ以外の場合はブロック破壊・ブロック追加
        module.exports.break(new_block);
        module.exports.add(lane);
        module.exports.fall(lane);
    }
}

/**
 * ブロック変化
 */
module.exports.change = function (sprite) {
    sprite.is_changing = true;
    sprite.scaleX = 1;
    sprite.scaleY = 1;
}

/**
 * ブロックヒット中のアニメーション
 */
module.exports.changing = function (sprite) {
    if (!sprite.is_changing) return;
    sprite.scaleX -= 0.05;
    sprite.scaleY -= 0.05;
    if (sprite.scaleX <= 0.5) {
        sprite.scaleX = 0.5;
        sprite.scaleY = 0.5;
        sprite.is_changing = false;
    }
}

/**
 * ブロック破壊
 */
module.exports.break = function (sprite) {
    sprite.is_breaking = true;

    // スコアアップ
    g.game.vars.gameState.score2 += sprite.number;
    g.game.game_scene.score_label.text = '' + g.game.vars.gameState.score2;
    g.game.game_scene.score_label.invalidate();

    // 7638ライト点灯
    Light.on(sprite.number);
}

/**
 * ブロック破壊中のアニメーション
 */
module.exports.breaking = function (sprite) {
    if (!sprite.is_breaking) return;
    sprite.scaleX += 0.05;
    sprite.scaleY += 0.05;
    if (sprite.scaleX >= 1) {
        sprite.destroy(true);
    }
}

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}