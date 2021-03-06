var express = require('express');
var router = express.Router();
var userService = require('../../services/user');
var util = require('../../utils/index');

/**
 * 登录
 */
router.post('/login', function (req, res, next) {
    userService.login(req.body, (err, token) => {
        if (err) {
            return next(err);
        }
        res.send(JSON.stringify({ code: 1000, data: token }));
    });
});
/**
 * 加载用户信息
 */
router.post('/load', function (req, res, next) {
    userService.load(req.token.user_id, (err, result) => {
        if (err) {
            return next(err);
        }
        res.send(JSON.stringify({ code: 1000, data: result }));
    });
});

/**
 * 发送短信验证码
 */
router.post('/send_vali_sms', function (req, res, next) {
    let ip = util.getClientIp(req);
    userService.sendValiSMS({ mobile: req.body.mobile, ip }, (err, result) => {
        if (err) {
            return next(err);
        }
        res.send(JSON.stringify({ code: 1000 }));
    });
});

/**
 * 发送邮件验证码
 */
router.post('/send_vali_email', function (req, res, next) {
    let ip = util.getClientIp(req);
    userService.sendValiEmail({ email: req.body.email, ip }, (err, result) => {
        if (err) {
            return next(err);
        }
        res.send(JSON.stringify({ code: 1000 }));
    });
});

/**
 * 注册账号(手机号)
 */
router.post('/regedit_with_mobile', function (req, res, next) {
    userService.regeditWithMobile(req.body, (err, result) => {
        if (err) {
            return next(err);
        }
        res.send(JSON.stringify({ code: 1000 }));
    });
});

/**
 * 注册账号（email）
 */
router.post('/regedit_with_email', function (req, res, next) {
    userService.regeditWithEmail(req.body, (err, result) => {
        if (err) {
            return next(err);
        }
        res.send(JSON.stringify({ code: 1000 }));
    });
});

/**
 * 重置邮箱账户密码
 */
router.post('/reset_email_account_password', function (req, res, next) {
    userService.resetEmailAccountPassword(req.body, (err, result) => {
        if (err) {
            return next(err);
        }
        res.send(JSON.stringify({ code: 1000 }));
    });
});

/**
 * 重置手机账户密码
 */
router.post('/reset_mobile_account_password', function (req, res, next) {
    userService.resetMobileAccountPassword(req.body, (err, result) => {
        if (err) {
            return next(err);
        }
        res.send(JSON.stringify({ code: 1000 }));
    });
});

module.exports = router;