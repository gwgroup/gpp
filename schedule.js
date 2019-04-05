var schedule = require("node-schedule");
/**
 * 增加调度任务
 * @param {String} name
 * @param {String} cron
 * @param {Function} handler
 */
var addJob = function (name, cron, handler) {
  //console.log("SCHEDULE ADD JOB", name, cron);
  schedule.scheduleJob({ name, rule: cron }, handler);
};

module.exports = { schedule, addJob };
