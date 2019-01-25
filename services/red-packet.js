var util = require('../utils/index'),
    redisClient = util.Redis;
const BATCH_NO_KEY = 'rh_red_packet_batch_no';
/**
 * 生成批次单号
 * @param {Function} cb 
 */
function generateBatchNo(cb) {
    redisClient.incr(BATCH_NO_KEY, (err, result) => {
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