const DB = require('../utils/db.js')

module.exports = {
  detail: async ctx => {
    const orderId = ctx.params.orderId;
    const merchantId = ctx.params.merchantId;
    if (!orderId || !merchantId) {
      ctx.state.data = 'no data'
    } else {

      const result = await DB.query('SELECT * FROM get_order WHERE orderId = ?', [orderId]);
      const orderItem = await DB.query('SELECT * FROM order_items WHERE orderId = ?', [orderId]) || []
      const payment = await DB.query('SELECT * FROM payment WHERE orderId = ?', [orderId]) || []
      // ctx.state.result = { ...result['0'], ...payment['0'], orderItem };
      ctx.state.result = {
        "orderId": "123456",
        "orderStatus": "UNPAY",
        "totalAmount": 8,
        "itemTotalCount": 2,
        "createTime": "2018-08-21 13:25:45",
        "payment": {
          "paymentId": null,
          "paymentMethod": "COD",
          "paymentTime": "2018-08-21 13:25:45",
          "usePoint": 10,
          "cashAmount": 8
        },
        "orderItem": [
          {
            "itemId": "9503c54ba50211e8969e09fe0c96017b",
            "itemSku": null,
            "itemName": "雪碧",
            "quantity": 1,
            "unitPrice": 4.5,
            "locationId": "2",
            "itemSpecification": "200*10",
            "returnQuantit": 0,
            "itemIcon": "http://cnvod.cnr.cn/audio2017/ondemand/img/1100/20180605/1528185342546.jpg"
          },
          {
            "itemId": "8e163dfea50211e8bb72c5949b847d3c",
            "itemSku": null,
            "itemName": "可乐",
            "quantity": 1,
            "unitPrice": 3.5,
            "locationId": "2",
            "itemSpecification": "200*10",
            "returnQuantit": 0,
            "itemIcon": "http://cnvod.cnr.cn/audio2017/ondemand/img/1100/20180605/1528185342546.jpg"
          }
        ],
        "orderReturn": null
      }
    }

  },
  /**
   * 创建订单
   * 
   */
  add: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId
    let productList = ctx.request.body.list || []
    let isInstantBuy = !!ctx.request.body.isInstantBuy

    // 插入订单至 order_user 表
    let order = await DB.query('insert into order_user(user) values (?)', [user])

    // 插入订单至 order_product 表
    let orderId = order.insertId
    let sql = 'INSERT INTO order_product (order_id, product_id, count) VALUES '

    // 插入时所需要的数据和参数
    let query = []
    let param = []

    // 从购物车删除时所需要的数据和参数
    let needToDelQuery = []
    let needToDelIds = []

    productList.forEach(product => {
      query.push('(?, ?, ?)')

      param.push(orderId)
      param.push(product.id)
      param.push(product.count || 1)

      needToDelQuery.push('?')
      needToDelIds.push(product.id)

    })

    await DB.query(sql + query.join(', '), param)

    if (!isInstantBuy) {
      // 非立即购买，购物车旧数据全部删除，此处本应使用事务实现，此处简化了
      await DB.query('DELETE FROM trolley_user WHERE trolley_user.id IN (' + needToDelQuery.join(', ') + ') AND trolley_user.user = ?', [...needToDelIds, user])
    }

    ctx.state.data = {}

  },

  /**
   * 获取已购买订单列表
   * 
   */
  list: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId

    let list = await DB.query('SELECT order_user.id AS `id`, order_user.user AS `user`, order_user.create_time AS `create_time`, order_product.product_id AS `product_id`, order_product.count AS `count`, product.name AS `name`, product.image AS `image`, product.price AS `price` FROM order_user LEFT JOIN order_product ON order_user.id = order_product.order_id LEFT JOIN product ON order_product.product_id = product.id WHERE order_user.user = ? ORDER BY order_product.order_id', [user])

    // 将数据库返回的数据组装成页面呈现所需的格式

    let ret = []
    let cacheMap = {}
    let block = []
    let id = 0
    list.forEach(order => {
      if (!cacheMap[order.id]) {
        block = []
        ret.push({
          id: ++id,
          list: block
        })

        cacheMap[order.id] = true
      }

      block.push(order)
    })

    ctx.state.data = ret
  },

}