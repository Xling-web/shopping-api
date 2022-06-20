/*
 * @Descripttion: token解密与加密
 */
const jwt = require('jsonwebtoken');	//引入jwt包
const expressJwt = require('express-jwt');
const {jwtSecretKey,expiresIn} = require('./config'); // 引入自定义的jwt密钥

// 生成token
let encrypt = (data) => {
  return jwt.sign(data, jwtSecretKey, { expiresIn: expiresIn });
}

// 验证token是否过期
const jwtAuth = expressJwt({
  // 设置密钥
  secret: jwtSecretKey,
  // 设置为true表示校验，false表示不校验
  credentialsRequired: true,
  // 自定义获取token的函数
  getToken: (req) => {
    if (req.headers.authorization) {
      return req.headers.authorization;
    } else if (req.query.token) {
      return req.query.token;
    } else if (req.body.token) {
      return req.body.token;
    }
  }
  // 设置jwt认证白名单，比如/api/login登录接口不需要拦截
}).unless({
  path: [
    {url:'/api/user/login',methods:['POST']},
    {url:'/api/user/register',methods:['POST']},
    {url:'/api/user/verifyCode',methods:['GET']},
    {url:'/api/user/uploadImg',methods:['POST']}
  ]
})

// 解析token
let decrypt = (token) => {
  try {
    let data = jwt.verify(token, jwtSecretKey);
    return {
      gadID: data.gadID,
      token: true
    }
  } catch (err) {
    return {
      gadID: err,
      token: false
    }
  }
}

module.exports = {	//将这两个加密函数和解密函数导出去
  encrypt,
  decrypt,
  jwtAuth
}
