window.gLocalAssetContainer["CONST"] = function(g) { (function(exports, require, module, __filename, __dirname) {
// 画面
module.exports.width = g.game.width;
module.exports.height = g.game.height;
module.exports.cx = g.game.width / 2;
module.exports.cy = g.game.height / 2;

// assets 読み込みパス
module.exports.audio_path = '/assets/audio/*';
module.exports.image_path = '/assets/image/*';
module.exports.font_path = '/assets/font/*';
module.exports.asset_paths = [
    module.exports.audio_path,
    module.exports.image_path,
    module.exports.font_path,
];

// 重力加速度
module.exports.gravity = 0.2;

// 最大速度
module.exports.max_speed = 8;

// ゆめゆめ
module.exports.yume_size = 128;
module.exports.yume_size_half = module.exports.yume_size / 2;
module.exports.yume_size_quarter = module.exports.yume_size / 4;
module.exports.yume_start_x = 200;
module.exports.yume_start_y = 450;

// 背景
module.exports.back_speed = 0.5;
module.exports.back_opacity_change_time = 150000;
module.exports.back_opacity_speed = 0.00005;
module.exports.cloud1_speed = 2.5;
module.exports.cloud1_x = 200;
module.exports.cloud1_y = 100;
module.exports.cloud2_speed = 2.0;
module.exports.cloud2_scale = 0.85;
module.exports.cloud2_x = 1000;
module.exports.cloud2_y = 250;
module.exports.cloud3_speed = 1.5;
module.exports.cloud3_scale = 0.6;
module.exports.cloud3_x = 500;
module.exports.cloud3_y = 400;
module.exports.cloud4_speed = 1.0;
module.exports.cloud4_scale = 0.45;
module.exports.cloud4_x = 1200;
module.exports.cloud4_y = 550;

// 攻撃時間
module.exports.atack_time = 7638;
module.exports.atack_time_nicolive = 7638;
})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}