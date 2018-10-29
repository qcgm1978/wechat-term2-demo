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
    } else if (orderId === '111111') {


      ctx.state.result = {
        "orderId": "111111",
        "orderStatus": "RETURN_PART",
        "totalAmount": 8,
        "itemTotalCount": 2,
        "createTime": "2018-08-21 13:25:45",
        "payment": {
          "paymentId": null,
          "paymentMethod": "COD",
          "paymentTime": "2018-08-21 13:25:45",
          "usePoint": 0,
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
    } else if (orderId === '789') {
      ctx.state.result = {
        "orderId": "180831233122880",
        "orderStatus": "RETURN_FULL",
        "totalAmount": 42,
        "itemTotalCount": 1,
        "itemSaleCount": 1,
        "itemReturnCount": 1,
        "createTime": "2018-08-31 23:31:41",
        "payment": {
          "paymentId": null,
          "paymentMethod": "COD",
          "paymentTime": "2018-08-31 23:31:41",
          "usePoint": 0,
          "cashAmount": 42
        },
        returnInfo: {
          refundTotalAmount: 100,
          refundCashAmount: 99,
          refundPoint: 100
        },
        "orderItem": [
          {
            "itemId": "3211",
            "itemSku": null,
            "itemName": "美好优级王中王火腿肠",
            "quantity": 1,
            "unitPrice": 42,
            "locationId": "55",
            "itemSpecification": "38g*60",
            "returnQuantit": 0,
            "itemIcon": "http://cnvod.cnr.cn/audio2017/ondemand/img/1100/20180605/1528185342546.jpg",
            "categoryId": "1702002"
          }
        ],
        "orderReturn": {
          "refundTotalAmount": 0,
          "refundCashAmount": 0,
          "refundPoint": 0
        },
        "receiverInfo": {
          "receiverName": "yangyong",
          "receiverCellPhone": "13240353366",
          "receiverAddress": "河南省开封市祥符区西姜寨乡嘴刘村便民超市"
        }
      }
    }

    else {
      ctx.state.result = {
        "orderId": "180831233122880",
        "orderStatus": "CANCELED",
        "totalAmount": 42,
        "itemTotalCount": 1,
        "itemSaleCount": 1,
        "itemReturnCount": 0,
        "createTime": "2018-08-31 23:31:41",
        "payment": {
          "paymentId": null,
          "paymentMethod": "COD",
          "paymentTime": "2018-08-31 23:31:41",
          "usePoint": 0,
          "cashAmount": 42
        },
        "orderItem": [
          {
            "itemId": "3211",
            "itemSku": null,
            "itemName": "美好优级王中王火腿肠",
            "quantity": 1,
            "unitPrice": 42,
            "locationId": "55",
            "itemSpecification": "38g*60",
            "returnQuantit": 0,
            "itemIcon": "http://cnvod.cnr.cn/audio2017/ondemand/img/1100/20180605/1528185342546.jpg",
            "categoryId": "1702002"
          }
        ],
        "orderReturn": {
          "refundTotalAmount": 0,
          "refundCashAmount": 0,
          "refundPoint": 0
        },
        "receiverInfo": {
          "receiverName": "yangyong",
          "receiverCellPhone": "13240353366",
          "receiverAddress": "河南省开封市祥符区西姜寨乡嘴刘村便民超市"
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
    if (ctx.request.body.orderStatus.includes(2) && ctx.request.body.orderStatus.includes(0)) {
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
        status: 200
      }
    }
  },
  create: async ctx => {
    // const items = ctx.request.body.orderItems;
    // if (items && ctx.request.body.locationId && items.itemId && items.quantity && (typeof ctx.request.body.merchantId === 'string')) {

    ctx.state.data = {
      message: '',
      orderId: '123456',
      orderTotalAmount: 200
    }
    // }
  },
}