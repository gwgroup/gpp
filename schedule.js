var Redis = require("./utils/index").Redis;
var schedule = require("node-schedule");
var async = require("async");

let weixinAccessTokenKey = "wx_access_token";

/**
 * 增加调度任务
 * @param {String} name
 * @param {String} cron
 * @param {Function} handler
 */
var addJob = function(name, cron, handler) {
  console.log("SCHEDULE ADD JOB", name, cron);
  schedule.scheduleJob({ name, rule: cron }, handler);
};

/**
 * 获取微信TOKEN有效期，-2是不存在，-1是永久
 * @param {*} cb
 */
function __getWeixinAccessTokenTtl(cb) {
  Redis.client.ttl(weixinAccessTokenKey, cb);
}

/**
 * 获取微信服务TOKEN
 */
function __getWeixinAccessToken() {
  console.log(new Date().toLocaleString(), "REFRESH_WEIXIN_ACCESS_TOKEN");
}

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
      console.log(timeout);
      setTimeout(() => {
        __getWeixinAccessToken();
        let now = new Date();
        let m = now.getMinutes();
        let s = now.getSeconds();
        addJob(
          "REFRESH_WEIXIN_ACCESS_TOKEN",
          `${s} ${m} */1 * * *`,
          __getWeixinAccessToken
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

module.exports = { schedule, run, addJob };
