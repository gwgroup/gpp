var fs = require("fs");
var zlib = require('zlib');

// 解压 input.txt.gz 文件为 input.txt

fs.createReadStream('./config.js')
    .pipe(zlib.createGzip({}))
    .pipe(fs.createWriteStream('./config2.zip'));

console.log("ok");

module.exports=zlib;