var xml = require('xml'),
  convert = require('xml-js'),
  request = require('request'),
  util = require('../utils/index'),
  safeUtil = util.safe,
  config = require('../config'),
  wxConfig = require('../config').weixin,
  BusinessError = util.BusinessError;

/**
 * 预订单创建
 * @param {String} trade_no 
 * @param {Number} money
 * @param {Function} cb 
 */
var wxOrderCreate = function (trade_no, money, ip, cb) {
  var obj = {
    appid: wxConfig.appid,
    mch_id: wxConfig.mch_id,
    nonce_str: safeUtil.generateSalt(16, 255).toString('hex'),
    body: '优品促销平台-充值服务',
    out_trade_no: trade_no,//trade_no,
    total_fee: money,
    spbill_create_ip: wxConfig.spbill_create_ip,
    notify_url: wxConfig.notify_url,
    trade_type: 'NATIVE'
  };
  obj.sign = generateSign(obj);
  var body = generateXML(obj);
  request.post(wxConfig.prepay_url, { body: body }, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      let result = convert.xml2js(body, { compact: true });
      if (!safeUtil.checkWeixinXML(result.xml)) {
        //请求可能被拦截，xml不合法
        return cb(BusinessError.create(config.codes.wxServerError));
      }
      if (result.xml.return_code._cdata === "SUCCESS" && result.xml.result_code._cdata === "SUCCESS") {
        // console.log('success');
        cb(undefined, result.xml);
      } else {
        console.error('weixin', result.xml);
        cb(BusinessError.create(config.codes.wxOrderError));
      }
    } else {
      console.error(err);
      cb(BusinessError.create(config.codes.wxConnectError));
    }
  });
};

/**
 * 生成xml
 * @param {Object} obj 
 */
var generateXML = function (obj) {
  let list = [];
  for (const key in obj) {
    let element = obj[key];
    let tobj = {};
    tobj[key] = element;
    list.push(tobj);
  }
  return xml({ xml: list });
};

/**
 * 获取sign
 * @param {Object} obj 
 */
var generateSign = function (obj) {
  let result = [];
  for (let field in obj) {
    if (obj[field]) {
      result.push(field + '=' + obj[field]);
    }
  }
  result.sort();
  var sign = result.join('&');
  return safeUtil.MD5(`${sign}&key=${wxConfig.key}`).toUpperCase();
};

/**
 * 查询微信订单状态
 * @param {String} tradeNo 订单号 
 * @param {Function} cb 回调
 */
var wxOrderQuery = function (tradeNo, cb) {
  var obj = {
    appid: wxConfig.appid,
    mch_id: wxConfig.mch_id,
    nonce_str: safeUtil.generateSalt(16, 255).toString('hex'),
    out_trade_no: tradeNo
  };
  obj.sign = generateSign(obj);
  var body = generateXML(obj);
  request.post(wxConfig.order_query_url, { body: body }, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      let result = convert.xml2js(body, { compact: true });
      if (!safeUtil.checkWeixinXML(result.xml)) {
        //请求可能被拦截，xml不合法
        return cb(BusinessError.create(config.codes.wxServerError));
      }
      if (result.xml.return_code._cdata === "SUCCESS" && result.xml.result_code._cdata === "SUCCESS") {
        // console.log('success');
        cb(undefined, result.xml);
      } else {
        console.error('weixin', result.xml);
        cb(BusinessError.create(config.codes.wxOrderStatusError));
      }
    } else {
      console.error(err);
      cb(BusinessError.create(config.codes.wxConnectError));
    }
  });
};

/**
 * 获取订单号
 */
var generateTradeNo = function () {
  return util.dateFormat(new Date(), 'yyyyMMddhhmmssS');
};

module.exports = { wxOrderCreate, wxOrderQuery, generateTradeNo };