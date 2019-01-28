var util = require('../utils/index'),
    redisClient = util.Redis;
const BATCH_NO_KEY = require('../config').redis_keys.BATCH_NO_KEY;
var async = require('async');
/**
 * 生成批次单号
 * @param {String} user_id 用户ID
 * @param {Function} cb 
 */
function generateBatchNo(user_id, cb) {
    redisClient.incr(`${BATCH_NO_KEY}_${user_id}`, (err, result) => {
        if (err) {
            return cb(err);
        }
        cb(undefined, result);
    });
}
/**
 * 创建现金红包活动
 * @param {*} params 
 * @param {*} cb 
 */
function createRedPacketActive(params, cb) {
    /*
    user_id,
    act_name, 活动名称
    send_name,活动方
    wishing,祝福语
    */
}
/**
 * 批量生成现金红包卡
 * @param {*} params 
 * @param {*} cb 
 */
function generateRedPacketCards(params, cb) {
    /*
    user_id,
    red_packet_id,红包活动ID
    moneys:[1,200],
    
    */
}

function __generateRandomFullMoney(min = 1, max, total, count) {
    var result = [];
    var last = total - min * count;
    if (!max) { max = last / 2; }
    max--;
    // 80
    for (var i = 0; i < count - 1; i++) {
        //let avg = last/(count-i);
        var get = parseFloat((Math.random() * (last >= max ? max : last) + min).toFixed(2));
        last = last - get + min;
        last = last > 0 ? last : 0;
        result.push(get);
    }
    result.push(parseFloat((last + min).toFixed(2)));
    return result;
}

function __generateRandomCount(min = 1, max, count) {
    var result = [];
    for (var i = 0; i < count; i++) {
        var tnc = Math.random() * max;
        tnc = tnc > min ? tnc : min;
        result.push(parseFloat(tnc.toFixed(2)));
    }
    return result;
}

module.exports = { generateBatchNo };

// console.log(generateRandomFullMoney(1.68, 1208, 2500, 50));
// console.log(generateRandomCount(1.68, 50, 50));
// generateBatchNo('f8316388-1562-11e9-ab14-d663bd873d93',(err,val)=>{
//     console.log(err,val);
// });