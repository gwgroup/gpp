var util = require('../utils');
var Redis = util.Redis;
var ExpiresConfig = require('../config').expires;

/**
 * 插入TOKEN
 * @param {String} user_id
 * @param {Function} cb 
 */
var insertToken = function (user_id, cb) {
    let token = util.generateTokenCode();
    Redis.set(`token_${token}`, { user_id, token }, ExpiresConfig.token);
    cb(undefined, token);
};

/**
 * 检查token是否有效
 * @param {String} token token
 * @param {Function} cb 回调  返回  error, token object
 */
var checkToken = function (token, cb) {
    Redis.get(`token_${token}`, (err, result) => {
        if (err) {
            return cb(err);
        }
        if (result) {
            cb(undefined, JSON.parse(result));
        } else {
            cb(undefined, null);
        }
    });
};

/**
 * 延时token
 * @param {String} token 
 */
var delay = function (token) {
    Redis.flushExpire(`token_${token}`,ExpiresConfig.token);
}

module.exports = { checkToken, insertToken, delay };