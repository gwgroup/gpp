var util = require('../utils/index');
util.Redis.set('dc', 'ttttt', 60 * 60);
setTimeout(function () {
  util.Redis.flushExpire('dc', 60 * 60 * 60);
}, 2000);