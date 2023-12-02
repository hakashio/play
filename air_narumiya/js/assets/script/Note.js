window.gLocalAssetContainer["Note"] = function(g) { (function(exports, require, module, __filename, __dirname) {
var CONST = require('./CONST');
var Core = require('./Core');
var Miss = require('./Miss');

module.exports.init = function () {
    var scene = g.game.game_scene;
    scene.note = {};
    scene.note.is_shooting = false;
    scene.note.sprite_count = 0;
    // 攻撃
    scene.note.atack_time = CONST.atack_time; // 攻撃時間
    scene.note.wave = 0; // 何回目か
    scene.note.loop = 0; // waveが何ループ目か
    // 生放送の場合は特殊
    if (g.game.vars.mode === 'L') {
        scene.note.atack_time = CONST.atack_time_nicolive; // 攻撃時間
        scene.note.loop = 2; // waveが何ループ目か
    }

    // 照射が終わっているか監視し、次の攻撃を行う
    var timer_identifier = scene.setInterval(function() {
        // ゲーム終了時は攻撃しない
        if (scene.is_ending) return;

        if (
            !scene.note.is_shooting &&
            scene.note.sprite_count <= 0
        ) {
            module.exports.shoot();
        }
    }, 100);
    scene.interval_identifiers.push(timer_identifier);
}

// 基本の攻撃
module.exports.basic = function (
    y_is_targeting, // 発射位置自機狙いフラグ
    y, // 発射位置（画面中心が0）
    y_range, // 発射位置振れ幅
    types, // 弾種（配列）
    way, // 同時発射数
    degree_is_targeting, // 角度自機狙いフラグ
    degree, // 射角（左直進が0）
    degree_range, // 射角振れ幅
    speed, // 弾速
    speed_range, // 弾速振れ幅
    time, // 照射時間
    interval, // 発射間隔
    layer, // 表示レイヤー
    se // SE
) {
    var scene = g.game.game_scene;

    var type_paths = [];
    for (var i = 0; i < types.length; i++) {
        type_paths.push('/assets/image/' + types[i] +'.png');
    }

    // 定期処理
    var timer_identifier = scene.setInterval(function() {
        // SE
        if (se) {
            scene.asset.getAudio('/assets/audio/' + se).play();
        }

        // 発射位置計算
        var set_y = 0;
        // 基準設定
        if (y_is_targeting) {
            set_y = scene.yume.sprite.y;
        } else {
            set_y = CONST.cy;
        }
        // 補正設定
        set_y += y;
        // 振れ幅設定
        set_y += Core.rand(-y_range, y_range);

        // wayの数の弾を生成
        for (var i = 0; i < way; i++) {
            // スプライト生成
            scene.note.sprite_count++;
            var sprite = Core.createSprite(
                type_paths[Core.rand(0, type_paths.length - 1)],
                scene
            );
            scene.sprites.push(sprite);
            layer.append(sprite);

            // 発射位置設定
            sprite.x = CONST.width + sprite.width / 2;
            sprite.y = set_y;

            // 射角設定
            var set_radian = 0;
            // 基準設定
            if (degree_is_targeting) {
                set_radian = Core.getRadianByPoints(
                    sprite.x, sprite.y,
                    scene.yume.sprite.x, scene.yume.sprite.y
                );
            } else {
                // 左直進(180)を基準とする
                set_radian = Core.getRadianByDegree(180);
            }
            // 補正設定
            set_radian += Core.getRadianByDegree(degree);
            // 振れ幅設定
            set_radian += Core.getRadianByDegree(
                Core.rand(-degree_range * 100, degree_range * 100) / 100 // 0.01刻みにする
            );

            // スピード設定
            var set_speed = speed;
            // 振れ幅設定
            set_speed += Core.rand(-speed_range * 100, speed_range * 100) / 100; // 0.01刻みにする

            // 移動距離取得
            sprite.move = Core.getMove(set_radian, set_speed);

            // フレームごとの処理
            sprite.onUpdate.add(
                function () {
                    // 移動
                    this.x += this.move.vx;
                    this.y += this.move.vy;
    
                    // 画面外消滅判定
                    if (
                        this.x < 0 - sprite.width || CONST.width + sprite.width < this.x ||
                        this.y < 0 - sprite.height || CONST.height + sprite.height < this.y
                    ) {
                        this.destroy(true);
                        scene.note.sprite_count--;
                    }
    
                    // 座標変更通知
                    this.modified();
    
                    // 2点の衝突判定（modifiedの後に行う必要あり）
                    var is_hitting = g.Collision.within(
                        scene.yume.sprite.x, // Ax
                        scene.yume.sprite.y, // Ay
                        this.x, // Bx
                        this.y, // By
                        this.width / 4 // 衝突にする距離
                    );
                    if (is_hitting) {
                        scene.note.sprite_count--;
                        Miss.miss(this);
                    }
                },
                sprite // 第一引数functionのthisの指定
            );
        }
    }, interval);
    scene.interval_identifiers.push(timer_identifier);

    // timeミリ秒後に処理を実行
    var timer_identifier_out = scene.setTimeout(function () {
        scene.note.is_shooting = false;
        // 定期処理解除
        scene.clearInterval(timer_identifier);
    }, time);
    scene.timeout_identifiers.push(timer_identifier_out);
}

// 円状の攻撃
module.exports.circle = function (
    y_is_targeting, // 発射位置自機狙いフラグ
    y, // 発射位置（画面中心が0）
    y_range, // 発射位置振れ幅
    types, // 弾種（配列）
    way, // 同時発射数
    degree_is_targeting, // 角度自機狙いフラグ
    degree, // 射角（左直進が0）
    degree_range, // 射角振れ幅
    speed, // 弾速
    speed_range, // 弾速振れ幅
    time, // 照射時間
    interval, // 発射間隔
    degree_speed, // 回転速度
    layer, // 表示レイヤー
    se // SE
) {
    var scene = g.game.game_scene;

    var type_paths = [];
    for (var i = 0; i < types.length; i++) {
        type_paths.push('/assets/image/' + types[i] +'.png');
    }

    // 回転速度を初期化
    scene.note.degree_speed = 0;
    scene.note.degree_speed_minus = 0;

    // 定期処理
    var timer_identifier = scene.setInterval(function() {
        // SE
        if (se) {
            scene.asset.getAudio('/assets/audio/' + se).play();
        }

        // 発射位置計算
        var set_y = 0;
        // 基準設定
        if (y_is_targeting) {
            set_y = scene.yume.sprite.y;
        } else {
            set_y = CONST.cy;
        }
        // 補正設定
        set_y += y;
        // 振れ幅設定
        set_y += Core.rand(-y_range, y_range);

        // wayごとの角度を計算
        var way_degree = 360 / way;

        // intervalごとに回転速度を加算
        if (degree_speed >= 0) {
            scene.note.degree_speed += degree_speed;
        } else {
            scene.note.degree_speed_minus += degree_speed;
        }

        // wayの数の弾を生成
        for (var i = 0; i < way; i++) {
            // スプライト生成
            scene.note.sprite_count++;
            var sprite = Core.createSprite(
                type_paths[Core.rand(0, type_paths.length - 1)],
                scene
            );
            scene.sprites.push(sprite);
            layer.append(sprite);

            // 発射位置設定
            sprite.x = CONST.width + sprite.width / 2;
            sprite.y = set_y;

            // 射角設定
            var set_radian = 0;
            // 基準設定
            if (degree_is_targeting) {
                set_radian = Core.getRadianByPoints(
                    sprite.x, sprite.y,
                    scene.yume.sprite.x, scene.yume.sprite.y
                );
            } else {
                // 左直進(180)を基準とする
                set_radian = Core.getRadianByDegree(180);
            }
            // 補正設定
            set_radian += Core.getRadianByDegree(degree);
            // 振れ幅設定
            set_radian += Core.getRadianByDegree(
                Core.rand(-degree_range * 100, degree_range * 100) / 100 // 0.01刻みにする
            );
            // wayごとの角度設定
            set_radian += Core.getRadianByDegree(way_degree) * i;
            // 回転速度設定
            if (degree_speed >= 0) {
                set_radian += Core.getRadianByDegree(scene.note.degree_speed);
            } else {
                set_radian += Core.getRadianByDegree(scene.note.degree_speed_minus);
            }

            // スピード設定
            var set_speed = speed;
            // 振れ幅設定
            set_speed += Core.rand(-speed_range * 100, speed_range * 100) / 100; // 0.01刻みにする

            // 移動距離取得
            sprite.move = Core.getMove(set_radian, set_speed);

            // フレームごとの処理
            sprite.onUpdate.add(
                function () {
                    // 移動
                    this.x += this.move.vx;
                    this.y += this.move.vy;
    
                    // 画面外消滅判定
                    if (
                        this.x < 0 - sprite.width || CONST.width + sprite.width < this.x ||
                        this.y < 0 - sprite.height || CONST.height + sprite.height < this.y
                    ) {
                        this.destroy(true);
                        scene.note.sprite_count--;
                    }
    
                    // 座標変更通知
                    this.modified();
    
                    // 2点の衝突判定（modifiedの後に行う必要あり）
                    var is_hitting = g.Collision.within(
                        scene.yume.sprite.x, // Ax
                        scene.yume.sprite.y, // Ay
                        this.x, // Bx
                        this.y, // By
                        this.width / 4 // 衝突にする距離
                    );
                    if (is_hitting) {
                        scene.note.sprite_count--;
                        Miss.miss(this);
                    }
                },
                sprite // 第一引数functionのthisの指定
            );
        }
    }, interval);
    scene.interval_identifiers.push(timer_identifier);

    // timeミリ秒後に処理を実行
    var timer_identifier_out = scene.setTimeout(function () {
        scene.note.is_shooting = false;
        // 定期処理解除
        scene.clearInterval(timer_identifier);
    }, time);
    scene.timeout_identifiers.push(timer_identifier_out);
}

module.exports.shoot = function () {
    var scene = g.game.game_scene;
    scene.note.is_shooting = true;

    // 初回は特別なwave
    if (scene.note.wave === 0) {
        module.exports.basic(
            false, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            260, // 発射位置振れ幅
            ['a64'], // 弾種（配列）
            1, // 同時発射数
            false, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            0, // 射角振れ幅
            3, // 弾速
            0, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            500, // 発射間隔
            scene.layers.note_front, // 表示レイヤー
            false // SE
        );
    }

    // 自機合わせマシンガン
    if (scene.note.wave === 1) {
        // var speed = 5 + scene.note.loop * 2;
        var speed = (20 - 4 * 4) + scene.note.loop * 4;
        if (speed > 20) speed = 20;

        // var interval = 400 - scene.note.loop * 25;
        var interval = (200 + 100 * 4) - scene.note.loop * 100;
        if (interval < 200) interval = 200;

        module.exports.basic(
            true, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            0, // 発射位置振れ幅
            ['b64'], // 弾種（配列）
            1, // 同時発射数
            false, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            0, // 射角振れ幅
            speed, // 弾速
            0, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            interval, // 発射間隔
            scene.layers.note_front, // 表示レイヤー
            'shot_a' // SE
        );
    }

    // 直進ばらまき
    if (scene.note.wave === 2) {
        var speed = (10 - 1.5 * 4) + scene.note.loop * 1.5;
        if (speed > 10) speed = 10;
        
        var interval = (50 + 50 * 4) - scene.note.loop * 50;
        if (interval < 50) interval = 50;

        module.exports.basic(
            false, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            360, // 発射位置振れ幅
            ['a64'], // 弾種（配列）
            1, // 同時発射数
            false, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            3, // 射角振れ幅
            speed, // 弾速
            0, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            interval, // 発射間隔
            scene.layers.note_front, // 表示レイヤー
            false // SE
        );

        scene.asset.getAudio('/assets/audio/shot_c').play();
    }

    // 発射位置固定ばらまき
    if (scene.note.wave === 3) {
        var speed = (10 - 1 * 4) + scene.note.loop * 1;
        if (speed > 10) speed = 10;
        
        var interval = (50 + 50 * 4) - scene.note.loop * 50;
        if (interval < 50) interval = 50;

        module.exports.basic(
            false, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            0, // 発射位置振れ幅
            ['a64'], // 弾種（配列）
            1, // 同時発射数
            false, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            20, // 射角振れ幅
            speed, // 弾速
            0, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            interval, // 発射間隔
            scene.layers.note_front, // 表示レイヤー
            'shot_a' // SE
        );
    }

    // 自機狙いショットガン
    if (scene.note.wave === 4) {
        var speed = (17 - 2 * 4) + scene.note.loop * 2;
        if (speed > 17) speed = 17;

        var degree_range = (8 - 1 * 4) + scene.note.loop * 1;
        if (degree_range > 8) degree_range = 8;

        module.exports.basic(
            false, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            0, // 発射位置振れ幅
            ['b64'], // 弾種（配列）
            10, // 同時発射数
            true, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            degree_range, // 射角振れ幅
            speed, // 弾速
            1, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            1000, // 発射間隔
            scene.layers.note_front, // 表示レイヤー
            'shot_b' // SE
        );
    }

    // 小粒雨（同時発射1 角度速度発射位置ランダム）
    if (scene.note.wave === 5) {
        var interval = (50 + 50 * 4) - scene.note.loop * 50;
        if (interval < 50) interval = 50;

        module.exports.basic(
            false, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            360, // 発射位置振れ幅
            ['a32'], // 弾種（配列）
            1, // 同時発射数
            false, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            2, // 射角振れ幅
            3, // 弾速
            0.5, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            interval, // 発射間隔
            scene.layers.note_front, // 表示レイヤー
            false // SE
        );

        scene.asset.getAudio('/assets/audio/shot_c').play();
    }

    // ひまわり
    if (scene.note.wave === 6) {
        var way = (80 - 15 * 4) + scene.note.loop * 15;
        if (way > 80) way = 80;

        module.exports.circle(
            false, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            0, // 発射位置振れ幅
            ['a64'], // 弾種（配列）
            way, // 同時発射数
            false, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            0, // 射角振れ幅
            5, // 弾速
            0, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            700, // 発射間隔
            7, // 回転速度
            scene.layers.note_front, // 表示レイヤー
            'shot_a' // SE
        );
    }

    // 巨砲（自機縦位置直進　難易度が上がると小粒追加）
    if (scene.note.wave === 7) {
        module.exports.basic(
            true, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            0, // 発射位置振れ幅
            ['b360'], // 弾種（配列）
            1, // 同時発射数
            false, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            0, // 射角振れ幅
            4, // 弾速
            0, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            1800, // 発射間隔
            scene.layers.note_back, // 表示レイヤー
            'shot_b' // SE
        );

        // 2週目から
        if (scene.note.loop >= 1) {
            var interval = (50 + 100 * 4) - scene.note.loop * 100;
            if (interval < 50) interval = 50;
            module.exports.basic(
                false, // 発射位置自機狙いフラグ
                0, // 発射位置（画面中心が0）
                360, // 発射位置振れ幅
                ['a64'], // 弾種（配列）
                1, // 同時発射数
                false, // 角度自機狙いフラグ
                0, // 射角（左直進が0）
                3, // 射角振れ幅
                4, // 弾速
                0, // 弾速振れ幅
                scene.note.atack_time, // 照射時間
                interval, // 発射間隔
                scene.layers.note_front // 表示レイヤー
            );
        }
    }

    // 二層式洗濯機
    if (scene.note.wave === 8) {
        var interval_b = (200 + 100 * 4) - scene.note.loop * 100;
        if (interval_b < 200) interval_b = 200;

        module.exports.circle(
            false, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            0, // 発射位置振れ幅
            ['b64'], // 弾種（配列）
            13, // 同時発射数
            false, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            0, // 射角振れ幅
            6, // 弾速
            0, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            interval_b, // 発射間隔
            3, // 回転速度
            scene.layers.note_back, // 表示レイヤー
            'shot_a' // SE
        );

        var interval_a = (150 + 100 * 4) - scene.note.loop * 100;
        if (interval_a < 150) interval_a = 150;

        module.exports.circle(
            false, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            0, // 発射位置振れ幅
            ['a64'], // 弾種（配列）
            13, // 同時発射数
            false, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            0, // 射角振れ幅
            6, // 弾速
            0, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            interval_a, // 発射間隔
            -4, // 回転速度
            scene.layers.note_front, // 表示レイヤー
            'shot_a' // SE
        );
    }

    // 直進ばらまき＋自機狙い
    if (scene.note.wave === 9) {
        var interval_a = (50 + 50 * 4) - scene.note.loop * 50;
        if (interval_a < 50) interval_a = 50;

        module.exports.basic(
            false, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            360, // 発射位置振れ幅
            ['a64'], // 弾種（配列）
            1, // 同時発射数
            false, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            0, // 射角振れ幅
            5, // 弾速
            0, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            interval_a, // 発射間隔
            scene.layers.note_front, // 表示レイヤー
            false // SE
        );

        var interval_b = (250 + 100 * 4) - scene.note.loop * 100;
        if (interval_b < 250) interval_b = 250;

        module.exports.basic(
            false, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            0, // 発射位置振れ幅
            ['b32'], // 弾種（配列）
            1, // 同時発射数
            true, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            0, // 射角振れ幅
            13, // 弾速
            0, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            interval_b, // 発射間隔
            scene.layers.note_front, // 表示レイヤー
            'shot_a' // SE
        );
    }

    // 棒
    if (scene.note.wave === 10) {
        var speed = (13 - 1.5 * 4) + scene.note.loop * 1.5;
        if (speed > 13) speed = 13;

        var interval = (80 + 70 * 4) - scene.note.loop * 70;
        if (interval < 80) interval = 80;

        module.exports.basic(
            false, // 発射位置自機狙いフラグ
            0, // 発射位置（画面中心が0）
            360, // 発射位置振れ幅
            ['a64'], // 弾種（配列）
            7, // 同時発射数
            false, // 角度自機狙いフラグ
            0, // 射角（左直進が0）
            0, // 射角振れ幅
            speed, // 弾速
            1, // 弾速振れ幅
            scene.note.atack_time, // 照射時間
            interval, // 発射間隔
            scene.layers.note_front, // 表示レイヤー
            'shot_a' // SE
        );
    }

    // 次のwaveへ
    scene.note.wave++;

    // wave上限を超えたら
    if (scene.note.wave > 10) {
        scene.note.wave = 1;
        scene.note.loop++;

        // 生放送の場合1ループで終了
        if (g.game.vars.mode === 'L') {
            scene.is_ending = true;
        }
    }
}

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}