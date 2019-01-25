var redis = require("redis"),
    redisConfig = require('../config').redis,
    expire = require('../config').redis_expire;
var client = redis.createClient(redisConfig);
client.on('connect', (arg1) => {
    console.debug('Redis Connect!');
});
client.on('reconnecting', (arg1) => {
    console.debug('Redis Reconnecting!');
});
client.on('error', (arg1) => {
    console.error('Redis Error:', arg1);
});
/**
 * 设值
 * @param {String} key 
 * @param {Object} value 
 * @param {Number?} expire
 */
var set = function (key, value, expire) {
    if (expire === undefined) {
        client.set(key, JSON.stringify(value));
    } else {
        client.set(key, JSON.stringify(value), 'EX', expire);
    }
};
/**
 * 刷新过期
 * @param {String} key 
 * @param {Function} ttl 
 */
var flushExpire = function (key, ttl = expire) {
    client.expire(key, ttl);
};
/**
 * 获取值
 * @param {String} key 
 * @param {Function} cb
 */
var get = function (key, cb) {
    client.get(key, cb);
};

/**
 * INCR
 * @param {String} key 
 * @param {Number} increment 
 * @param {Function} cb 
 */
var incr = function (key, cb) {
    client.incrby(key, 1, cb);
};
module.exports = { set, flushExpire, get, client, incr };