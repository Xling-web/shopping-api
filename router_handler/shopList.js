const {useSql} = require('../utils/constant')
const path = require('path')
const moment = require('moment');//获取当前时间
const fs = require('fs');
const res = require('express/lib/response');
const os = require("os")

// 通过字符串原型设置replaceAll()
String.prototype.replaceAll = function(f,e){
    var reg = new RegExp(f,'g');
    return this.replace(reg,e)
}

// 新增商品
exports.addShop = async(req,res)=>{
    const info = req.body;
    // 验证商品表
    const sql = `select * from goodsList where goodsName=?`;
    const repeat = await useSql(sql,info.goodsName)
    if(typeof(repeat) === 'string')return res.cc(repeat)
    if(repeat.length === 1)return res.cc('该商品名称已存在，请更换后重试');
    // 插入规格表数据
    info.tag = await norms(info.norms,res)
    // 插入商品表数据
    delete info.norms
    const addSql = `insert into goodsList set ?`;
    const result = await useSql(addSql,info);
    if(typeof(result) === 'string')return res.cc(result)
    if(result){
        res.json({
            status:200,
            data:null,
            msg:'新增成功'
        })
    }else{
        res.cc('新增失败，请检查数据')
    }
}

// 获取商品数据
exports.shopList = async(req,res)=>{
    const {page,goodsName,goodsSellStatus,id} = req.query;
    const pageSize = 10;
    const pages = `${pageSize*(Number(page)-1)},${pageSize*page}`
    let sql = `select count(*) from goodsList;select * from goodsList order by id asc limit ${pages}`;
    if(id)sql = sql.replaceAll('goodsList',`goodsList where id='${id}'`)
    if(goodsName)sql = sql.replaceAll('goodsList',`goodsList where goodsName='${goodsName}'`)
    if(goodsSellStatus)sql = sql.replaceAll('goodsList',`goodsList where goodsSellStatus='${goodsSellStatus}'`)
    const result = await useSql(sql);
    if(typeof(result) === 'string')return res.cc(result);
    // 获取规格数据
    await Promise.all(result[1].map(async (v)=>{
        v.tag = await normsList(v.tag)
        if(v.tag.length == 1){
            Object.assign(v,{tagsNum:v.tag[0].norms_stock})
        }else{
            if(v.tag.length == 0)return Object.assign(v,{tagsNum:0})
            let num = v.tag.reduce((x,y)=>x.norms_stock+y.norms_stock)
            Object.assign(v,{tagsNum:num})
        }
    }))
    if(result){
        result[1].forEach(v=>{
            v.goodsCoverImg = v.goodsCoverImg.split(",")
        })
        // console.log(result[1])
        res.json({
            status: 200,
            msg: '获取商品数据成功！',
            totals:result[0][0]['count(*)'],
            pageSize:pageSize,
            data:result[1]
        })
    }else{
        res.json({
            status: 100,
            msg: '获取失败',
            data: null,
        })
    }
}

async function normsList(item){
    const sql = `select * from shop_norms where id=?`
    const result = await useSql(sql,item)
    if(typeof(result) === 'string')return res.cc(result)
    if(result){
        return result
    }else{
        res.cc('获取规格数据失败，请检查网络')
    }
}

// id获取商品详情
exports.shopById = async(req,res)=>{
    const {id} = req.params;
    const sql = `select * from goodsList where id='${id}'`;
    const result = await useSql(sql);
    if(typeof(result) === 'string') return res.cc(result)
    // 获取规格数据
    await Promise.all(result.map(async (v)=>{
        v.tag = await normsList(v.tag)
    }))
    if(result){
        if(result[0].goodsCoverImg){
            result.forEach(v=>{
                v.goodsCoverImg = v.goodsCoverImg.split(",")
            })
        }
        res.json({
            status:200,
            data:result[0],
            msg:'查询成功'
        })
    }else{
        res.cc('查询失败')
    }
}

