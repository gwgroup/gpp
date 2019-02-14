var util = require('../utils/index'),
  dbhelper = util.MysqlHelper,
  BusinessError = util.BusinessError,
  config = require('../config');

/**
 * 查询客户可以使用的优惠券
 * @param {String} userId 
 * @param {Function} cb 
 */
var getCouponsWithUser = function (userId, cb) {
  dbhelper.query(`select * from gpp.pt_coupon where deleted=0 and used=0 and end_time>current_timestamp and \`user_id\`=?;`, [userId], cb);
};
/**
 * 使用优惠券
 * 1.读取优惠券记录
 * 2.创建充值记录并更新优惠券为已使用
 * @param {String} code 
 * @param {String} userId
 * @param {Function} cb 
 */
var useCoupon = function (code, userId, cb) {
  dbhelper.pool.getConnection(function (err, connection) {
    if (err) {
      return cb(err);
    }
    connection.beginTransaction(function (err) {
      if (err) {
        return cb(err);
      }
      connection.query('select * from gpp.pt_coupon where deleted=0 and code=? for update;', [code], (err, result) => {
        if (err) {
          return connection.rollback(
            () => {
              cb(err);
              connection.release();
            }
          );
        }
        if (result.length === 0) {
          return connection.rollback(
            () => {
              cb(BusinessError.create(config.codes.couponCodeError));
              connection.release();
            }
          );
        }
        let obj = result[0];
        console.log(obj);
        if (obj.used) {
          return connection.rollback(
            () => {
              cb(BusinessError.create(config.codes.couponUsed));
              connection.release();
            }
          );
        }
        if (obj.user_id && obj.user_id != userId) {
          return connection.rollback(
            () => {
              cb(BusinessError.create(config.codes.couponCustomerError));
              connection.release();
            }
          );
        }
        if (obj.end_time < new Date()) {
          return connection.rollback(
            () => {
              cb(BusinessError.create(config.codes.couponExpired));
              connection.release();
            }
          );
        }
        // 更新使用优惠券， 更新充值记录
        let oid = util.generateUUID(),
          tradeNo = generateTradeNo(),
          money = obj.money;
        connection.query('update gpp.pt_coupon set used=1,user_id=? where id=?;INSERT INTO `gpp`.`pt_recharge` (`id`,`money`,`user_id`,`trade_no`,`status`,`type`,`coupon_id`) VALUES(?,?,?,?,?,?,?);', [userId, obj.id, oid, obj.money, userId, tradeNo, 1, 3, obj.id], (err, result) => {
          if (err) {
            return connection.rollback(
              () => {
                cb(err);
                connection.release();
              }
            );
          }
          connection.commit(() => {
            cb(undefined, tradeNo, money);
            connection.release();
          });
        });
      });
    });
  });
};


/**
 * 获取订单号
 */
var generateTradeNo = function () {
  return util.dateFormat(new Date(), 'yyyyMMddhhmmssS');
};

module.exports = { useCoupon, getCouponsWithUser };