let async = require("async"),
  Request = require('request'),
  util = require("../utils/index"),
  Redis = util.Redis,
  BusinessError = util.BusinessError,
  schedule = require('../schedule'),
  config = require('../config'),
  weixinAccessTokenKey = config.redis_keys.WEIXIN_MP_ACCESS_TOKEN_KEY,
  weixin_mp_config = config.weixin_mp,
  appid = weixin_mp_config.appid,
  appsecret = weixin_mp_config.appsecret,
  accessTokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`;

/**
 * 获取微信TOKEN有效期，-2是不存在，-1是永久
 * @param {*} cb
 */
function __getWeixinAccessTokenTtl(cb) {
  Redis.client.ttl(weixinAccessTokenKey, cb);
}

function getWeixinAccessToken(cb) {
  Request.get(accessTokenUrl, (err, response, body) => {
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
 * 刷新微信服务TOKEN
 */
function __refreshWeixinAccessToken() {
  console.log("REFRESH_WEIXIN_ACCESS_TOKEN", new Date().toLocaleString());
  getWeixinAccessToken((err, body) => {
    if (err) {
      console.error(err);
    } else {
      Redis.set(weixinAccessTokenKey, { access_token: body.access_token ,"time": new Date().toLocaleString()}, body.expires_in);
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
        //console.log(timeout);
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

module.exports = {};

__startSchedule();

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