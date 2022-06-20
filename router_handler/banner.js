const {useSql} = require('../utils/constant')
const moment = require('moment');//获取当前时间
const res = require('express/lib/response');

// 新增轮播
exports.addBanner = async(req,res)=>{
    const {advert_name,img,aUrl,status} = req.body;
    const sql = `insert into advert (advert_name,img,aUrl,create_time,status) values ('${advert_name}','${img}','${aUrl}','${moment().format('YYYY-MM-DD HH:mm:ss')}','${status}')`
    const result = await useSql(sql)
    if(typeof(result) === 'string')return res.cc(result);
    if(result){
        res.json({
            status:200,
            data:null,
            msg:"新增成功"
        })
    }else{
        res.cc('新增失败，请检查网络')
    }
}

// 获取列表
exports.gainList = async (req,res)=>{
    const {page,advert_name,status,id} = req.query;
    const pageSize = 10;
    const pages = `${pageSize*(Number(page)-1)},${pageSize*page}`
    let sql = `select count(*) from advert;select * from advert order by id asc limit ${pages}`;
    if(id)sql = sql.replaceAll('advert',`advert where id='${id}'`)
    if(advert_name)sql = sql.replaceAll('advert',`advert where advert_name='${advert_name}'`)
    if(status)sql = sql.replaceAll('advert',`advert where status='${status}'`)
    const result = await useSql(sql);
    if(typeof(result) === 'string')return res.cc(result);
    if(result){
        res.json({
            status: 200,
            msg: '获取商品数据成功！',
            totals:result[0][0]['count(*)'],
            pageSize:pageSize,
            data:result[1]
        })
    }else{
        res.cc('获取失败')
    }
}

// id查询
exports.gainById = async(req,res) =>{
    const {id} = req.params;
    const sql = `select * from advert where id=${id}`;
    const result = await useSql(sql)
    if(typeof(result) === 'string')return res.cc(result);
    if(result){
        res.json({
            status:200,
            data:result[0],
            msg:"查询成功"
        })
    }else{
        res.cc('查询失败，请检查网络')
    }
}

// 更新数据
exports.uploadById = async(req,res)=>{
    const info = req.body;
    const sql = `update advert set ? where id=?`;
    const upDate = await useSql(sql,[info,info.id]);
    if(typeof(upDate) === 'string')return res.cc(upDate);
    if(upDate){
        res.json({
            status:200,
            data:null,
            msg:'修改成功'
        })
    }else{
        res.cc('更新商品失败！')
    }
}

//删除轮播
exports.delById = async(req,res)=>{
    const {id} = req.params
    const sql = `delete from advert where id='${id}'`
    const result = await useSql(sql);
    if(typeof(result) === 'string')return res.cc(result)
    if(result){
        res.json({
            status:200,
            msg:"删除成功",
            data:null
        })
    }else{
        res.cc('删除失败')
    }
}

// 修改状态
exports.disableById = async(req,res)=>{
    const {id,status} = req.body;
    const sql = `update advert set status=${status} where id=${id}`;
    const result = await useSql(sql)
    if(typeof(result) === 'string')return res.cc(result);
    if(result){
        res.json({
            status:200,
            data:null,
            msg:'修改成功'
        })
    }else{
        res.cc('更新商品状态失败！')
    }
}