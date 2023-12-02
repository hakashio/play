window.gLocalAssetContainer["title_scene"] = function(g) { (function(exports, require, module, __filename, __dirname) {
var TitleLoad = require('./TitleLoad');

module.exports.create = function(param) {
    var scene = new g.Scene({
        game: g.game,
        // このシーンで利用するアセットのIDを列挙し、シーンに通知します
        assetIds: TitleLoad.getAssetIds(),
    });
    g.game.title_scene = scene;
    g.game.title_scene.param = param;

    scene.onLoad.add(function () {
        // ここからゲーム内容を記述します
        // 各アセットオブジェクトを取得します
        var images = TitleLoad.getImages();
        var audios = TitleLoad.getAudios();
        // スプライトを生成します
        var sprites = TitleLoad.getSprites(images);

        // BGM再生（設定は game.json）
        audios.yubae.play();

        // title
        sprites.title.touchable = true;
        sprites.title.onPointDown.add(function (ev) {
            g.game.executeScene('game_scene', 'replaceScene', g.game.title_scene.param);
        });
        scene.append(sprites.title);

        var updateHandler = function () {
            // update
        };
        scene.onUpdate.add(updateHandler);
        // ここまでゲーム内容を記述します
    });
    return scene;
};
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}