/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: ''
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login.login)
// 用户信息接口（可以用来验证登录态）
router.get('/v1/merchant/:id', controllers.user)

// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中
router.post('/upload', controllers.upload)

// --- 信道服务接口 Demo --- //
// GET  用来响应请求信道地址的
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)




// 创建订单
router.post('/order', validationMiddleware, controllers.order.add)





// 获取购物车商品列表
router.get('/trolley', validationMiddleware, controllers.trolley.list)

// 更新购物车商品列表
router.post('/trolley', validationMiddleware, controllers.trolley.update)

// 添加评论
router.put('/comment', validationMiddleware, controllers.comment.add)

// 获取评论列表
router.get('/comment', controllers.comment.list)

// for o2o

router.post('/v1/mall/banners/merchant_home', controllers.login.wechat)

// 获取商品列表
router.post('/v1/auth/wechat', controllers.login.wechat)
router.get('/v1/mall/category', controllers.product.category)

router.get('/v1/mall/items/hot', controllers.product.list)
// 获取商品详情
router.get('/v1/mall/items', controllers.product.detail)
router.get('/v1/product/:merchantId/:orderId', controllers.product.detail)
// 显示订单
router.post('/v1/mall/order/list', controllers.order.list);
router.post('/v1/order/create', controllers.order.create);
router.post('/v1/order/cancel', controllers.order.cancel);
router.post('/v1/mall/order/count', controllers.order.count);

router.get('/v1/mall/order/:merchantId/:orderId', controllers.order.detail);
// 商品添加到购物车列表
router.post('/v1/trolley/list', controllers.trolley.add)
router.post('/v1/mall/order/onlinePayment', controllers.order.pay);

router.post('/v1/mall/promotions/selectGoods', controllers.promotion.goods)
router.post('/v1/mall/promotions/selectCombGoods', controllers.promotion.kind)
router.post('/v1/mall/promotions/item', controllers.promotion.item)
router.post('/v1/mall/promotions/calc', controllers.promotion.calc)
router.post('/v1/mall/promotions/calcAmount', controllers.promotion.calcAmount)
module.exports = router
