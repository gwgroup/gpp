var util = require('../utils/index'),
    redisClient = util.Redis,
    BusinessError = util.BusinessError,
    config = require('../config'),
    BATCH_NO_KEY = config.redis_keys.BATCH_NO_KEY;
var async = require('async');
/**
 * 生成批次单号
 * @param {String} user_id 用户ID
 * @param {Function} cb 
 */
function __generateBatchNo(user_id, cb) {
    redisClient.incr(`${BATCH_NO_KEY}_${user_id}`, (err, result) => {
        if (err) {
            return cb(err);
        }
        cb(undefined, result);
    });
}
/**
 * 创建现金红包活动
 * @param {Object} params 
 * @param {String} user_id
 * @param {Function} cb 
 */
function createRedPacketActive({ act_name, send_name, wishing }, user_id, cb) {
    /*
    user_id,
    act_name, 活动名称
    send_name,活动方
    wishing,祝福语
    */
    if (!(user_id && act_name && send_name && wishing)) {
        return cb(BusinessError.create(config.codes.paramsError));
    }
    util.MysqlHelper.query(`
    insert into \`gpp\`.\`pp_red_packet\` (
        \`id\`,
        \`user_id\`,
        \`act_name\`,
        \`send_name\`,
        \`wishing\`
      )
      values
        (
          ?,
          ?,
          ?,
          ?,
          ?
        );
      `, [util.generateUUID(), user_id, act_name, send_name, wishing], cb);
}

/**
 * 批量生成现金红包卡
 * @param {*} params 
 * @param {*} cb 
 */
function generateRedPacketCards({ red_packet_id, moneys }, user_id, cb) {
    /*
    user_id,
    red_packet_id,红包活动ID
    moneys:[1,200],
    */
    //0.检查参数
    if (!(user_id && red_packet_id && moneys && moneys.length > 0)) {
        return cb(BusinessError.create(config.codes.paramsError));
    }
    let total = 0;
    moneys.forEach(element => {
        total += element;
    });
    let free_money = 0;
    util.MysqlHelper.pool.getConnection((err, connection) => {
        if (err) {
            return cb(err);
        }
        //3.启动事务
        connection.beginTransaction((err) => {
            if (err) {
                return cb(err);
            }
            async.waterfall([
                (cb) => {
                    connection.query(`
                    SELECT
                        *
                    FROM
                    \`gpp\`.\`pt_user\`
                    WHERE \`id\`=?
                    FOR UPDATE;
                    `, [user_id],
                        cb
                    );
                }, (result, fields, cb) => {
                    //4.检查账户和余额
                    let user = result[0];
                    if (!user) {
                        return cb(BusinessError.create(config.codes.userMissing));
                    }
                    if (user.account_money < total) {
                        return cb(BusinessError.create(config.codes.noMoney));
                    }
                    free_money = user.account_money - total;
                    //5.生成批次号
                    __generateBatchNo(user_id, cb);
                }, (batchNo, cb) => {
                    //6.生成sql(红包明细,花费记录,修改账户余额)
                    //6.1 红包明细
                    let rpsql = __generateRedPacketDetail(red_packet_id, moneys, batchNo,user_id);
                    //6.2 花费明细
                    let costsql = util.MysqlHelper.mysql.format(`
                    INSERT INTO \`gpp\`.\`pt_cost\` (\`id\`,\`money\`,\`user_id\`,\`account_money\`,\`type\`,\`total_count\`,\`remark\`)
                      VALUES
                    (?,?,?,?,?,?,?);`,
                        [util.generateUUID(), total, user_id, free_money, 0, moneys.length, batchNo]
                    );
                    //6.3 更新账户余额
                    let uamsql = util.MysqlHelper.mysql.format(`
                        UPDATE
                        \`gpp\`.\`pt_user\`
                        SET
                        \`account_money\` = ?
                        WHERE \`id\` = ?;
                    `, [free_money, user_id]);
                    //7 执行
                    connection.query(rpsql + costsql + uamsql, [], cb);
                }
            ], (err, result, fields) => {
                if (err) {
                    return connection.rollback(
                        () => {
                            cb(err);
                            connection.release();
                        }
                    );
                }
                connection.commit(() => {
                    cb(undefined);
                    connection.release();
                });
            });
        });
    });
}

/**
 * 红包卡批量SQL
 * @param {*} red_packet_id 
 * @param {*} moneys 
 * @param {*} batchNo 
 * @param {String} user_id
 */
function __generateRedPacketDetail(red_packet_id, moneys, batchNo,user_id) {
    let result = [];
    moneys.forEach(element => {
        result.push(`('${util.generateUUID()}','${red_packet_id}',${element},'${batchNo}','${user_id}')`);
    });
    return `INSERT INTO \`gpp\`.\`pp_red_packet_card\` (
        \`id\`,
        \`red_packet_id\`,
        \`money\`,
        \`batch_no\`,
        \`user_id\`
      ) values ${result.join(',')};`;
}


// function __generateRandomFullMoney(min = 1, max, total, count) {
//     var result = [];
//     var last = total - min * count;
//     if (!max) { max = last / 2; }
//     max--;
//     // 80
//     for (var i = 0; i < count - 1; i++) {
//         //let avg = last/(count-i);
//         var get = parseFloat((Math.random() * (last >= max ? max : last) + min).toFixed(2));
//         last = last - get + min;
//         last = last > 0 ? last : 0;
//         result.push(get);
//     }
//     result.push(parseFloat((last + min).toFixed(2)));
//     return result;
// }

// function __generateRandomCount(min = 1, max, count) {
//     var result = [];
//     for (var i = 0; i < count; i++) {
//         var tnc = Math.random() * max;
//         tnc = tnc > min ? tnc : min;
//         result.push(parseFloat(tnc.toFixed(2)));
//     }
//     return result;
// }

module.exports = { createRedPacketActive, generateRedPacketCards };