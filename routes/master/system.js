var express = require('express');
var router = express.Router();
var System = require('../../utils/index').System;

/**
 * 统计
 */
router.post('/statis', function (req, res, next) {
  res.send(JSON.stringify({ code: 1000, data: { systemInfo: System.systemInfo(), dataVersionTag: System.getDataVersionTag(), heapSpace: System.getHeapSpaceStatistics(), heap: System.getHeapStatistics() } }));
});
module.exports = router;