var util = require('../utils'),
    MysqlHelper = util.MysqlHelper,
    BusinessError = util.BusinessError,
    config = require('../config'),
    tokenService = require('./token'),
    async = require('async');
/**
 * 登录
 * @param {Object} params mobile,password
 * @param {Function} cb 回调函数 返回token
 */
var login = function ({ mobile, password }, cb) {
    if (!mobile || !password) {
        return cb(BusinessError.create(config.codes.paramsError));
    }
    MysqlHelper.query(`
    SELECT
        \`id\`,
        \`diplay_name\`,
        \`mobile\`,
        \`email\`,
        \`account_money\`,
        \`create_time\`,
        \`update_time\`
    FROM
        \`gpp\`.\`pt_user\`
    LIMIT 0, 1;
    `, [mobile, util.getSha256CodeWith20(password)], (err, result) => {
            if (err) {
                return cb(err);
            }
            let user = result[0];
            if (!user) {
                return cb(BusinessError.create(config.codes.loginFail));
            }
            tokenService.insertToken(user.id, cb);
        }
    );
};

/**
 * 用户注册
 * @param {Object} params 
 * @param {Function} cb 
 */
var regedit = function (params, cb) {

};

/**
 * 发送短信验证码
 * @param {Object} params 
 * @param {Function} cb 
 */
var sendValiSMS = function ({ mobile, ip }, cb) {
    async.waterfall(
        [
            (cb) => {
                //1.查询电话号码2分钟内发送的短信记录 
                let time = new Date(Date.now() - (1000 * 120));
                let sql = 'SELECT `id`,`code`,`mobile`,`ip`,`create_time` FROM `gpp`.`pt_verify_code` WHERE mobile=? AND create_time>?;';
                MysqlHelper.query(sql, [mobile, time], cb);
            }, (result, fields, cb) => {
                //2.检查是否过多发送短信
                if (result.length > 0) {
                    return cb(BusinessError.create(config.codes.smsTooMany));
                }
                let code = util.generateValiCode(10, 6);
                MysqlHelper.query('insert into `gpp`.`pt_verify_code` (`mobile`,`code`,`ip`) values (?,?,?);', [mobile, code, ip], cb);
            }, (result, fields, cb) => {
                //3.发送短信
                cb(undefined);
            }
        ], cb
    );
};

/**
 * 发送邮件验证码
 * @param {Object} params 
 * @param {Function} cb 
 */
var sendValiEmail = function ({ email, ip }, cb) {
    let code = util.generateValiCode(10, 6);
    async.waterfall(
        [
            (cb) => {
                //1.查询电话号码2分钟内发送的邮件记录 
                let time = new Date(Date.now() - (1000 * 120));
                let sql = 'SELECT `id`,`code`,`email`,`ip`,`create_time` FROM `gpp`.`pt_verify_code` WHERE mobile=? AND create_time>?;';
                MysqlHelper.query(sql, [email, time], cb);
            }, (result, fields, cb) => {
                //2.检查是否过多发送邮件
                if (result.length > 0) {
                    return cb(BusinessError.create(config.codes.smsTooMany));
                }
                MysqlHelper.query('insert into `gpp`.`pt_verify_code` (`email`,`code`,`ip`) values (?,?,?);', [email, code, ip], cb);
            }, (result, fields, cb) => {
                //3.发送邮件
                util.Email.send(email, '账户验证码', `您邮箱(${email})的验证码为: ${code} , 请不要透露给任何人.`, cb);
            }
        ], cb
    );
};

module.exports = { login, regedit, sendValiSMS, sendValiEmail };
// sendValiEmail({ email: 'newbreach@live.cn', ip: '203.94.45.68' }, (err, result) => {
//     console.log(err, result);
// });