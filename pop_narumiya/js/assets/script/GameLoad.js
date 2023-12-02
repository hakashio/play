window.gLocalAssetContainer["GameLoad"] = function(g) { (function(exports, require, module, __filename, __dirname) {
module.exports.audio_ids = [
    'yubae',
    'light_on',
    'block_catch',
    'block_hit',
    'block_throw',
    'button',
    'countdown',
    'game_start',
    'complete',
    'time_up',
];

module.exports.image_ids = [
    'yume',
    'back',
    'timer',
    'na',
    'naru',
    'narumi',
    'narumiya',
    'finish',
    'retry',
    'tweet',
    'score_board',
    'screen_shot',
    'light_7',
    'light_6',
    'light_3',
    'light_8',
    'dango',
    'block_1',
    'block_2',
    'block_3',
    'block_4',
    'block_5',
    'block_6',
    'block_7',
    'block_8',
    'block_9',
    'block_10',
];


module.exports.init = function () {
    module.exports.getAudios();
    module.exports.getImages();
    module.exports.getSprites();
    module.exports.initSprites();
}

module.exports.getAssetIds = function () {
    return module.exports.audio_ids.concat(module.exports.image_ids);
}

module.exports.cx = g.game.width / 2;
module.exports.cy = g.game.height / 2;

module.exports.block_x = [
    224 / 2,
    424 / 2,
    624 / 2,
    824 / 2,
    1024 / 2
];

module.exports.block_y = [
    100 / 2,
    300 / 2,
    500 / 2,
    700 / 2,
    900 / 2
];

module.exports.square_size = 200 / 2;
module.exports.square_half = module.exports.square_size / 2;

module.exports.getAudios = function () {
    var scene = g.game.game_scene;

    var result = {};
    module.exports.audio_ids.forEach(function (value) {
        result[value] = scene.asset.getAudioById(value);
    });
    scene.audios = result;
    return result;
}

module.exports.getImages = function () {
    var scene = g.game.game_scene;

    var images = {};
    module.exports.image_ids.forEach(function (value) {
        images[value] = scene.asset.getImageById(value);
    });
    scene.images = images;
    return images;
}

module.exports.createSprite = function (image) {
    var scene = g.game.game_scene;

    return new g.Sprite({
        scene: scene,
        src: image,
        width: image.width,
        height: image.height,
        anchorX: 0.5,
        anchorY: 0.5,
    });
}

module.exports.getSprites = function () {
    var scene = g.game.game_scene;
    var images = g.game.game_scene.images;

    var sprites = {};
    Object.keys(images).forEach(function (key) {
        var image = images[key];
        sprites[key] = new g.Sprite({
            scene: scene,
            src: image,
            width: image.width,
            height: image.height,
            anchorX: 0.5,
            anchorY: 0.5,
            x: module.exports.cx,
            y: module.exports.cy,
            scaleX: 0.5,
            scaleY: 0.5,
        });
    });
    scene.sprites = sprites;
    return sprites;
}

module.exports.initSprites = function () {
    var scene = g.game.game_scene;
    var sprites = g.game.game_scene.sprites;

    // back
    scene.append(sprites.back);
    // light
    scene.append(sprites.light_7);
    scene.append(sprites.light_6);
    scene.append(sprites.light_3);
    scene.append(sprites.light_8);
    // dango
    sprites.dango.y = 1500 / 2;
    scene.append(sprites.dango);
    // timer
    sprites.timer.x = 1190 / 2;
    sprites.timer.y = 1500 / 2;
    scene.append(sprites.timer);
}


})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}