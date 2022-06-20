const express = require('express');
const router = express.Router();
const path = require('path')
const multer = require('multer');
const upload = multer({dest:path.join(__dirname, '../public/uploads/')});

// 导入路由处理函数文件
const userHandler = require('../router_handler/user');
const article = require('../router_handler/shops');
const shop = require('../router_handler/shopList');
const banner = require('../router_handler/banner');
// 导入校验
const {reg_login} = require('../verification/user')

// 用户借口
router.post('/register',reg_login,userHandler.regUser)// 注册
router.post('/login',userHandler.login)// 登录
router.get('/verifyCode',userHandler.verifyCode)// 验证码
// 分类接口
router.get('/cateList',article.cateList);//获取分类列表
router.post('/addcates',article.addSort);//新增分类
router.get('/deletecates/:id',article.deleteById);//删除分类
router.get('/getCateId/:id',article.getCateId);//id查询
router.post('/updateCateById',article.updateCateById);//id查询
router.get('/cateByList',shop.cateByList);//分类查询select
router.post('/uploadStatus',article.uploadStatus);//修改分类状态
// 商品接口
router.post('/addShop',shop.addShop);//新增商品
router.get('/shopList',shop.shopList);//获取商品列表
router.get('/shopById/:id',shop.shopById);//id查询
router.post('/updateShop',shop.updateShop);//修改商品信息
router.get('/deleteShopId/:id',shop.deleteShopId);//删除商品
router.post('/uploadStatus',shop.uploadStatus);//修改商品状态
// 轮播图接口
router.post('/addBanner',banner.addBanner);//新增轮播
router.get('/gainList',banner.gainList);//获取轮播列表
router.get('/gainById/:id',banner.gainById);//id获取轮播
router.post('/uploadById',banner.uploadById);//新增轮播
router.get('/delById/:id',banner.delById);//删除轮播
router.post('/disableById',banner.disableById);//修改状态


// 上传图片
router.post('/uploadImg',upload.array('file',5),shop.uploadImg);//上传图片

module.exports = router;