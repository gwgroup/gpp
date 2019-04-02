var express = require("express");
var async = require("async");
var router = express.Router();
var util = require("../../utils/index");
//var accountService = require('../services/account');
// 微信认证回调
router.get("/cb", function(req, res, next) {
  if (!util.Safe.checkSignature(req.query)) {
    res.status(400).send("fail");
  } else {
    res.send(req.query.echostr);
  }
});
router.post("/cb", function(req, res, next) {
  //console.log(1, req.query);
  console.log(req.rawData,req.body);
  res.send("success");
});

/**
 * 支付回调
 */
router.all("/pay_cb", function(req, res, next) {
  //   console.log(req.query, req.originalUrl, req.body);
  //   var cbObj = req.body.xml,
  //     tradeNo = cbObj.out_trade_no;
  //   async.waterfall(
  //     [
  //       cb => {
  //         accountService.confirmRecharge(tradeNo, cbObj, cb);
  //       },
  //       cb => {
  //         accountService.confirmInAccount(tradeNo, cb);
  //       }
  //     ],
  //     (err, result) => {
  //       if (err) {
  //         console.error(
  //           `微信入账失败! 单号:${cbObj.out_trade_no}, 金额:${cbObj.total_fee /
  //             100}`,
  //           err,
  //           cbObj
  //         );
  //       } else {
  //         console.log(
  //           `微信入账成功! 单号:${cbObj.out_trade_no}, 金额:${cbObj.total_fee /
  //             100}`
  //         );
  res.send(
    "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>"
  );
  //       }
  //     }
  //   );
});
module.exports = router;
