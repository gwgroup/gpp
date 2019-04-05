var express = require('express');
var router = express.Router();
var userService = require('../../services/master/user');

/**
 * 登录
 */
router.post('/login', function (req, res, next) {
  userService.login(req.body, (err, token) => {
      if (err) {
          return next(err);
      }
      res.send(JSON.stringify({ code: 1000, data: token }));
  });
});

/**
* 加载用户信息
*/
router.post('/load', function (req, res, next) {
  userService.load(req.token.user_id, (err, result) => {
      if (err) {
          return next(err);
      }
      res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

module.exports = router;