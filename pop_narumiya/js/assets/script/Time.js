window.gLocalAssetContainer["Time"] = function(g) { (function(exports, require, module, __filename, __dirname) {
var GameLoad = require('./GameLoad');
var Light = require('./Light');

module.exports.init = function () {
    var scene = g.game.game_scene;

    scene.time = {};
    scene.time.is_na = true;
    scene.time.is_naru = true;
    scene.time.is_narumi = true;
    scene.time.is_narumiya = true;
    module.exports.count();

    var timer_bar = new g.FilledRect({
        scene: scene,
        cssColor: 'lime',
        width: 10,
        height: 680,
        anchorX: 0.5,
        anchorY: 1,
        x: 594.5,
        y: 712, 
    });
    scene.timer_bar = timer_bar;
    timer_bar.onUpdate.add(function () {
        timer_bar.modified();
    });
    scene.append(timer_bar);
}

module.exports.createSprite = function (image) {
    return new g.Sprite({
        scene: g.game.game_scene,
        src: image,
        width: image.width,
        height: image.height,
        anchorX: 0.5,
        anchorY: 0.5,
        scaleX: 0.5,
        scaleY: 0.5,
        x: GameLoad.cx,
        y: 1080 / 2,
    });
}

module.exports.update = function (time) {
    module.exports.counting(time);
    module.exports.countEnding(time);
    module.exports.timing(time);
}

/**
 * カウントダウン開始
 */
module.exports.count = function () {
    g.game.game_scene.time.is_counting = true;
}

/**
 * カウントダウン中
 */
module.exports.counting = function (time) {
    if (!g.game.game_scene.time.is_counting) return;

    var scene = g.game.game_scene;
    var images = g.game.game_scene.images;
    var sprites = g.game.game_scene.sprites;

    if (g.game.game_scene.time.is_na && time <= 62) {
        g.game.game_scene.time.is_na = false;
        g.game.game_scene.audios.countdown.play();
        g.game.game_scene.sprites.light_7.opacity = 1;

        sprites.na = module.exports.createSprite(images.na);
        scene.append(sprites.na);
    }

    if (g.game.game_scene.time.is_naru && time <= 61.5) {
        g.game.game_scene.time.is_naru = false;
        g.game.game_scene.audios.countdown.play();
        g.game.game_scene.sprites.light_6.opacity = 1;

        sprites.na.destroy(true);
        sprites.naru = module.exports.createSprite(images.naru);
        scene.append(sprites.naru);
    }

    if (g.game.game_scene.time.is_narumi && time <= 61) {
        g.game.game_scene.time.is_narumi = false;
        g.game.game_scene.audios.countdown.play();
        g.game.game_scene.sprites.light_3.opacity = 1;

        sprites.naru.destroy(true);
        sprites.narumi = module.exports.createSprite(images.narumi);
        scene.append(sprites.narumi);
    }

    if (g.game.game_scene.time.is_narumiya && time <= 60.5) {
        g.game.game_scene.time.is_narumiya = false;
        g.game.game_scene.time.is_counting = false;
        g.game.game_scene.audios.game_start.play();

        sprites.narumi.destroy(true);
        sprites.narumiya = module.exports.createSprite(images.narumiya);
        scene.append(sprites.narumiya);
        
        module.exports.countEnd();
    }
}

/**
 * カウント終了
 */
module.exports.countEnd = function () {
    g.game.game_scene.time.is_count_ending = true;
    g.game.game_scene.time.count_end_timer = 20;

    var sprites = g.game.game_scene.sprites;

    Light.flash(sprites.light_7);
    Light.flash(sprites.light_6);
    Light.flash(sprites.light_3);
    Light.flash(sprites.light_8);
}

/**
 * カウント終了中
 */
module.exports.countEnding = function (time) {
    if (!g.game.game_scene.time.is_count_ending) return;

    var sprites = g.game.game_scene.sprites;

    if (time <= 60) {
        g.game.game_scene.time.is_count_ending = false;
        sprites.narumiya.destroy();
        module.exports.time();
        return;
    }

    g.game.game_scene.time.count_end_timer--;
}

/**
 * タイマー開始
 */
module.exports.time = function () {
    g.game.game_scene.time.is_timing = true;
    g.game.game_scene.time.is_count_3 = true;
    g.game.game_scene.time.is_count_2 = true;
    g.game.game_scene.time.is_count_1 = true;
}

/**
 * タイマー中
 */
module.exports.timing = function (time) {
    if (!g.game.game_scene.time.is_timing) return;

    var sprites = g.game.game_scene.sprites;

    // 時間終了時
    if (time <= 0) {
        g.game.game_scene.time.is_timing = false;
        module.exports.timeUp();
        return;
    }
    // 3カウントの音
    if (g.game.game_scene.time.is_count_3 && time <= 3) {
        g.game.game_scene.time.is_count_3 = false;
        g.game.game_scene.audios.countdown.play();
    }
    if (g.game.game_scene.time.is_count_2 && time <= 2) {
        g.game.game_scene.time.is_count_2 = false;
        g.game.game_scene.audios.countdown.play();
    }
    if (g.game.game_scene.time.is_count_1 && time <= 1) {
        g.game.game_scene.time.is_count_1 = false;
        g.game.game_scene.audios.countdown.play();
    }

    // 絵の具を削る
    g.game.game_scene.timer_bar.scaleY = (time / 60);
}

/**
 * タイムアップ
 */
module.exports.timeUp = function () {
    var scene = g.game.game_scene;
    var sprites = g.game.game_scene.sprites;

    g.game.game_scene.audios.time_up.play();
    
    // finish
    sprites.finish.x = 0;
    sprites.finish.y = 0;
    sprites.finish.anchorX = 0;
    sprites.finish.anchorY = 0;
    scene.append(sprites.finish);
    // スコア表示用のラベル
    var font = new g.DynamicFont({
        game: g.game,
        fontFamily: 'Arial',
        size: 36,
    });
    var narumiya_label = new g.Label({
        scene: scene,
        text: '' + g.game.vars.gameState.score,
        font: font,
        textColor: 'black',
        textAlign: 'center',
        widthAutoAdjust: false, // textAlign を変更する場合はfalseにする https://akashic-games.github.io/reference/akashic-engine-v3/classes/label.html#widthautoadjust
        width: g.game.width,
        x: -50,
        y: 124,
    });
    scene.append(narumiya_label);
    var score_label = new g.Label({
        scene: scene,
        text: '' + g.game.vars.gameState.score2,
        font: font,
        textColor: 'black',
        textAlign: 'center',
        widthAutoAdjust: false, // textAlign を変更する場合はfalseにする https://akashic-games.github.io/reference/akashic-engine-v3/classes/label.html#widthautoadjust
        width: g.game.width,
        x: -25,
        y: 197,
    });
    scene.append(score_label);

    // tweet
    sprites.tweet.x = 325;
    sprites.tweet.y = 330;
    sprites.tweet.show_timer = 45;
    sprites.tweet.hide();
    sprites.tweet.onUpdate.add(function () {
        if (!sprites.tweet.visible() && sprites.tweet.show_timer <= 0) {
            sprites.tweet.show();
        }
        sprites.tweet.show_timer--;
    });
    sprites.tweet.touchable = true;
    sprites.tweet.onPointDown.add(function (ev) {
        var text = g.game.vars.gameState.score
        + '%E3%83%8A%E3%83%AB%E3%83%9F%E3%83%A4%20'
        + g.game.vars.gameState.score2
        + '%E7%82%B9';

        var url = 'https://hakashio.github.io/play/pop_narumiya/';

        var hashtags = '%E3%83%9D%E3%83%83%E3%83%97%E3%83%8A%E3%83%AB%E3%83%9F%E3%83%A4';

        var share_link = 'https://twitter.com/share?url=' + url
        + '&text=' + text
        + '&hashtags=' + hashtags;

        // 別タブで開く
        window.open(share_link, '_blank');
    });
    scene.append(sprites.tweet);

    // retry
    sprites.retry.x = 325;
    sprites.retry.y = 450;
    sprites.retry.show_timer = 45;
    sprites.retry.hide();
    sprites.retry.onUpdate.add(function () {
        if (!sprites.retry.visible() && sprites.retry.show_timer <= 0) {
            sprites.retry.show();
        }
        sprites.retry.show_timer--;
    });
    sprites.retry.touchable = true;
    sprites.retry.onPointDown.add(function (ev) {
        g.game.executeScene('game_scene', 'replaceScene', g.game.game_scene.param);
    });
    scene.append(sprites.retry);
}

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}