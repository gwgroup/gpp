var util = require('../utils/index');
let email = "xxxx", code = "009988";
util.Email.send("346515490@qq.com", '账户验证码', `您邮箱(${email})的验证码为: ${code} , 请不要透露给任何人.`, (err,result)=>{
    console.log(err,result);
});
