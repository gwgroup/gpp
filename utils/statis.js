var v8 = require('v8');
//console.log(v8.getHeapSpaceStatistics());

/*
总堆大小: 6590464,
可执行的总堆大小：1048576，
总物理尺寸：6590464，
可用总尺寸：1520472712，
已用堆大小：4191696，
堆大小限制：1526909922，
内存错误：8192，
峰值内存：420504，
ou zap_垃圾：0
  total_heap_size: 6590464,
  total_heap_size_executable: 1048576,
  total_physical_size: 6590464,
  total_available_size: 1520472712,
  used_heap_size: 4191696,
  heap_size_limit: 1526909922,
  malloced_memory: 8192,
  peak_malloced_memory: 420504,
  does_zap_garbage: 0
*/
//console.log(v8.getHeapStatistics());
//console.log(v8.cachedDataVersionTag());

const os = require('os');
var systemInfo = function () {
    return {
        cpus: os.cpus(),
        freemem: os.freemem(),
        userInfo: os.userInfo(),
        EOL: os.EOL,
        arch: os.arch(),
        homedir: os.homedir(),
        hostname: os.hostname(),
        loadavg: os.loadavg(),
        networkInterfaces: os.networkInterfaces(),
        platform: os.platform(),
        release: os.release(),
        tmpdir: os.tmpdir(),
        totalmem: os.totalmem(),
        type: os.type(),
        uptime: os.uptime()
    };
};

module.exports = {v8,os,getDataVersionTag: v8.cachedDataVersionTag, getHeapStatistics: v8.getHeapStatistics, getHeapSpaceStatistics: v8.getHeapSpaceStatistics, systemInfo };
 let info=systemInfo();
 console.log(info);