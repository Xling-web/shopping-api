/**
 * 描述: 程序入口文件
 * 作者: xling
 * 日期: 2022/3/3
*/

const express = require('express');
const userRouter = require('./adminApi');// 引入user路由模块

const router = express.Router(); // 注册路由
const {jwtAuth} = require('../utils/jwt');// 引入jwt认证函数
router.use(jwtAuth); // 注入认证模块

router.use('/api/user',userRouter);// 注入用户路由模块

// 自定义统一异常处理中间件，需要放在代码最后
router.use((err, req, res, next) => {
    // 自定义用户认证失败的错误返回
    if (err && err.name === 'UnauthorizedError') {
      const { status = 401, message } = err;
      // 抛出401异常
      res.status(status).json({
        code: status,
        msg: 'token失效，请重新登录'
      })
    } else {
      console.log('err',err)
      const { output } = err || {};
      // 错误码和错误信息
      const errCode = (output && output.statusCode) || 500;
      const errMsg = (output && output.payload && output.payload.error) || err.message;
      res.status(errCode).json({
        code: errCode,
        msg: errMsg
      })
    }
})

module.exports = router