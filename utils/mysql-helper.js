var mysql = require('mysql');
var mysqlConfig = require('../config').mysql;
var pool = mysql.createPool(mysqlConfig);
/**
 * 查询
 * @param {String} sql 
 * @param {Array} params 
 * @param {Function} callback 
 */
var query = function (sql, params, callback) {
    pool.getConnection(function (err, connection) {
        if (err) return callback(err); // not connected!'
        connection.query({ sql: sql }, params ? params : [], function (error, results, fields) {
            connection.release();
            callback(error, results, fields);
        });
    });
};
module.exports = { pool, query, mysql };

query('select * from gpp.pt_user',[],(err,result)=>{
    console.log(err,result);
})