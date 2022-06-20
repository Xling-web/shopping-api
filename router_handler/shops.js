const {useSql} = require('../utils/constant')
const path = require('path')
const moment = require('moment');//获取当前时间
const fs = require('fs');
const { type } = require('express/lib/response');

// 通过字符串原型设置replaceAll()
String.prototype.replaceAll = function(f,e){
    var reg = new RegExp(f,'g');
    return this.replace(reg,e)
}

// 获取分类列表
exports.cateList = async(req,res)=>{
    const {page,sortName,state} = req.query
    const pageSize = 10;
    const pages = `${pageSize*(Number(page)-1)},${pageSize*page}`
    let sql = `select count(*) from sort where is_delete=0;select * from sort where is_delete=0 order by id asc limit ${pages}`;
    if(sortName)sql = sql.replaceAll('is_delete=0',`is_delete=0 and sortName='${sortName}'`);
    if(state)sql = sql.replaceAll('is_delete=0',`is_delete=0 and state='${state}'`);

    const result = await useSql(sql,[sortName,state,sortName,state])
    if(typeof(result) === 'string') return res.cc(result)
    if(result){
        res.json({
            status: 200,
            msg: '获取分类数据成功！',
            totals:result[0][0]['count(*)'],
            pageSize:pageSize,
            data:result[1]
        })
    }else{
        res.cc('获取失败')
    }
}

// 新增商品分类
exports.addSort = async (req,res)=>{
    const info = req.body
    const sql = 'select * from sort where sortName=?'
    const result = await useSql(sql,info.sortName)
    if(typeof(result) === 'string')return res.cc(result)
    if(result.length !== 0)return res.cc('分类名称被占用，请更换后重试')

    // 定义插入商品分类数据
    const insertSql = `insert into sort set ?`
    info['add_time'] = moment().format('YYYY-MM-DD HH:mm:ss')
    const results = await useSql(insertSql,info)
    if(typeof(results) === 'string')return res.cc(results)
    if(results){
        res.json({
            status:200,
            data:null,
            msg:'新增成功'
        })
    }else{
        res.cc('新增商品分类失败！')
    }
}

// 删除分类
exports.deleteById = async(req,res)=>{
    const info = req.params;
    const sql = 'update sort set is_delete=1 where id=?';
    const result = await useSql(sql,info.id)
    if(typeof(result) === 'string')return res.cc(result)
    if(result){
        res.json({
            status:200,
            data:null,
            msg:'删除成功'
        })
    }else{
        res.cc('删除商品分类失败！')
    }
}

// id获取分类详情
exports.getCateId = async(req,res)=>{
    const {id} = req.params;
    const sql = 'select * from sort where id=?';
    const result = await useSql(sql,id);
    // console.log(result)
    if(typeof(result) === 'string')return res.cc(result)
    if(result){
        res.json({
            status:200,
            data:result[0],
            msg:'查询成功'
        })
    }else{
        res.cc('查询商品分类失败！')
    }
}

// 修改分类数据
exports.updateCateById = async(req,res)=>{
    const info = req.body;
    const sql = `select * from sort where id<>? and sortName=?`;
    const result = await useSql(sql,[info.id,info.sortName]);
    if(typeof(result) === 'string')return res.cc(result);
    if(result.length > 1)return res.cc('分类名称被占用，请更换后重试');
    const upSql = `update sort set ? where id=?`;
    const upDate = await useSql(upSql,[info,info.id]);
    if(typeof(upDate) === 'string')return res.cc(upDate);
    console.log(upDate)
    if(upDate){
        res.json({
            status:200,
            data:result[0],
            msg:'修改成功'
        })
    }else{
        res.cc('更新商品分类失败！')
    }
}

// 分类状态修改
exports.uploadStatus = async(req,res)=>{
    const info = req.body;
    const sql = `update sort set state=? where id=?`;
    const result = await useSql(sql,[info.state,info.id])
    if(typeof(result) === 'string')return res.cc(result);
    if(result){
        res.json({
            status:200,
            data:null,
            msg:'修改成功'
        })
    }else{
        res.cc('更新分类状态失败！')
    }
}

// 上传图片
exports.uploadImg = async (req,res)=>{
    // console.log(req.protocol)
    const files = req.files
    const route = path.join(__dirname, '../public/uploads/')
    let data = '';
    let imgUrls = [];
    files.forEach((val) => {
        const imgUrl = val.filename+val.mimetype.replace('image/','.')
        fs.renameSync(route+val.filename,route+imgUrl);
        data += `('/static/uploads/${imgUrl}','${moment().format('YYYY-MM-DD HH:mm:ss')}'),`
        imgUrls.push({url:`/static/uploads/${imgUrl}`})
    });
    data=data.slice(0,data.length-1)
    // const imgUrl = req.file.filename+req.file.mimetype.replace('image/','.')
    // fs.renameSync(route+req.file.filename,route+imgUrl);
    // const data = {uploadImg:'/static/uploads/'+imgUrl,create_time:moment().format('YYYY-MM-DD HH:mm:ss')}
    // const sql = `insert into upload set ?`
    const sql = `insert into upload (uploadImg, create_time) values ${data}`;
    const result = await useSql(sql)
    if(typeof(result) === 'string')return res.cc(result)
    if(result){
        res.json({
            status:200,
            data:imgUrls,
            msg:'上传成功'
        })
    }else{
        res.cc('上传失败')
    }
}