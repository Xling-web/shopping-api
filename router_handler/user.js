const bcrypt = require('bcryptjs')
const jsonwebtoken = require("jsonwebtoken")
// 引入验证码
const svgCaptcha = require('svg-captcha');
// 引入token
const jwt = require('../utils/jwt')
// 校验字段
const { validationResult } = require('express-validator');

const {useSql} = require('../utils/constant')

// 注册新用户函数
exports.regUser = async (req,res)=>{
    const userInfo = req.body;
    // 获取提交过来的数据
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.cc(errors.array()[0].msg)
    }

    // 定义sql语句，判断用户名是否合法
    const sql = 'select * from admin_user where username=?';
    const result = await useSql(sql,userInfo.username)
    if(typeof(result) === 'string')return res.cc(result)
    if(result.length > 0)return res.cc('用户名被占用，请更换其他用户名')
    // 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
    userInfo.password = bcrypt.hashSync(userInfo.password, 10)
    // 添加入库
    const regsql = 'insert into admin_user set ?'
    const reg = useSql(regsql,{username:userInfo.username,password:userInfo.password})
    if(typeof(result) === 'string')return res.cc(result)
    // SQL 语句执行成功，但影响行数不为 1
    if(reg){
        res.send({ status: 0, msg: '注册成功！' }) 
    }else{
        res.cc('注册用户失败，请稍后再试！')
    }
}

// 登录
exports.login = async (req,res)=>{
    const userInfo = req.body
    const sql = `select * from admin_user where username=?`
    let result = await useSql(sql,userInfo.username)
    if(typeof(result) === 'string')return res.cc(result)
    if(result){
        const compareResult = bcrypt.compareSync(userInfo.password, result[0].password)
        if(!compareResult)return res.cc('密码填写错误')
        // 生成token
        const verifyCode = req.cookies.captcha
        if(verifyCode !== userInfo.code)return res.cc('验证码错误，请重新输入')
        const user = {...result[0]}
        const token = jwt.encrypt(user)
        res.json({
            status:200,
            msg:'登录成功',
            data:result[0],
            token
        })
    }else{
        res.cc('账号或密码错误')
    }
}

// 验证码
exports.verifyCode = (req,res)=>{
    var captcha = svgCaptcha.create({  
        // 翻转颜色 
        inverse: false,  
        // 字体大小 
        fontSize: 60,  
        // 验证码字符中排除 0o1i
        ignoreChars: '0o1i' ,
        // 噪声线条数 
        noise: 1,
    });  
    // 保存到session,忽略大小写
    req.session = captcha.text.toLowerCase(); //toLowerCase()(字符串转化为小写)
    console.log(req.session); //0xtg 生成的验证码
    //保存到cookie 方便前端调用验证
    res.cookie('captcha', req.session,{maxAge:60000});
    // res.setHeader('Content-Type', 'image/svg+xml');
    res.send({
        status:200,
        data:captcha.data,
        msg:"请求成功"
    })
}