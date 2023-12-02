window.gLocalAssetContainer["Yume"] = function(g) { (function(exports, require, module, __filename, __dirname) {
var CONST = require('./CONST');

module.exports.init = function () {
    var scene = g.game.game_scene;

    scene.yume = {};

    // オブジェクト変数
    scene.yume.is_flying = false;

    var sprite = new g.FrameSprite({
        scene: scene,
        src: scene.asset.getImage('/assets/image/yume.png'),
        anchorX: 0.5,
        anchorY: 0.5,
        // エンティティのサイズ
        width: CONST.yume_size,
        height: CONST.yume_size,
        // 初期座標
        x: CONST.yume_start_x,
        y: CONST.yume_start_y,
        // 元画像のフレーム1つのサイズ
        srcWidth: CONST.yume_size,
        srcHeight: CONST.yume_size,
        // アニメーションに利用するフレームのインデックス配列
        // インデックスは元画像の左上から右にsrcWidthとsrcHeightの矩形を並べて数え上げ、右端に達したら一段下の左端から右下に達するまで繰り返す
        frames: [0, 1],
        // アニメーションをループする（省略した場合ループする）
        loop: true,
        // フレームのインターバル
        interval: 130,
    });
    scene.sprites.push(sprite);
    scene.yume.sprite = sprite;

    // シーンにスプライトを追加
    scene.layers.yume.append(sprite);

    // アニメーション開始
    sprite.start();

    // スプライト変数
    // スピード
    sprite.speed = 0;

    // フレームごとの処理
    sprite.onUpdate.add(
        function () {
            if (scene.yume.is_flying) {
                sprite.speed -= CONST.gravity;
                // 上昇時の初速設定（最大速度の1/3からスタート）
                if (sprite.speed > 0) sprite.speed = -(CONST.max_speed / 3);
                // 最大速度設定
                if (sprite.speed < -CONST.max_speed) sprite.speed = -CONST.max_speed;
            } else {
                sprite.speed += CONST.gravity;
                // 下降時は0から下降
                if (sprite.speed < 0) sprite.speed = 0;
                // 最大速度設定
                if (sprite.speed > CONST.max_speed) sprite.speed = CONST.max_speed;
            }
    
            // 移動
            sprite.y += sprite.speed;
    
            // 移動範囲制限
            if (sprite.y < 0 + CONST.yume_size_quarter) sprite.y = 0 + CONST.yume_size_quarter;
            if (sprite.y > CONST.height - CONST.yume_size_quarter) sprite.y = CONST.height - CONST.yume_size_quarter;
    
            // 座標変更通知
            sprite.modified();
        },
        sprite // 第一引数functionのthisの指定
    );
}

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}