var util = require('../utils'),
    MysqlHelper = util.MysqlHelper,
    BusinessError = util.BusinessError,
    config = require('../config'),
    tokenService = require('./token'),
    async = require('async');
    
/**
 * 登录
 * @param {Object} params username,password
 * @param {Function} cb 回调函数 返回token
 */
var login = function ({ username, password }, cb) {
    if (!username || !password) {
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
    FROM (\`mobile\`=? OR \`email\`=?) AND \`password\`=?
        \`gpp\`.\`pt_user\`
    WHERE 
    LIMIT 0, 1;
    `, [username, username, util.getSha256CodeWith20(password)], (err, result) => {
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
 * 用户注册(手机号)
 * @param {Object} params 
 * @param {Function} cb 
 */
var regeditWithMobile = function ({ mobile, vali_code, password, display_name }, cb) {
    if (!(mobile && vali_code && password && display_name)) {
        return cb(BusinessError.create(config.codes.paramsError));
    }
    async.waterfall(
        [
            (cb) => {
                //1.检查验证码
                MysqlHelper.query(`
                SELECT *
                FROM \`gpp\`.\`pt_verify_code\`
                WHERE \`deleted\`=0 AND \`mobile\`=? AND \`code\`=?
                ORDER BY create_time DESC
                LIMIT 0, 1;
                `, [mobile, vali_code], cb);
            },
            (result, fields, cb) => {
                if (result[0]) {
                    //1.1.验证码不存在
                    return cb(BusinessError.create(config.codes.valiCodeNotExist));
                }
                if (result[0].create_time.getTime() < Date.now() - config.expires.smsValiCode) {
                    //1.2.验证码过期
                    return cb(BusinessError.create(config.codes.valiCodeExpire));
                }
                //2.确认手机号是否重复
                MysqlHelper.query(`
                SELECT *
                FROM \`gpp\`.\`pt_user\`
                WHERE \`mobile\`=?
                LIMIT 0, 1;
                `, [mobile], cb);
            },
            (result, fields, cb) => {
                //2.1.手机号用户已存在
                if (result.length > 0) {
                    return cb(BusinessError.create(config.codes.userExist));
                }
                //3.插入记录
                MysqlHelper.query(`
                insert into \`gpp\`.\`pt_user\` (
                    \`id\`,
                    \`display_name\`,
                    \`mobile\`,
                    \`password\`
                )
                values (?,?,?,?);
                `, [util.generateUUID(), display_name, mobile, util.getSha256CodeWith20(password)], cb);
            }
        ],
        cb
    );
};

/**
 * 用户注册(手机号)
 * @param {Object} params 
 * @param {Function} cb 
 */
var regeditWithEmail = function ({ email, vali_code, password, display_name }, cb) {
    if (!(email && vali_code && password && display_name)) {
        return cb(BusinessError.create(config.codes.paramsError));
    }
    async.waterfall(
        [
            (cb) => {
                //1.检查验证码
                MysqlHelper.query(`
                SELECT *
                FROM \`gpp\`.\`pt_verify_code\`
                WHERE \`deleted\`=0 AND \`email\`=? AND \`code\`=?
                ORDER BY create_time DESC
                LIMIT 0, 1;
                `, [email, vali_code], cb);
            },
            (result, fields, cb) => {
                if (!result[0]) {
                    //1.1.验证码不存在
                    return cb(BusinessError.create(config.codes.valiCodeNotExist));
                }
                if (result[0].create_time.getTime() < Date.now() - config.expires.emailValiCode) {
                    //1.2.验证码过期
                    return cb(BusinessError.create(config.codes.valiCodeExpire));
                }
                //2.确认手机号是否重复
                MysqlHelper.query(`
                SELECT *
                FROM \`gpp\`.\`pt_user\`
                WHERE \`email\`=?
                LIMIT 0, 1;
                `, [email], cb);
            },
            (result, fields, cb) => {
                //2.1.手机号用户已存在
                if (result.length > 0) {
                    return cb(BusinessError.create(config.codes.userExist));
                }
                //3.插入记录
                MysqlHelper.query(`
                insert into \`gpp\`.\`pt_user\` (
                    \`id\`,
                    \`display_name\`,
                    \`email\`,
                    \`password\`
                )
                values (?,?,?,?);
                `, [util.generateUUID(), display_name, email, util.getSha256CodeWith20(password)], cb);
            }
        ],
        cb
    );
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
                let time = new Date(Date.now() - (config.expires.smsValiCode));
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
                //1.查询电话号码4分钟内发送的邮件记录 
                let time = new Date(Date.now() - (config.expires.emailValiCode));
                let sql = 'SELECT `id`,`code`,`email`,`ip`,`create_time` FROM `gpp`.`pt_verify_code` WHERE mobile=? AND create_time>?;';
                MysqlHelper.query(sql, [email, time], cb);
            }, (result, fields, cb) => {
                //2.检查是否过多发送邮件
                if (result.length > 0) {
                    return cb(BusinessError.create(config.codes.emailTooMany));
                }
                MysqlHelper.query('insert into `gpp`.`pt_verify_code` (`email`,`code`,`ip`) values (?,?,?);', [email, code, ip], cb);
            }, (result, fields, cb) => {
                //3.发送邮件
                util.Email.send(email, '账户验证码', `您邮箱(${email})的验证码为: ${code} , 请不要透露给任何人.`, cb);
            }
        ], cb
    );
};

/**
 * 重置密码(邮箱账户)
 * @param {Object} params 
 * @param {Function} cb 
 */
var resetEmailAccountPassword = function ({ email, vali_code, password }, cb) {
    if (!(email && vali_code && password)) {
        return cb(BusinessError.create(config.codes.paramsError));
    }
    email = email.toLowerCase();
    newPassword = util.getSha256CodeWith20(password);
    async.waterfall(
        [
            (cb) => {
                //1.检查验证码
                //2.检查用户名
                MysqlHelper.query(`
                    SELECT
                        *
                    FROM
                        \`gpp\`.\`pt_user\`
                    WHERE \`email\`=?
                    LIMIT 0, 1;
                    SELECT
                        *
                    FROM
                        \`gpp\`.\`pt_verify_code\`
                    WHERE \`deleted\`=0 AND \`email\`=? AND \`code\`=?
                    ORDER BY create_time DESC
                    LIMIT 0, 1;
                `,
                    [email, email, vali_code],
                    (err, results) => {
                        if (err) {
                            return cb(err);
                        }
                        let user = results[0][0];
                        let valicode = results[1][0];
                        if (!user) {
                            //不存在用户
                            return cb(BusinessError.create(config.codes.userMissing));
                        }
                        if (!valicode) {
                            //验证码不存在
                            return cb(BusinessError.create(config.codes.valiCodeNotExist));
                        }
                        if (valicode.create_time.getTime() < Date.now() - config.expires.emailValiCode) {
                            //1.2.验证码过期
                            return cb(BusinessError.create(config.codes.valiCodeExpire));
                        }
                        if (user.password === newPassword) {
                            //不能同一口令
                            return cb(BusinessError.create(config.codes.equalPassword));
                        }
                        cb(undefined, user.id);
                    },
                    (user_id, cb) => {
                        //3.修改密码
                        MysqlHelper.query(`
                        UPDATE
                        \`gpp\`.\`pt_user\`
                        SET
                        \`password\` = ?,
                        WHERE \`id\` = ?;
                        `, [newPassword, user_id], cb);
                    }
                );
            }
        ], cb);
};

/**
 * 重置密码(手机账户)
 * @param {Object} params 
 * @param {Function} cb 
 */
var resetMobileAccountPassword = function ({ mobile, vali_code, password }, cb) {
    if (!(mobile && vali_code && password)) {
        return cb(BusinessError.create(config.codes.paramsError));
    }
    mobile = mobile.toLowerCase();
    newPassword = util.getSha256CodeWith20(password);
    async.waterfall(
        [
            (cb) => {
                //1.检查验证码
                //2.检查用户名
                MysqlHelper.query(`
                    SELECT
                        *
                    FROM
                        \`gpp\`.\`pt_user\`
                    WHERE \`mobile\`=?
                    LIMIT 0, 1;
                    SELECT
                        *
                    FROM
                        \`gpp\`.\`pt_verify_code\`
                    WHERE \`deleted\`=0 AND \`mobile\`=? AND \`code\`=?
                    ORDER BY create_time DESC
                    LIMIT 0, 1;
                `,
                    [mobile, mobile, vali_code],
                    (err, results) => {
                        if (err) {
                            return cb(err);
                        }
                        let user = results[0][0];
                        let valicode = results[1][0];
                        if (!user) {
                            //不存在用户
                            return cb(BusinessError.create(config.codes.userMissing));
                        }
                        if (!valicode) {
                            //验证码不存在
                            return cb(BusinessError.create(config.codes.valiCodeNotExist));
                        }
                        if (valicode.create_time.getTime() < Date.now() - config.expires.smsValiCode) {
                            //1.2.验证码过期
                            return cb(BusinessError.create(config.codes.valiCodeExpire));
                        }
                        if (user.password === newPassword) {
                            //不能同一口令
                            return cb(BusinessError.create(config.codes.equalPassword));
                        }
                        cb(undefined, user.id);
                    },
                    (user_id, cb) => {
                        //3.修改密码
                        MysqlHelper.query(`
                        UPDATE
                        \`gpp\`.\`pt_user\`
                        SET
                        \`password\` = ?,
                        WHERE \`id\` = ?;
                        `, [newPassword, user_id], cb);
                    }
                );
            }
        ], cb);
};


module.exports = { login, regeditWithMobile, regeditWithEmail, sendValiSMS, sendValiEmail, resetEmailAccountPassword, resetMobileAccountPassword };
// sendValiEmail({ email: 'newbreach@live.cn', ip: '203.94.45.68' }, (err, result) => {
//     console.log(err, result);
// });