window.gLocalAssetContainer["TitleLoad"] = function(g) { (function(exports, require, module, __filename, __dirname) {
module.exports.audio_ids = [
    'yubae',
];

module.exports.image_ids = [
    'title',
];

module.exports.getAssetIds = function () {
    return module.exports.audio_ids.concat(module.exports.image_ids);
}

module.exports.getAudios = function () {
    var scene = g.game.title_scene;
    var result = {};
    module.exports.audio_ids.forEach(function (value) {
        result[value] = scene.asset.getAudioById(value);
    });
    return result;
}

module.exports.getImages = function () {
    var scene = g.game.title_scene;
    var result = {};
    module.exports.image_ids.forEach(function (value) {
        result[value] = scene.asset.getImageById(value);
    });
    return result;
}

module.exports.createSprite = function (image) {
    var scene = g.game.title_scene;
    return new g.Sprite({
        scene: scene,
        src: image,
        width: image.width,
        height: image.height
    });
}

module.exports.getSprites = function (images) {
    var scene = g.game.title_scene;
    var result = {};
    Object.keys(images).forEach(function (key) {
        var image = images[key];
        result[key] = new g.Sprite({
            scene: scene,
            src: image,
            width: image.width,
            height: image.height,
            scaleX: 0.5,
            scaleY: 0.5,
        });
    });
    return result;
}

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}