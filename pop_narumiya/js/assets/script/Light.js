window.gLocalAssetContainer["Light"] = function(g) { (function(exports, require, module, __filename, __dirname) {
module.exports.init = function () {
    var sprites = g.game.game_scene.sprites;

    sprites.light_7.opacity = 0;
    sprites.light_6.opacity = 0;
    sprites.light_3.opacity = 0;
    sprites.light_8.opacity = 0;

    sprites.light_7.onUpdate.add(function () {
        module.exports.flashing(sprites.light_7);
        sprites.light_7.modified();
    });
    sprites.light_6.onUpdate.add(function () {
        module.exports.flashing(sprites.light_6);
        sprites.light_6.modified();
    });
    sprites.light_3.onUpdate.add(function () {
        module.exports.flashing(sprites.light_3);
        sprites.light_3.modified();
    });
    sprites.light_8.onUpdate.add(function () {
        module.exports.flashing(sprites.light_8);
        sprites.light_8.modified();
    });
}

/**
 * 7638ライト点灯
 */
module.exports.on = function (break_block_number) {
    var sprites = g.game.game_scene.sprites;

    if (break_block_number == 7 && sprites.light_7.opacity == 0) {
        g.game.game_scene.audios.light_on.play();
        sprites.light_7.opacity = 1;
    }
    if (break_block_number == 6 && sprites.light_6.opacity == 0 && sprites.light_7.opacity == 1) {
        g.game.game_scene.audios.light_on.play();
        sprites.light_6.opacity = 1;
    }
    if (break_block_number == 3 && sprites.light_3.opacity == 0 && sprites.light_6.opacity == 1) {
        g.game.game_scene.audios.light_on.play();
        sprites.light_3.opacity = 1;
    }
    if (break_block_number == 8 && sprites.light_8.opacity == 0 && sprites.light_3.opacity == 1) {
        g.game.game_scene.audios.light_on.play();
        sprites.light_8.opacity = 1;
        // スコアアップ
        g.game.game_scene.audios.complete.play();
        g.game.vars.gameState.score++;
        g.game.vars.gameState.score2 += 7638;
        g.game.game_scene.score_label.text = '' + g.game.vars.gameState.score2;
        g.game.game_scene.score_label.invalidate();
        module.exports.flash(sprites.light_7);
        module.exports.flash(sprites.light_6);
        module.exports.flash(sprites.light_3);
        module.exports.flash(sprites.light_8);
    }
}

// 点滅させる
module.exports.flash = function (sprite) {
    sprite.is_flashing = true;
    sprite.up_timer = 20;
    sprite.opacity = 0;
}

// 点滅中のアニメーション
module.exports.flashing = function (sprite) {
    if (!sprite.is_flashing) return;

    if (sprite.up_timer <= 0) {
        sprite.is_flashing = false;
        sprite.opacity = 0;
        return;
    }
    if (sprite.up_timer % 3 === 0) {
        // アルファ値 0と1を繰り返す
        if (sprite.opacity === 0) {
            sprite.opacity = 1;
        } else {
            sprite.opacity = 0;
        }
    }
    sprite.up_timer--;
}

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}