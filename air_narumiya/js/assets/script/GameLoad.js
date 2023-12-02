window.gLocalAssetContainer["GameLoad"] = function(g) { (function(exports, require, module, __filename, __dirname) {
var CONST = require('./CONST');
var Core = require('./Core');
var Miss = require('./Miss');

module.exports.init = function () {
    module.exports.initSprites();
}

module.exports.initSprites = function () {
    var scene = g.game.game_scene;

    // 背景変化開始時間をセット
    scene.is_cloud_opacity_change
    var timer_identifier = scene.setTimeout(function () {
            scene.is_cloud_opacity_change = true;
        }, CONST.back_opacity_change_time)
    scene.timeout_identifiers.push(timer_identifier);

    // 環境によっては背景繋ぎ目が見えるため、後ろに固定表示しておく
    var back_fixed_sprite = Core.createSprite('/assets/image/back_a.jpg', scene);
    scene.sprites.push(back_fixed_sprite);
    scene.layers.back.append(back_fixed_sprite);

    // 背景A左側
    var back_a1_sprite = Core.createSprite('/assets/image/back_a.jpg', scene);
    scene.sprites.push(back_a1_sprite);
    scene.layers.back.append(back_a1_sprite);
    back_a1_sprite.x = CONST.cx;
    back_a1_sprite.onUpdate.add(
        function () {
            this.x -= CONST.back_speed;
            if (this.x < -CONST.cx) {
                this.x = CONST.cx;
            }
            this.modified(); // 座標変更通知
        },
        back_a1_sprite // 第一引数functionのthisの指定
    );

    // 背景A右側
    var back_a2_sprite = Core.createSprite('/assets/image/back_a.jpg', scene);
    scene.sprites.push(back_a2_sprite);
    scene.layers.back.append(back_a2_sprite);
    back_a2_sprite.x = CONST.cx + CONST.width;
    back_a2_sprite.onUpdate.add(
        function () {
            this.x -= CONST.back_speed;
            if (this.x < CONST.cx) {
                this.x = CONST.cx + CONST.width;
            }
            this.modified(); // 座標変更通知
        },
        back_a2_sprite // 第一引数functionのthisの指定
    );
    

    // 背景B左側
    var back_b1_sprite = Core.createSprite('/assets/image/back_b.jpg', scene);
    scene.sprites.push(back_b1_sprite);
    scene.layers.back.append(back_b1_sprite);
    back_b1_sprite.x = CONST.cx;
    back_b1_sprite.opacity = 0;
    back_b1_sprite.onUpdate.add(
        function () {
            this.x -= CONST.back_speed;
            if (this.x < -CONST.cx) {
                this.x = CONST.cx;
            }
            if (scene.is_cloud_opacity_change) back_b1_sprite.opacity += CONST.back_opacity_speed;
            this.modified(); // 座標変更通知
        },
        back_b1_sprite // 第一引数functionのthisの指定
    );

    // 背景B右側
    var back_b2_sprite = Core.createSprite('/assets/image/back_b.jpg', scene);
    scene.sprites.push(back_b2_sprite);
    scene.layers.back.append(back_b2_sprite);
    back_b2_sprite.x = CONST.cx + CONST.width;
    back_b2_sprite.opacity = 0;
    back_b2_sprite.onUpdate.add(
        function () {
            this.x -= CONST.back_speed;
            if (this.x < CONST.cx) {
                this.x = CONST.cx + CONST.width;
            }
            if (scene.is_cloud_opacity_change) back_b2_sprite.opacity += CONST.back_opacity_speed;
            this.modified(); // 座標変更通知
        },
        back_b2_sprite // 第一引数functionのthisの指定
    );

    // 雲1番上
    var cloud1_sprite = Core.createSprite('/assets/image/cloud.png', scene);
    scene.sprites.push(cloud1_sprite);
    scene.layers.back.append(cloud1_sprite);
    cloud1_sprite.x = CONST.cloud1_x;
    cloud1_sprite.y = CONST.cloud1_y;
    cloud1_sprite.onUpdate.add(
        function () {
            this.x -= CONST.cloud1_speed;
            if (this.x < -CONST.cloud1_x) {
                this.x = CONST.width + CONST.cloud1_x;
            }
            this.modified(); // 座標変更通知
        },
        cloud1_sprite // 第一引数functionのthisの指定
    );

    // 雲2番目
    var cloud2_sprite = Core.createSprite('/assets/image/cloud.png', scene);
    scene.sprites.push(cloud2_sprite);
    scene.layers.back.append(cloud2_sprite);
    cloud2_sprite.x = CONST.cloud2_x;
    cloud2_sprite.y = CONST.cloud2_y;
    cloud2_sprite.scaleX = CONST.cloud2_scale;
    cloud2_sprite.scaleY = CONST.cloud2_scale;
    cloud2_sprite.onUpdate.add(
        function () {
            this.x -= CONST.cloud2_speed;
            if (this.x < -this.width) {
                this.x = CONST.width + this.width;
            }
            this.modified(); // 座標変更通知
        },
        cloud2_sprite // 第一引数functionのthisの指定
    );

    // 雲3番目
    var cloud3_sprite = Core.createSprite('/assets/image/cloud.png', scene);
    scene.sprites.push(cloud3_sprite);
    scene.layers.back.append(cloud3_sprite);
    cloud3_sprite.x = CONST.cloud3_x;
    cloud3_sprite.y = CONST.cloud3_y;
    cloud3_sprite.scaleX = CONST.cloud3_scale;
    cloud3_sprite.scaleY = CONST.cloud3_scale;
    cloud3_sprite.onUpdate.add(
        function () {
            this.x -= CONST.cloud3_speed;
            if (this.x < -this.width) {
                this.x = CONST.width + this.width;
            }
            this.modified(); // 座標変更通知
        },
        cloud3_sprite // 第一引数functionのthisの指定
    );

    // 雲4番目
    var cloud4_sprite = Core.createSprite('/assets/image/cloud.png', scene);
    scene.sprites.push(cloud4_sprite);
    scene.layers.back.append(cloud4_sprite);
    cloud4_sprite.x = CONST.cloud4_x;
    cloud4_sprite.y = CONST.cloud4_y;
    cloud4_sprite.scaleX = CONST.cloud4_scale;
    cloud4_sprite.scaleY = CONST.cloud4_scale;
    cloud4_sprite.onUpdate.add(
        function () {
            this.x -= CONST.cloud4_speed;
            if (this.x < -this.width) {
                this.x = CONST.width + this.width;
            }
            this.modified(); // 座標変更通知
        },
        cloud4_sprite // 第一引数functionのthisの指定
    );

    // 練習おわり
    if (g.game.vars.mode === 'P') {
        var button_practice_end_sprite = Core.createSprite('/assets/image/button_practice_end.png', scene);
        button_practice_end_sprite.scaleX = 0.5;
        button_practice_end_sprite.scaleY = 0.5;
        button_practice_end_sprite.x = 1170;
        button_practice_end_sprite.y = 50;
        button_practice_end_sprite.touchable = true;
        button_practice_end_sprite.onPointDown.add(function (ev) {
            g.game.vars.mode = g.game.vars.mode_origin;
            g.game.executeScene('title_scene', 'replaceScene', g.game.game_scene.param);
        });
        scene.layers.front.append(button_practice_end_sprite);
    }

    // デバッグ用自爆スイッチ
    if (g.game.vars.mode === 'D') {
        var miss_sprite = Core.createSprite('/assets/image/b64.png', scene);
        miss_sprite.x = 1200;
        miss_sprite.y = 700;
        miss_sprite.touchable = true;
        miss_sprite.onPointDown.add(function (ev) {
            Miss.miss(this);
        }, miss_sprite);
        scene.layers.front.append(miss_sprite);
    }
}


})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}