var express = require('express');
var router = express.Router();
var BusinessError = require('../../utils/index').BusinessError;
var openUrls = ['/api/user/login', '/api/user/regedit', '/api/user/reset'];
var config = require('../../config');
var CODES = config.codes;
var tokenService = require('../../services/token');
var userRouter = require('./user');
router.use(function (req, res, next) {
  if (openUrls.indexOf(req.originalUrl) != -1) {
    return next();
  }
  //1.用户是否持有token，没有提示无权限访问，请登录 return
  //2.判断用户持有的token是否过期，如果过期，请登录 return
  //3.给req赋值user数据
  //4.执行延迟token有效期
  //5.next
  let token = req.headers.authorization;
  if (!token) {
    return next(BusinessError.create(CODES.invalidToken));
  } else {
    tokenService.checkToken(token, function (err, tokenObject) {
      if (err) {
        console.error(err);
        return next(BusinessError.create(CODES.serverError));
      }
      if (!tokenObject) {
        return next(BusinessError.create(CODES.invalidToken));
      } else {
        req.token = tokenObject;
        next();
        //延时token
        tokenService.delay(token);
      }
    });
  }
});

router.use('/user', userRouter);

router.use(function (err, req, res, next) {
  if (err instanceof BusinessError) {
    return res.send(err.toJsonString());
  }
  console.error(err);
  res.status(500).send(JSON.stringify({ message: strings.serverError, code: err.code | CODES.serverError }));
});

module.exports = router;
