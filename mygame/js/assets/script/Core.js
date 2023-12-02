window.gLocalAssetContainer["Core"] = function(g) { (function(exports, require, module, __filename, __dirname) {
var CONST = require('./CONST');

module.exports.createSprite = function (path, scene) {
    var image = scene.asset.getImage(path);
    return new g.Sprite({
        scene: scene,
        src: image,
        width: image.width,
        height: image.height,
        anchorX: 0.5,
        anchorY: 0.5,
        x: CONST.cx,
        y: CONST.cy,
    });
}

module.exports.rand = function (min, max) {
    return Math.floor(g.game.random.generate() * (max - min + 1) + min);
};

module.exports.getRadianByDegree = function(degree) {
    return degree * Math.PI / 180;
};

module.exports.getRadianByPoints = function(ax, ay, bx, by) {
    return Math.atan2(by - ay, bx - ax);
};

module.exports.getMove = function(radian, speed) {
    var vx = Math.cos(radian) * speed;
    var vy = Math.sin(radian) * speed;
    return {vx, vy};
};
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}