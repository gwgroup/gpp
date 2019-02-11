/**
 * 云通信基础能力业务短信发送、查询详情以及消费消息示例，供参考。
 * Created on 2017-07-31
 */
const SMSClient = require('@alicloud/sms-sdk');
const smsconfig = require('../config').sms;
const accessKeyId = smsconfig.accessKeyId;
const secretAccessKey = smsconfig.secretAccessKey;
const TEMPLATES = smsconfig.templates;
const signName = smsconfig.signName;
//初始化sms_client
let smsClient = new SMSClient({ accessKeyId, secretAccessKey })
//发送短信
/**
 * 
 * @param {*} phoneNumbers 电话号码，逗号分隔
 * @param {*} templateCode 模板ID
 * @param {*} params  json params
 * @param {*} cb 
 */
var sendSMS = function (phoneNumbers, templateCode, params, cb) {
    smsClient.sendSMS({
        PhoneNumbers: phoneNumbers,
        SignName: signName,
        TemplateCode: templateCode,
        TemplateParam: JSON.stringify(params)
    }).then(function (res) {
        let { Code } = res;
        if (Code === 'OK') {
            //处理返回参数
            console.log(res);
            cb(undefined, res);
        } else {
            console.error(res.Message);
            cb(new Error(res.Message));
        }
    }, function (err) {
        console.error(err);
        cb(err);
    })
};

module.exports = { sendSMS, TEMPLATES };