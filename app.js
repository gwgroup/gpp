var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');
//require('body-parser-xml')(bodyParser);
var logger = require('morgan');
var apiRouter = require('./routes/api');
var app = express();
var init = require('./init');
//初始化批次单号
init.redisBatchNo();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept,X-Requested-With,token');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  //res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).send('202')
  }
  next();
});
logger.token('date', function getDateToken(req, res, format) {
  var date = new Date();
  switch (format || 'default') {
    case 'default':
      return date.toLocaleString();
  }
});
logger.token('remote-addr', function (req) {
  var ip = req.headers['x-forwarded-for'] ||
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
  if (ip.split(',').length > 0) {
    ip = ip.split(',')[0];
  }
  return ip;
});
app.use(logger('[:date[default]] :remote-addr :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(bodyParser.xml({
//   limit: '2MB',  
//   xmlParseOptions: {
//     normalize: false,    
//     normalizeTags: false,
//     explicitArray: false
//   }
// }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;