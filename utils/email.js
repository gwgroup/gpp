var emailConfig = require('../config').email;
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transport = nodemailer.createTransport(smtpTransport(emailConfig.options));
/**
 * 发送邮件
 * @param {String} toEmail 
 * @param {String} subject 
 * @param {String} body 
 * @param {Function} cb 
 */
var send = function (toEmail, subject, body, cb) {
  transport.sendMail({
    from: emailConfig.from, to: toEmail, subject, html: body
  }, cb);
};

module.exports = { send };