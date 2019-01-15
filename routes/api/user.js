var express = require('express');
var router = express.Router();
var userService = require('../../services/user');
router.post('/login', function (req, res, next) {
    userService.login(req.body, (err, token) => {
        if (err) {
            return next(err);
        }
        res.send(JSON.stringify({ code: 1000, data: token }));
    });
});
module.exports = router;