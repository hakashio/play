window.gLocalAssetContainer["game_scene"] = function(g) { (function(exports, require, module, __filename, __dirname) {
var CONST = require('./CONST');
var Core = require('./Core');
var GameLoad = require('./GameLoad');
var Yume = require('./Yume');
var Note = require('./Note');
var Miss = require('./Miss');

module.exports.create = function(param) {
    var scene = new g.Scene({
        game: g.game,
        // このシーンで利用するアセットのIDを列挙し、シーンに通知します
        assetPaths: CONST.asset_paths,
    });
    g.game.game_scene = scene;

    // タイトルで下げていた音量を戻す
    g.game.audio.sound.volume = 0.7;

    // シーンのプロパティを定義
    scene.param = param;
    scene.images = {};
    scene.audios = {};
    scene.layers = {};
    scene.sprites = [];
    scene.interval_identifiers = [];
    scene.timeout_identifiers = [];
    scene.is_ending = false;
    scene.score = 0; // スコア
    scene.life = 100; // ライフ

    // 表示順別ごとにエンティティをグループ化するための E を作成
    scene.layers.back = new g.E({ scene: scene });
    scene.layers.yume = new g.E({ scene: scene });
    scene.layers.note_back = new g.E({ scene: scene });
    scene.layers.note_front = new g.E({ scene: scene });
    scene.layers.front = new g.E({ scene: scene });
    scene.layers.tutorial = new g.E({ scene: scene });
    scene.layers.result = new g.E({ scene: scene });
    // シーンに表示順で追加しておく
    scene.append(scene.layers.back);
    scene.append(scene.layers.yume);
    scene.append(scene.layers.note_back);
    scene.append(scene.layers.note_front);
    scene.append(scene.layers.front);
    scene.append(scene.layers.tutorial);
    scene.append(scene.layers.result);

    // スコア初期化（リトライ用）
    g.game.vars.gameState.score = scene.score;
    if (g.game.vars.mode === 'L') {
        // 生放送の場合はライフ
        g.game.vars.gameState.score = scene.life;
    }

    var time = 140; // 制限時間

    if (param.sessionParameter.totalTimeLimit) {
        time = param.sessionParameter.totalTimeLimit; // セッションパラメータで制限時間が指定されたらその値を使用します
    }

    scene.onLoad.add(function () {
        // ここからゲーム内容を記述します
        GameLoad.init();
        Yume.init();
        Note.init();
        Miss.init();

        // BGM
        scene.asset.getAudio('/assets/audio/title').stop();
        scene.asset.getAudio('/assets/audio/yubae').play();

        // スコア・タイム表示
        // フォントの生成
        var font_asset = scene.asset.getImage('/assets/font/font.png');
        var font_glyph_asset = scene.asset.getText('/assets/font/font_glyphs.json');
        // テキストアセット (JSON) の内容をオブジェクトに変換
        var glyph_info = JSON.parse(font_glyph_asset.data);
        // ビットマップフォントを生成
        var font = new g.BitmapFont({
            src: font_asset,
            glyphInfo: glyph_info
        });

        // スコア表示用ラベル
        var score_label = new g.Label({
            scene: scene,
            text: '0',
            font: font,
            textAlign: 'right',
            widthAutoAdjust: false, // textAlign を変更する場合はfalseにする https://akashic-games.github.io/reference/akashic-engine-v3/classes/label.html#widthautoadjust
            width: g.game.width,
            x: -350,
            y: 0,
            scaleX: 0.75,
            scaleY: 0.75,
        });
        g.game.game_scene.score_label = score_label;
        scene.layers.front.append(score_label);
        // メートル/ライフ表示用ラベル
        var label_text = 'メートル';
        if (g.game.vars.mode === 'L') label_text = 'ライフ';
        var m_label = new g.Label({
            scene: scene,
            text: label_text,
            font: font,
            textAlign: 'left',
            widthAutoAdjust: false, // textAlign を変更する場合はfalseにする https://akashic-games.github.io/reference/akashic-engine-v3/classes/label.html#widthautoadjust
            width: g.game.width,
            x: 620,
            y: 15,
            scaleX: 0.5,
            scaleY: 0.5,
        });
        g.game.game_scene.score_label = m_label;
        scene.layers.front.append(m_label);

        // チュートリアル
        var tutorial_sprite = Core.createSprite('/assets/image/tutorial.png', scene);
        scene.sprites.push(tutorial_sprite);
        scene.layers.tutorial.append(tutorial_sprite);
        tutorial_sprite.y = 250;
        tutorial_sprite.opacity = 0;
        tutorial_sprite.opacity_speed = 0;
        tutorial_sprite.onUpdate.add(function () {
            this.opacity += this.opacity_speed;
            if (this.opacity < 0) this.destroy(true);
        }, tutorial_sprite);
        // 一定時間後にフェードイン
        var timer_identifier_in = scene.setTimeout(function () {
            tutorial_sprite.opacity_speed = 0.01;
        }, 100);
        scene.timeout_identifiers.push(timer_identifier_in);
        // 一定時間後にフェードアウト
        var timer_identifier_out = scene.setTimeout(function () {
            tutorial_sprite.opacity_speed = -0.02;
        }, 6500);
        scene.timeout_identifiers.push(timer_identifier_out);

        // 画面をタッチしたとき
        scene.onPointDownCapture.add(function (ev) {
            var x = ev.point.x;
            var y = ev.point.y;
            scene.yume.is_flying = true;
        });

        // 画面のタッチを離したとき
        scene.onPointUpCapture.add(function (ev) {
            var x = ev.point.x;
            var y = ev.point.y;
            scene.yume.is_flying = false;
        });

        var updateHandler = function () {
            // スコア更新
            var set_score = Math.floor(scene.score);
            if (g.game.vars.mode === 'L') {
                // 生放送の場合はライフ
                set_score = scene.life;
            }
            g.game.vars.gameState.score = set_score;
            score_label.text = String(set_score);
            score_label.invalidate();

            // スコア（1分で約1000メートル）
            scene.score += 16.667 / g.game.fps;

            // カウントダウン処理
            time -= 1 / g.game.fps;

            if (scene.is_ending) {
                scene.onUpdate.remove(updateHandler);
            }
        };
        scene.onUpdate.add(updateHandler);
        // ここまでゲーム内容を記述します
    });
    return scene;
};
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}