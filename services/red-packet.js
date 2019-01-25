var util = require('../utils/index'),
    redisClient = util.Redis;
const BATCH_NO_KEY = 'rh_red_packet_batch_no';
/**
 * 生成批次单号
 * @param {String} user_id 用户ID
 * @param {Function} cb 
 */
function generateBatchNo(user_id,cb) {
    redisClient.incr(`${BATCH_NO_KEY}_${user_id}`, (err, result) => {
        if (err) {
            return cb(err);
        }
        cb(undefined, 'RH' + util.PrefixInteger(result, 6));
    });
}
module.exports = { generateBatchNo };
// generateBatchNo((err,val)=>{
//     console.log(err,val);
// });