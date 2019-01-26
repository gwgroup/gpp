var util = require('../utils/index'),
    redisClient = util.Redis;
const BATCH_NO_KEY = require('../config').redis_keys.BATCH_NO_KEY;
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
        cb(undefined,result);
    });
}

module.exports = { generateBatchNo };

// generateBatchNo('f8316388-1562-11e9-ab14-d663bd873d93',(err,val)=>{
//     console.log(err,val);
// });