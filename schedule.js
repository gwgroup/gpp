var Redis = require("./utils/index").Redis;
var schedule = require("node-schedule");
var async = require("async");
var tasks = [];

let weixinAccessTokenKey = "wx_access_token";
/**
 * 获取微信TOKEN有效期，-2是不存在，-1是永久
 * @param {*} cb
 */
function __getWeixinAccessTokenTtl(cb) {
  Redis.client.ttl(weixinAccessTokenKey, cb);
}

/**
 * 启动调度
 */
var run = function() {
  console.log("1.初始化Schedule服务");
  tasks.forEach(item => {
    schedule.scheduleJob(item.name, item.cron, item.handler);
    if (item.touchRun) {
      item.handler();
    }
  });
};

/**
 * 增加调度任务
 * @param {String} name
 * @param {String} cron
 * @param {Function} handler
 */
var addJob = function(name, cron, handler) {
  schedule.scheduleJob({ name, rule: cron }, handler);
};

/**
 * 获取微信服务TOKEN
 */
function __getWeixinAccessToken() {
  console.log(new Date().toLocaleString(), "REFRESH_WEIXIN_ACCESS_TOKEN");
}

module.exports = { schedule, run, addJob };

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
          `${s} ${m} */2 * * *`,
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
