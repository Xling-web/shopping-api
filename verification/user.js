const { check } = require('express-validator');

exports.reg_login = [
    check('username').isString(),
    check('password').isLength({ min: 6 }).withMessage('密码输入格式错误'),
]

// 商品验证
exports.Addshop = [
    
]