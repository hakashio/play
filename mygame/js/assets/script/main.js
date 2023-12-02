window.gLocalAssetContainer["main"] = function(g) { (function(exports, require, module, __filename, __dirname) {
var title_scene = require('./title_scene');
var game_scene = require('./game_scene');

g.game.executeScene = function (name, method, param) {
    if (name == 'title_scene' && method == 'pushScene') {
        g.game.pushScene(title_scene.create(param));
    }
    if (name == 'game_scene' && method == 'pushScene') {
        g.game.pushScene(game_scene.create(param));
    }

    if (name == 'title_scene' && method == 'replaceScene') {
        g.game.replaceScene(title_scene.create(param));
    }
    if (name == 'game_scene' && method == 'replaceScene') {
        g.game.replaceScene(game_scene.create(param));
    }
};

function main(param) {
    // マスター音量調整
    g.game.audio.music.volume = 0.2;
    g.game.audio.sound.volume = 0.7;

    // 市場コンテンツのランキングモードでは、g.game.vars.gameState.score の値をスコアとして扱います
    g.game.vars.gameState = { 
        score: 0,
        score2: 0,
    };

    // モード A:アツマール L:生放送 D:デバッグ P:練習
    if (param.isAtsumaru) {
        g.game.vars.mode_origin = 'A';
    } else {
        g.game.vars.mode_origin = 'L';
    }

    // ＊＊＊＊＊＊＊＊＊＊デバッグモード指定＊＊＊＊＊＊＊＊＊＊
    // g.game.vars.mode_origin = 'L';
    // g.game.vars.mode_origin = 'D';
    g.game.vars.mode_origin = 'A';
    // ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊

    g.game.vars.mode = g.game.vars.mode_origin;

    // ツイート内容差し替え
    // if (g.game.vars.mode === 'A') {
    //     window.RPGAtsumaru.screenshot.setTweetMessage({
    //         tweetText: '#エアーナルミヤ',
    //     });
    // }

    if (g.game.vars.mode === 'A') {
        // アツマールはタイトルから開始
        g.game.executeScene('title_scene', 'pushScene', param);
    }
    if (g.game.vars.mode === 'L') {
        // 生放送はゲームから開始
        g.game.executeScene('game_scene', 'pushScene', param);
    }
    if (g.game.vars.mode === 'D') {
        // デバッグはタイトルから開始
        g.game.executeScene('title_scene', 'pushScene', param);
    }
    
}

exports.main = main;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}