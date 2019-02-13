var util = require('../utils/index'),
  dbhelper = util.MysqlHelper,
  BusinessError = util.BusinessError;
/**
 * 加载账户数据
 * @param {String} userId 
 * @param {Function} cb 
 */
var loadAccount = function (userId, cb) {
  dbhelper.query('SELECT `id`,`account_money` FROM gpp.pt_user where user_id=?;', [userId], (err, results, fields) => {
    if (err) {
      return cb(err);
    }
    cb(undefined, results[0]);
  });
};

/**
 * 创建充值记录
 * @param {String} tradeNo
 * @param {Number} type 
 * @param {Number} money 
 * @param {String} user_id 
 * @param {Object} xmlobj pay_info
 * @param {Function} cb 
 */
var createRecharge = function (tradeNo, type, money, user_id, xmlobj, cb) {
  dbhelper.query('INSERT INTO `gpp`.`pt_recharge` (id,`type`,`money`,`user_id`,`trade_no`,`pay_info`) VALUES (?,?,?,?,?,?);', [util.generateUUID(), type, money, user_id, tradeNo, JSON.stringify(xmlobj)], function (err, results) {
    if (err) {
      return cb(err);
    }
    cb(undefined);
  });
};

/**
 * 加载充值记录
 * @param {String} id 
 * @param {Function} cb 
 */
var loadRecharge = function (id, cb) {
  dbhelper.query(`select * from \`gpp\`.\`pt_recharge\` where id=?`, [id], (err, result) => {
    if (err) {
      return cb(err);
    }
    cb(undefined, result[0]);
  });
};

/**
 * 查询充值记录
 * @param {*} status 
 * @param {*} type 
 * @param {*} start_time 
 * @param {*} ent_time 
 * @param {*} page_index 
 * @param {*} page_size 
 * @param {*} cb 
 */
var searchRecharge = function (status, type, user_id, start_time, ent_time, page_index, page_size, cb) {
  let skipRow = (page_index - 1) * page_size;
  let exs = [];
  let params = [];
  if (status != undefined) {
    exs.push('status=?');
    params.push(status);
  } else {
    exs.push('status in (1,3)');
  }
  if (type != undefined) {
    exs.push('type=?');
    params.push(type);
  }
  if (user_id != undefined) {
    exs.push('user_id=?');
    params.push(user_id);
  }
  if (start_time != undefined) {
    exs.push('DATE(update_time)>=?');
    params.push(start_time);
  }
  if (ent_time != undefined) {
    exs.push('DATE(update_time)<=?');
    params.push(ent_time);
  }
  params.push(skipRow);
  params.push(page_size);
  let rowsSql = dbhelper.mysql.format(`SELECT
    \`id\`,
    \`money\`,
    \`user_id\`,
    \`trade_no\`,
    \`status\`,
    \`create_time\`,
    \`update_time\`,
    \`type\`,
    \`in_acount\`
    FROM
    \`gpp\`.\`pt_recharge\`
    WHERE deleted=0
     ${exs.length ? 'and ' + exs.join(' and ') : ''}
     ORDER BY update_time DESC
    LIMIT ?,?;`, params);
  let countSql = dbhelper.mysql.format(`SELECT
    count(1) as total
    FROM
    \`gpp\`.\`pt_recharge\`
    WHERE deleted=0
    ${exs.length ? 'and ' + exs.join(' and ') : ''};`,
    params);
  dbhelper.query(rowsSql + countSql, [], (err, results) => {
    if (err) {
      return cb(err);
    }
    cb(undefined, results);
  }
  );
}

/**
 * 确认充值
 * @param {String} tradeNo 编号
 * @param {Object} resultObj 回调接口对象
 * @param {Function} cb 
 */
var confirmRecharge = function (tradeNo, resultObj, cb) {
  dbhelper.query('UPDATE `gpp`.`pt_recharge` SET `status`=?,cb_info=? WHERE `trade_no` =? AND `status`=0;', [1, JSON.stringify(resultObj), tradeNo], (err, result, fields) => {
    if (err) {
      return cb(err);
    }
    cb(undefined);
  });
};

/**
 * 充值记录入账户余额
 * @param {String} tradeNo 
 */
var confirmInAccount = function (tradeNo, cb) {
  dbhelper.pool.getConnection((err, connection) => {
    if (err) { return cb(err); }
    //开启事务
    connection.beginTransaction(
      (err) => {
        if (err) {
          return cb(err);
        }
        //1.1. 查询锁定acount 记录
        //1.2. 查询锁定充值记录
        connection.query('SELECT `id`,`money`,`user_id`,`trade_no`,`status`,`create_time`,`update_time`,`type`,`in_acount` FROM `gpp`.`pt_recharge` WHERE status=1 and trade_no=? and in_acount=0 FOR UPDATE;SELECT * FROM `pt_user` WHERE `id` =(SELECT `user_id` FROM `gpp`.`pt_recharge` WHERE `status`=1 AND trade_no=? and in_acount=0) FOR UPDATE;', [tradeNo, tradeNo], (err, results, fields) => {
          if (err) {
            return connection.rollback(
              () => {
                cb(err);
                connection.release();
              }
            );
          }
          if (results[0].length == 0) {
            // 避免重复入账
            console.log('已经被处理，不能重复入账', tradeNo);
            return connection.rollback(
              () => {
                cb(BusinessError.create(config.codes.repeatInAccount));
                connection.release();
              }
            );
          }
          //2.1 更新充值记录为入账
          //2.2 更新acount 记录
          let rmoney = results[0][0].money;
          let umoney = results[1][0].account_money;
          let tmoney = rmoney + umoney;
          let userId = results[0][0].user_id;
          connection.query('UPDATE `gpp`.`pt_user` SET `account_money` = ? WHERE `user_id` =?;UPDATE `gpp`.`pt_recharge` SET `in_acount`=1 WHERE `trade_no`=?;', [tmoney, userId, tradeNo], (err, results, fields) => {
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
      }
    );
  });
};
/**
 * 查询没有支付的充值记录
 * @param {Function} cb 
 */
function searchNotPayRecharge(cb) {
  dbhelper.query('SELECT `id`,`money`,`user_id`,`trade_no`,`status`,`create_time`,`update_time`,`type`,`pay_info`,`cb_info`,`in_acount` FROM `gpp`.`pt_recharge` WHERE STATUS=0 AND TIMESTAMPDIFF(MINUTE,create_time,CURRENT_TIMESTAMP)>30;', [], cb);
}
module.exports = { createRecharge, confirmRecharge, confirmInAccount, loadAccount, searchNotPayRecharge, searchRecharge, loadRecharge };