var util = require('./utils/index'),
  redisClient = util.Redis;
var async = require('async');
/**
 * 初始化REDIS批次单号
 */
function redisBatchNo() {
  //初始化REDIS批次单号
  util.MysqlHelper.query(
    `
    SELECT
    'rh_red_packet_batch_no' \`type\`,
    MAX(\`batch_no\`) batch_no,
    \`user_id\`
    from
    \`gpp\`.\`pp_red_packet\`
    GROUP BY user_id
    UNION ALL
    SELECT
    'rh_gift_batch_no' \`type\`,
    MAX(\`batch_no\`) batch_no,
    \`user_id\`
    FROM
    \`gpp\`.\`pp_gift\`
    GROUP BY user_id;
    `,
    [],
    (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      async.eachSeries(
        result,
        (item, cb) => {
          let key = `${item.type}_${item.user_id}`;
          let val = item.batch_no;
          redisClient.client.set(key, val, 'NX', (err, reply) => {
            if (err) {
              return cb(err);
            }
            if (reply === 'OK') {
              console.debug('INIT-REDIS-BATCH-NO', key, val, 'NX');
            } else {
              console.warn('INIT-REDIS-BATCH-NO', key, val, 'NX', 'SKIP');
            }
            cb(undefined);
          });
        },
        (err) => {
          if (err) {
            console.error('INIT-REDIS-BATCH-NO', '初始化批次单号发生错误', err);
          }
        }
      );
    }
  );
};
module.exports = { redisBatchNo };