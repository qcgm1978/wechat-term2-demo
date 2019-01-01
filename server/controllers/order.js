const DB = require('../utils/db.js')
var Mock = require('mockjs');

module.exports = {
  count: async ctx => {
    ctx.state.data = Mock.mock([
      {
        "orderStatus": 0,
        "count": '@integer(2,5)'
      },
      {
        "orderStatus": 1,
        "count": '@integer(2,5)'
      },
      {
        "orderStatus": 2,
        "count": '@integer(2,5)'
      },
      {
        "orderStatus": 3,
        "count": '@integer(2,5)'
      },
      {
        "orderStatus": 4,
        "count": '@integer(2,5)'
      },
      {
        "orderStatus": 5,
        "count": '@integer(2,5)'
      },
      {
        "orderStatus": 6,
        "count": '@integer(2,5)'
      }
    ])
  },

  detail: async ctx => {
    const orderId = ctx.params.orderId;
    const merchantId = ctx.params.merchantId;
    if (!orderId || !merchantId) {
      ctx.state.data = 'no data'
    } else if (orderId === '181101112552053870') {
      ctx.state.result = Mock.mock({
        "orderId": "181101112552053870",
        orderStatus: 'COMPLETED',
        // "orderStatus": "RETURN_FULL",
        // "orderStatus": "CANCELED",
        "totalAmount": 576,
        "actualAmount": 0,
        "discountTotalAmount": 0,
        "itemTotalCount": 4,
        "itemSaleCount": 0,
        "itemReturnCount": 4,
        "createTime": "2018-11-01 11:26:09",
        "expireTime": 1541064369672,
        "payment": {
          "paymentId": null,
          "paymentMethod": "WECHAT_PAY",
          // "paymentMethod": "OCD",
          "paymentTime": "2018-11-01 11:26:09",
          "usePoint": 0,
          "cashAmount": 576
        },
        "orderItems": [
          {
            "groupId": "dd2d1c9edd8511e8b0684f66c7dc16ed",
            "promotionId": null,
            "discountAmount": 0,
            "items": [
              {
                "itemId": "5911",
                "itemSku": null,
                "itemName": "惠百真无芯卷纸本色750g（10+2）*16",
                "quantity": 4,
                "unitPrice": 144,
                "locationId": "140",
                "itemIcon": "https://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/5911.png",
                "itemSpecification": "750g*12*16",
                "returnQuantit": 4,
                "categoryId": "2301001",
                "promotionId": null,
                "gift": false
              }
            ]
          }
        ],
        "orderReturn": {
          "refundTotalAmount": 0,
          "refundCashAmount": 0,
          "refundPoint": 0,
          "returnOrderId": `@string('number',10)`,
          // "returnStatus": 1
          "returnStatus": 0
        },
        "receiverInfo": {
          "receiverName": "张红亮",
          "receiverCellPhone": "18602481789",
          "receiverAddress": "河南省安阳市内黄县 内黄县后河镇桑村"
        }
      })
    }
    else {
      ctx.state.result = {
        "orderId": "181029143259643356",
        "orderStatus": "TO_PAY",
        // "orderStatus": "WAIT_RECEIVE",
        "totalAmount": 6250,
        "actualAmount": 0,
        "discountTotalAmount": 0,
        "itemTotalCount": 1,
        "itemSaleCount": 1,
        "itemReturnCount": 0,
        "createTime": "2018-10-29 14:32:59",
        "payment": {
          "paymentId": null,
          "paymentMethod": "online",
          // "paymentMethod": "COD",
          "paymentTime": "2018-10-29 14:32:59",
          "usePoint": 0,
          "cashAmount": 6250
        },
        "orderItems": [
          {
            "groupId": "7aa3952adb4411e88f58e13c69f60a3d",
            "promotionId": null,
            "discountAmount": 0,
            "items": [
              {
                "itemId": "3351",
                "itemSku": null,
                "itemName": "一级大豆油",
                "quantity": 1,
                "unitPrice": 6250,
                "locationId": "140",
                "itemIcon": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/%E9%87%91%E9%BC%8E%E4%B8%80%E7%BA%A7%E5%A4%A7%E8%B1%86%E6%B2%B9.png",
                "itemSpecification": "1ton*1",
                "returnQuantit": 0,
                "categoryId": "1401009",
                "promotionId": null,
                "gift": false
              }
            ]
          }
        ],
        "orderReturn": {
          "refundTotalAmount": 0,
          "refundCashAmount": 0,
          "refundPoint": 0,
          "returnOrderId": null,
          "returnStatus": 0
        },
        "receiverInfo": {
          "receiverName": "张红亮",
          "receiverCellPhone": "18602481789",
          "receiverAddress": "河南省安阳市内黄县 内黄县后河镇桑村"
        }
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

    ctx.state.data = {
      result: 'OK'
    }

  },

  /**
   * 获取已购买订单列表
   * 
   */
  list: async ctx => {
    if (!ctx.request.body.orderStatus || ctx.request.body.orderStatus.includes(6)) {
      ctx.state.result = Mock.mock({
        "orderTotalCount": 10,
        "orders|10": [
          {
            "orderId": "181029143259643356",
            "orderStatus": "TO_PAY",
            "totalAmount": 6250,
            "actualAmount": null,
            "discountTotalAmount": null,
            "itemTotalCount": 1,
            "itemSaleCount": 1,
            "itemReturnCount": 0,
            "createTime": "2018-10-29 14:32:59",
            "payment": null,
            "orderItems": [
              {
                "groupId": "7aa3952adb4411e88f58e13c69f60a3d",
                "promotionId": null,
                "discountAmount": 0,
                "items|10": [
                  {
                    "itemId": "3351",
                    "itemSku": null,
                    "itemName": "一级大豆油",
                    "quantity": 1,
                    "unitPrice": 6250,
                    "locationId": "140",
                    "itemIcon": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/%E9%87%91%E9%BC%8E%E4%B8%80%E7%BA%A7%E5%A4%A7%E8%B1%86%E6%B2%B9.png",
                    "itemSpecification": "1ton*1",
                    "returnQuantit": 0,
                    "categoryId": "1401009",
                    "promotionId": null,
                    "gift": false
                  }
                ]
              }
            ],
            "orderReturn": null,
            "receiverInfo": null
          },

        ]
      })
    }
    else if (ctx.request.body.orderStatus.includes(2) && ctx.request.body.orderStatus.includes(0)) {
      ctx.state.result = Mock.mock({
        "orderTotalCount": 10,
        "orders|10": [
          {
            "orderId": "181029143259643356",
            "orderStatus": "WAIT_SHIPMENT",
            "totalAmount": 6250,
            "actualAmount": null,
            "discountTotalAmount": null,
            "itemTotalCount": 1,
            "itemSaleCount": 1,
            "itemReturnCount": 0,
            "createTime": "2018-10-29 14:32:59",
            "payment": null,
            "orderItems": [
              {
                "groupId": "7aa3952adb4411e88f58e13c69f60a3d",
                "promotionId": null,
                "discountAmount": 0,
                "items": [
                  {
                    "itemId": "3351",
                    "itemSku": null,
                    "itemName": "一级大豆油",
                    "quantity": 1,
                    "unitPrice": 6250,
                    "locationId": "140",
                    "itemIcon": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/%E9%87%91%E9%BC%8E%E4%B8%80%E7%BA%A7%E5%A4%A7%E8%B1%86%E6%B2%B9.png",
                    "itemSpecification": "1ton*1",
                    "returnQuantit": 0,
                    "categoryId": "1401009",
                    "promotionId": null,
                    "gift": false
                  }
                ]
              }
            ],
            "orderReturn": null,
            "receiverInfo": null
          },

        ]
      })
    }
    return;
  },
  cancel: async ctx => {
    if (ctx.request.body.orderId && ctx.request.body.merchantId) {

      ctx.state.data = {
        status: 200,
        result: 'Cancel sucessfully'
      }
    }
  },
  create: async ctx => {
    ctx.state.data = {
      message: '',
      orderId: '123456',
      orderTotalAmount: 200
    }
  },
  pay: async ctx => {
    ctx.state.result = Mock.mock({
      orderId: '@string("number",18)',
      // orderId: '181029143259643356'
      paymentMethodId: 1,
      appId: '@string("number",10)',
      timeStamp: `@now`,
      nonceStr: '@string("lower",20,31)',
      prepayId: '@string("lower",10,20)',
      paySign: '@string("lower",5,10)',
      signType: 'MD5'
    })
  },
}