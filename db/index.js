const mysql = require('mysql')

//创建数据库连接对象
const db = mysql.createPool({
    host:"127.0.0.1",
    user:'root',
    password:'root',
    database:'shopping',
    multipleStatements: true,//实现多条指令查询数据库
})

module.exports = db