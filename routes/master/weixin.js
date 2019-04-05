var express = require('express');
var router = express.Router();
var weixinMpService = require('../../services/weixin-mp');
/**
* 微信网络检测
*/
router.post('/net_check', function (req, res, next) {
  weixinMpService.weixinNetCheck((err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 创建菜单
 */
router.post('/create_menu', function (req, res, next) {
  weixinMpService.createMenu(req.body, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 获取菜单
 */
router.post('/get_menu', function (req, res, next) {
  weixinMpService.getMenu((err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

module.exports = router;