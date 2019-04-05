var util = require('../../utils/index'),
    MysqlHelper = util.MysqlHelper,
    BusinessError = util.BusinessError,
    config = require('../../config'),
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
        \`display_name\`,
        \`mobile\`,
        \`email\`,
        \`create_time\`,
        \`update_time\`
    FROM 
        \`gpp\`.\`master_user\`
    WHERE (\`mobile\`=? OR \`email\`=?) AND \`password\`=?
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
 * 加载用户数据
 * @param {String} user_id 
 * @param {Function} cb 
 */
function load(user_id, cb) {
    MysqlHelper.query(`
    SELECT
    a.\`id\`,
    a.\`display_name\`,
    a.\`mobile\`,
    a.\`email\`,
    a.\`create_time\`,
    a.\`update_time\`
    FROM
    \`gpp\`.\`master_user\` a
    WHERE a.\`id\`=?
    LIMIT 0, 1;
    `,
        [user_id],
        (err, result) => {
            if (err) {
                return cb(err);
            }
            return cb(undefined, result[0]);
        });
}

module.exports = { login, load };
// sendValiEmail({ email: 'newbreach@live.cn', ip: '203.94.45.68' }, (err, result) => {
//     console.log(err, result);
// });