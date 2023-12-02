window.gLocalAssetContainer["game_scene"] = function(g) { (function(exports, require, module, __filename, __dirname) {
var GameLoad = require('./GameLoad');
var Yume = require('./Yume');
var Block = require('./Block');
var Light = require('./Light');
var Time = require('./Time');

module.exports.create = function(param) {
    var scene = new g.Scene({
        game: g.game,
        // このシーンで利用するアセットのIDを列挙し、シーンに通知します
        assetIds: GameLoad.getAssetIds(),
    });
    g.game.game_scene = scene;
    g.game.game_scene.param = param;
    g.game.vars.gameState = {};

    // スコア初期化（リトライ用）
    g.game.vars.gameState.score = 0;
    g.game.vars.gameState.score2 = 0;

    var time = 62; // 制限時間

    // デバッグ用 ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
    // var time = 1; // 制限時間
    // ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊

    scene.onLoad.add(function () {
        // ここからゲーム内容を記述します
        
        // 各アセットオブジェクトを取得します
        GameLoad.init();
        var images = g.game.game_scene.images;
        var audios = g.game.game_scene.audios;
        var sprites = g.game.game_scene.sprites;

        // スコア・タイム表示
        // フォントの生成
        var font = new g.DynamicFont({
            game: g.game,
            fontFamily: 'Arial',
            size: 20,
        });
        // スコア表示用のラベル
        var score_label = new g.Label({
            scene: scene,
            text: '0',
            font: font,
            textColor: 'black',
            textAlign: 'center',
            widthAutoAdjust: false, // textAlign を変更する場合はfalseにする https://akashic-games.github.io/reference/akashic-engine-v3/classes/label.html#widthautoadjust
            width: g.game.width,
            y: 637,
        });
        g.game.game_scene.score_label = score_label;
        scene.append(score_label);
        // 残り時間表示用ラベル
        var time_label = new g.Label({
            scene: scene,
            text: '0',
            font: font,
            textColor: 'green',
            textAlign: 'center',
            widthAutoAdjust: false, // textAlign を変更する場合はfalseにする https://akashic-games.github.io/reference/akashic-engine-v3/classes/label.html#widthautoadjust
            width: g.game.width,
            x: 283,
            y: 745,
        });
        g.game.game_scene.time_label = time_label;
        scene.append(time_label);

        // ゆめゆめ
        Yume.init();
        var yume = g.game.game_scene.yume;

        // 7638ライト配置
        Light.init();

        // 初期ブロック配置
        Block.init();

        // カウントダウン
        Time.init();

        // 画面をタッチしたとき
        scene.onPointDownCapture.add(function (ev) {
            var x = ev.point.x;
            var y = ev.point.y;

            // 各レーンのタッチイベント
            for (let i = 0; i < 5; i++) {
                if (GameLoad.block_x[i] - GameLoad.square_half <= x && x < GameLoad.block_x[i] + GameLoad.square_half) {
                    if (yume.is_standing || yume.is_holding) {
                        Yume.move(i);
                    }
                    Yume.catch();
                    Yume.throw();
                }
            }
        });

        var updateHandler = function () {
            var show_time = Math.ceil(time);
            if (show_time > 60) show_time = 60;
            time_label.text = '' + show_time;
            time_label.invalidate();

            Time.update(time);

            if (time <= 0) {
                scene.onUpdate.remove(updateHandler); // カウントダウンを止めるためにこのイベントハンドラを削除します
            }

            // カウントダウン処理
            time -= 1 / g.game.fps;
            g.game.game_scene.time.time = time;
        };
        scene.onUpdate.add(updateHandler);
        // ここまでゲーム内容を記述します
    });
    return scene;
};
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}