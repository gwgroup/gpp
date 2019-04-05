var express = require('express');
var router = express.Router();
var weixinMpService = require('../../services/weixin-mp');
var System = require('../../utils/index').System;

/**
* 微信网络检测
*/
router.post('/weixin_net_check', function (req, res, next) {
  weixinMpService.weixinNetCheck((err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 统计
 */
router.post('/statis', function (req, res, next) {
  res.send(JSON.stringify({ code: 1000, data: { systemInfo: System.systemInfo(), dataVersionTag: System.getDataVersionTag(), heapSpace: System.getHeapSpaceStatistics(), heap: System.getHeapStatistics() } }));
});
module.exports = router;