window.gLocalAssetContainer["Miss"] = function(g) { (function(exports, require, module, __filename, __dirname) {
var CONST = require('./CONST');
var Core = require('./Core');

module.exports.init = function () {
    var scene = g.game.game_scene;

    scene.miss = {};

    // オブジェクト変数
    scene.miss.is_missing = false;
}

module.exports.miss = function (sprite) {
    var scene = g.game.game_scene;

    // 効果音
    scene.asset.getAudio('/assets/audio/hit').play();

    if (g.game.vars.mode === 'A') {
        module.exports.atsumaru();
    }
    if (g.game.vars.mode === 'L') {
        module.exports.nicolive(sprite);
    }
    if (g.game.vars.mode === 'D') {
        module.exports.atsumaru();
    }
    if (g.game.vars.mode === 'P') {
        module.exports.practice(sprite);
    }
}

// アツマールの場合
module.exports.atsumaru = function () {
    var scene = g.game.game_scene;

    scene.is_ending = true;

    // チュートリアル非表示
    scene.layers.tutorial.hide();

    // 羽ばたきを停止
    scene.yume.sprite.loop = false;

    // 各spriteのupdateを破棄
    for (var i = 0; i < scene.sprites.length; i++) {
        if (!scene.sprites[i].destroyed()) {
            scene.sprites[i].onUpdate.removeAll();
        }
    }

    // intervalを破棄
    for (var i = 0; i < scene.interval_identifiers.length; i++) {
        if (!scene.interval_identifiers[i].destroyed()) {
            scene.clearInterval(scene.interval_identifiers[i]);
        }
    }

    // timeoutを破棄
    for (var i = 0; i < scene.timeout_identifiers.length; i++) {
        if (!scene.timeout_identifiers[i].destroyed()) {
            scene.clearTimeout(scene.timeout_identifiers[i]);
        }
    }

    // 一定時間後各ボタン表示
    var timer_identifier = scene.setTimeout(function () {
        // リスタート
        var button_restart_sprite = Core.createSprite('/assets/image/button_restart.png', scene);
        button_restart_sprite.x = CONST.cx;
        button_restart_sprite.y = 300;
        button_restart_sprite.touchable = true;
        button_restart_sprite.onPointDown.add(function (ev) {
            g.game.executeScene('game_scene', 'replaceScene', g.game.game_scene.param);
        });
        scene.layers.result.append(button_restart_sprite);

        // Twitter
        var button_twitter_sprite = Core.createSprite('/assets/image/button_twitter.png', scene);
        button_twitter_sprite.scaleX = 0.75;
        button_twitter_sprite.scaleY = 0.75;
        button_twitter_sprite.x = CONST.cx;
        button_twitter_sprite.y = 500;
        button_twitter_sprite.touchable = true;
        button_twitter_sprite.onPointDown.add(function (ev) {
            var text = g.game.vars.gameState.score + '%E3%83%A1%E3%83%BC%E3%83%88%E3%83%AB';

            var url = 'https://hakashio.github.io/play/air_narumiya/';

            var hashtags = '%E3%82%A8%E3%82%A2%E3%83%BC%E3%83%8A%E3%83%AB%E3%83%9F%E3%83%A4';

            var share_link = 'https://twitter.com/share?url=' + url
            + '&text=' + text
            + '&hashtags=' + hashtags;

            // 別タブで開く
            window.open(share_link, '_blank');
        });
        scene.layers.result.append(button_twitter_sprite);

        // タイトルに戻るボタン
        var button_title_back_sprite = Core.createSprite('/assets/image/button_title_back.png', scene);
        button_title_back_sprite.scaleX = 0.5;
        button_title_back_sprite.scaleY = 0.5;
        button_title_back_sprite.x = 1170;
        button_title_back_sprite.y = 50;
        button_title_back_sprite.touchable = true;
        button_title_back_sprite.onPointDown.add(function (ev) {
            g.game.vars.mode = g.game.vars.mode_origin;
            g.game.executeScene('title_scene', 'replaceScene', g.game.game_scene.param);
        });
        scene.layers.result.append(button_title_back_sprite);
    }, 750);
    scene.timeout_identifiers.push(timer_identifier);
}

// 生放送の場合
module.exports.nicolive = function (sprite) {
    var scene = g.game.game_scene;

    // スプライト消去
    sprite.destroy(true);
    // ダメージ
    scene.life--;
    if (scene.life < 0) scene.life = 0;
}

// 練習モードの場合
module.exports.practice = function (sprite) {
    var scene = g.game.game_scene;

    // スプライト消去
    sprite.destroy(true);
}

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}