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

module.exports.p = {
    fan: [],
    power: [],
    cost: [],
};

// ファン
module.exports.p.fan = [];
module.exports.p.fan[1] = 0n;
module.exports.p.fan[2] = 1n;
module.exports.p.fan[3] = 8n;
module.exports.p.fan[4] = 67n;
module.exports.p.fan[5] = 571n;
module.exports.p.fan[6] = 5000n;
module.exports.p.fan[7] = 44444n;
module.exports.p.fan[8] = 400000n;
module.exports.p.fan[9] = 3630000n;
module.exports.p.fan[10] = 33330000n;
module.exports.p.fan[11] = 307692308n;
module.exports.p.fan[12] = 3428571429n;
module.exports.p.fan[13] = 76800000000n;
module.exports.p.fan[14] = 2592000000000n;
module.exports.p.fan[15] = 117000000000000n;

// すこぢから
module.exports.p.power = [];
module.exports.p.power[1] = 0n;
module.exports.p.power[2] = 1n;
module.exports.p.power[3] = 1n;
module.exports.p.power[4] = 6n;
module.exports.p.power[5] = 52n;
module.exports.p.power[6] = 500n;
module.exports.p.power[7] = 4938n;
module.exports.p.power[8] = 50000n;
module.exports.p.power[9] = 510000n;
module.exports.p.power[10] = 5550000n;
module.exports.p.power[11] = 61530000n;
module.exports.p.power[12] = 857142857n;
module.exports.p.power[13] = 25600000000n;
module.exports.p.power[14] = 1296000000000n;
module.exports.p.power[15] = 117000000000000n;

// 必要すこ
module.exports.p.cost = [];
module.exports.p.cost[1] =  0n;
module.exports.p.cost[2] =  10n;
module.exports.p.cost[3] =  100n;
module.exports.p.cost[4] =  1000n;
module.exports.p.cost[5] =  10000n;
module.exports.p.cost[6] =  100000n;
module.exports.p.cost[7] =  1000000n;
module.exports.p.cost[8] =  10000000n;
module.exports.p.cost[9] =  100000000n;
module.exports.p.cost[10] = 1000000000n;
module.exports.p.cost[11] = 10000000000n;
module.exports.p.cost[12] = 120000000000n;
module.exports.p.cost[13] = 2880000000000n;
module.exports.p.cost[14] = 103680000000000n;
module.exports.p.cost[15] = 5000000000000000n;

// 準備中
module.exports.p.is_junbi = [];
module.exports.p.is_junbi[1] = false;
module.exports.p.is_junbi[2] = false;
module.exports.p.is_junbi[3] = false;
module.exports.p.is_junbi[4] = false;
module.exports.p.is_junbi[5] = false;
module.exports.p.is_junbi[6] = false;
module.exports.p.is_junbi[7] = true;
module.exports.p.is_junbi[8] = true;
module.exports.p.is_junbi[9] = true;
module.exports.p.is_junbi[10] = true;
module.exports.p.is_junbi[11] = true;
module.exports.p.is_junbi[12] = true;
module.exports.p.is_junbi[13] = true;
module.exports.p.is_junbi[14] = true;
module.exports.p.is_junbi[15] = true;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}