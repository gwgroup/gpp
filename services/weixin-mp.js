let async = require("async"),
  Request = require('request'),
  util = require("../utils/index"),
  Redis = util.Redis,
  BusinessError = util.BusinessError,
  schedule = require('../schedule'),
  config = require('../config'),
  REDIS_WEIXIN_ACCESS_TOKEN_KEY = config.redis_keys.WEIXIN_MP_ACCESS_TOKEN_KEY,
  weixin_mp_config = config.weixin_mp,
  appid = weixin_mp_config.appid,
  appsecret = weixin_mp_config.appsecret,
  accessTokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`;

/**
 * 获取微信TOKEN有效期，-2是不存在，-1是永久
 * @param {*} cb
 */
function __getWeixinAccessTokenTtl(cb) {
  Redis.client.ttl(REDIS_WEIXIN_ACCESS_TOKEN_KEY, cb);
}

/**
 * 从微信服务器获取TOKEN
 * @param {Function} cb 
 */
function __getWeixinAccessToken(cb) {
  __requestGetWeixinMp(accessTokenUrl, cb);
}

/**
 * 刷新微信服务TOKEN
 */
function __refreshWeixinAccessToken() {
  console.log("REFRESH_WEIXIN_ACCESS_TOKEN", new Date().toLocaleString());
  __getWeixinAccessToken((err, body) => {
    if (err) {
      console.error(err);
    } else {
      Redis.set(REDIS_WEIXIN_ACCESS_TOKEN_KEY, { access_token: body.access_token, "time": new Date().toLocaleString() }, body.expires_in);
    }
  });
}

/**
 * 启动公众号TOKEN刷新任务
 */
function __startSchedule() {
  async.waterfall(
    [
      cb => {
        __getWeixinAccessTokenTtl(cb);
      },
      (s, cb) => {
        let timeout = 0;
        if (s != -2) {
          timeout = (7200 - s) * 1000;
        }
        cb(undefined, timeout);
      },
      (timeout, cb) => {
        setTimeout(() => {
          __refreshWeixinAccessToken();
          let now = new Date();
          let m = now.getMinutes();
          let s = now.getSeconds();
          schedule.addJob(
            "REFRESH_WEIXIN_ACCESS_TOKEN",
            `${s} ${m} */1 * * *`,
            __refreshWeixinAccessToken
          );
        }, timeout);
      }
    ],
    err => {
      if (err) {
        console.error(err);
      }
    }
  );
}

/**
 * 微信 http Get请求
 * @param {String} url 
 * @param {Function} cb 
 */
function __requestGetWeixinMp(url, cb) {
  Request.get(url, (err, response, body) => {
    if (err) {
      return cb(err);
    }
    if (response.statusCode === 200) {
      let obj = JSON.parse(body);
      if (obj.errcode) {
        return cb(BusinessError.custom(obj.errcode, obj.errmsg));
      }
      cb(undefined, obj);
    } else {
      cb(BusinessError.create(config.codes.wxConnectError));
    }
  });
}

/**
 * 微信 http Post请求
 * @param {String} url 
 * @param {Object} body
 * @param {Function} cb 
 */
function __requestPostWeixinMp(url, body, cb) {
  Request.post(url, {
    body: body, headers: {
      "Content-Type": "application/json"
    }
  }, (err, response, body) => {
    if (err) {
      return cb(err);
    }
    if (response.statusCode === 200) {
      let obj = JSON.parse(body);
      if (obj.errcode) {
        return cb(BusinessError.custom(obj.errcode, obj.errmsg));
      }
      cb(undefined, obj);
    } else {
      cb(BusinessError.create(config.codes.wxConnectError));
    }
  });
}
/**
 * 从redis中获取Token
 * @param {Function} cb 
 */
function getWeixinAccessTokenWithRedis(cb) {
  Redis.get(REDIS_WEIXIN_ACCESS_TOKEN_KEY, cb);
}
/**
 * 获取微信服务器的IP地址列表
 */
function getWeixinCbIps(cb) {
  getWeixinAccessTokenWithRedis((err, obj) => {
    if (err) {
      return cb(err);
    }
    let tokenObj = JSON.parse(obj);
    let accessToken = tokenObj.access_token;
    __requestGetWeixinMp(`https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=${accessToken}`, cb);
  });
}

/**
 * 网络检查
 * @param {Function} cb 
 */
function weixinNetCheck(cb) {
  getWeixinAccessTokenWithRedis((err, obj) => {
    if (err) {
      return cb(err);
    }
    let tokenObj = JSON.parse(obj);
    let accessToken = tokenObj.access_token;
    let body = {
      "action": "all",
      "check_operator": "DEFAULT"
    };
    __requestPostWeixinMp(`https://api.weixin.qq.com/cgi-bin/callback/check?access_token=${accessToken}`, JSON.stringify(body), cb);
  });
}

/**
 * 创建菜单
 * @param {Object} menu
 * @param {Function} cb 
 */
function createMenu(menu, cb) {
  getWeixinAccessTokenWithRedis((err, obj) => {
    if (err) {
      return cb(err);
    }
    let tokenObj = JSON.parse(obj);
    let accessToken = tokenObj.access_token;
    __requestPostWeixinMp(`https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`, JSON.stringify(menu), cb);
  });
}

/**
 * 获取菜单
 * @param {Function} cb 
 */
function getMenu(cb) {
  getWeixinAccessTokenWithRedis((err, obj) => {
    if (err) {
      return cb(err);
    }
    let tokenObj = JSON.parse(obj);
    let accessToken = tokenObj.access_token;
    __requestGetWeixinMp(`https://api.weixin.qq.com/cgi-bin/menu/get?access_token=${accessToken}`, cb);
  });
}

module.exports = { getWeixinAccessTokenWithRedis, getWeixinCbIps, weixinNetCheck, createMenu, getMenu };

__startSchedule();

// setTimeout(() => {
//   getWeixinCbIps((err, result) => {
//     console.log("IPS", err, result);
//   });
//   weixinNetCheck((err, result) => {
//     console.log("NET CHECK", err, result);
//   });
// }, 10000);

// getWeixinAccessToken((err, body) => {
//   console.log(err, body);
// });

/*
微信
错误类型
{
    "errcode": 40164,
    "errmsg": "invalid ip 58.35.36.173, not in whitelist"
}
*/