// 修改商品信息
exports.updateShop = async(req,res)=>{
    const info = req.body;
    const sql = `select * from goodsList where id<>? and goodsName=?`;
    const result = await useSql(sql,[info.id,info.goodsName]);
    if(typeof(result) === ' string')return res.cc(result);
    if(result.length > 1)return res.cc('商品名称被占用，请更换后重试');
    // 修改规格表数据
    info.tag = await uploadNorms(info.norms,res)
    delete info.norms
    const upSql = `update goodsList set ? where id=?`;
    const upDate = await useSql(upSql,[info,info.id]);
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

// 删除商品
exports.deleteShopId = async(req,res)=>{
    const {id} = req.params;
     // 删除规格数据
    await deleteNorms(id,res)

    const sql = `delete from goodsList where id='${id}'`
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

// 商品状态修改
exports.uploadStatus = async(req,res)=>{
    const info = req.body;
    const sql = `update goodsList set goodsSellStatus=? where id=?`;
    const result = await useSql(sql,[info.goodsSellStatus,info.id])
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

// 分类select查询
exports.cateByList = async(req,res)=>{
    const sql = `select * from sort order by id asc`
    const result = await useSql(sql)
    if(typeof(result) === 'string')return res.cc(result)
    if(result){
        // console.log(result)
        res.json({
            status:200,
            msg: '获取分类数据成功！',
            data:result
        })
    }else{
        res.cc('查询失败，请检查网络')
    }
}

// 上传图片
exports.uploadImg = async (req,res)=>{
    const couter = os.networkInterfaces()
    for (var cm in couter) {
        var cms = couter[cm]
    }
    console.log(cms[1].address)
    // console.log(req.protocol)
    const files = req.files
    const route = path.join(__dirname, '../public/uploads/')
    let data = '';
    let imgUrls = [];
    files.forEach((val) => {
        const imgUrl = val.filename+val.mimetype.replace('image/','.')
        fs.renameSync(route+val.filename,route+imgUrl);
        data += `('http://${cms[1].address}:81/static/uploads/${imgUrl}','${moment().format('YYYY-MM-DD HH:mm:ss')}'),`
        imgUrls.push({url:`http://${cms[1].address}:81/static/uploads/${imgUrl}`})
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

// 删除规格
async function deleteNorms (item,res){
    // 删除规格数据
    const sql = `select * from goodsList where id='${item}'`
    const result = await useSql(sql)
    if(typeof(result) === 'string')return res.cc(result)
    const delSql = `delete from shop_norms where id = ${result[0].tag}`
    const delresult = await useSql(delSql)
    if(typeof(delresult) === 'string')return res.cc(delresult)
}
// 修改规格
async function uploadNorms (item,res){
    // 删除规格数据
    const sql = `delete from shop_norms where id = ?`;
    const result = await useSql(sql,item[0].id)
    if(typeof(result) === 'string')return res.cc(result)
    // 添加规格数据
    const id = item[0].id
    let normsData = ''
    item.map(v=>{
        normsData += `('${id}','${v.norms_name}','${v.norms_price}','${v.norms_stock}'),`
    })
    normsData=normsData.slice(0,normsData.length-1)
    const addNorms = `insert into shop_norms (id,norms_name,norms_price,norms_stock) values ${normsData}`;
    const resultNorms = await useSql(addNorms);
    if(typeof(resultNorms) === 'string')return res.cc(resultNorms)
    return id
}
// 新增规格
async function norms (item,res){
    // 验证规格表
    const sql = `select * from shop_norms`;
    const repeat = await useSql(sql)
    if(typeof(repeat) === 'string')return res.cc(repeat)
    const id = unique(repeat,'id').length+1
    // 添加规格数据
    let normsData = ''
    item.map(v=>{
        if(v.norms_name | v.norms_price | v.norms_stock)
        normsData += `('${id}','${v.norms_name}','${v.norms_price}','${v.norms_stock}'),`
    })
    normsData=normsData.slice(0,normsData.length-1)
    const addNorms = `insert into shop_norms (id,norms_name,norms_price,norms_stock) values ${normsData}`;
    const resultNorms = await useSql(addNorms);
    if(typeof(resultNorms) === 'string')return res.cc(resultNorms)
    return id
}
// 根据id去重
function unique(arr,u_key) {
    let map = new Map()
    arr.forEach((item,index)=>{
      if (!map.has(item[u_key])){
        map.set(item[u_key],item)
      }
    })
    return [...map.values()]
}