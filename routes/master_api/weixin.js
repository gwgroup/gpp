var express = require('express');
var router = express.Router();
var weixinMpService = require('../../services/weixin-mp');
/**
* 微信网络检测
*/
router.post('/net_check', function (req, res, next) {
  weixinMpService.weixinNetCheck((err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 创建菜单
 */
router.post('/create_menu', function (req, res, next) {
  weixinMpService.createMenu(req.body, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 获取菜单
 */
router.post('/get_menu', function (req, res, next) {
  weixinMpService.getMenu((err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 创建标签
 */
router.post('/create_tag', function (req, res, next) {
  weixinMpService.createTag(req.body, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 更新标签
 */
router.post('/update_tag', function (req, res, next) {
  weixinMpService.updateTag(req.body, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 删除标签
 */
router.post('/remove_tag', function (req, res, next) {
  weixinMpService.removeTag(req.body, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 获取标签
 */
router.post('/get_tags', function (req, res, next) {
  weixinMpService.getTags((err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 获取用户下的所有标签
 */
router.post('/get_tags_with_user', function (req, res, next) {
  weixinMpService.getTagsWithUser(req.body, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 根据标签获取所有粉丝OPENID
 */
router.post('/get_fans_with_tag', function (req, res, next) {
  weixinMpService.getFansWithTag(req.body, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 绑定标签给批量用户
 */
router.post('/batch_user_bind_tag', function (req, res, next) {
  weixinMpService.batchUserBindTag(req.body, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 解绑标签给批量用户
 */
router.post('/batch_user_unbind_tag', function (req, res, next) {
  weixinMpService.batchUserUnbindTag(req.body, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});


/**
 * 获取用户基本信息
 */
router.post('/get_user_info', function (req, res, next) {
  weixinMpService.getUserInfo(req.body.openid, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 批量获取用户基本信息
 */
router.post('/batch_get_user_info', function (req, res, next) {
  weixinMpService.batchGetUserInfo(req.body, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

/**
 * 获取关注了公众号的openid
 */
router.post('/get_follow_openids', function (req, res, next) {
  weixinMpService.getFollowOpenids(req.body.next_openid, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(JSON.stringify({ code: 1000, data: result }));
  });
});

module.exports = router;