/**
 * 描述: 程序入口文件
 * 作者: xling
 * 日期: 2022/3/1
*/

const express = require('express');// 导入express模块
const app = express();// 创建express的服务器实例
const cookieParser = require('cookie-parser');//cookie配置
const bodyParser = require('body-parser');// 使用body-parser作为请求体解析中间件
const cors = require('cors');// 引入cors模块，用于解决跨越
const routes = require('./router'); //导入自定义路由文件，创建模块化路由
const path = require('path')

app.use('/static', express.static(path.join(__dirname, 'public'))); // 静态资源
app.use(cookieParser());
app.use(bodyParser.json()); // 解析 application/json
app.use(express.urlencoded({extended:false}))// 配置解析表单数据的中间件
app.use(bodyParser.urlencoded({extended:false}));// 解析 application/x-www-form-urlencoded
app.use(cors({credentials:true,origin:true}))// 导入并配置cors
// 解析 multipart/form-data
// const multer = require('multer');
// app.use(multer());

// res.send的简易封装
app.use((req,res,next)=>{
    res.cc = function(err,status=100){
        res.send({
            status,
            msg:err instanceof Error ? err.message : err
        })
    }
    next()
})

// 导入路由文件
app.use('/',routes)

// 指定端口号并启动web服务器
var server = app.listen(81,()=>{
    // var host = server.address().address;
    // var port = server.address().port;
    console.log('Loading...');
})