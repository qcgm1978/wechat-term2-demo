const DB = require('../utils/db');
const Mock = require('mockjs');

module.exports = {
  /**
   * 添加到购物车列表
   * 
   */
  add: async ctx => {
    if (ctx.request.body.addItemList) {
      ctx.state.data = {
        status: 200,
        result: 'OK'
      }
    } else {
      ctx.state.data = {
        msg: 'no id'
      }
    }
  },
  remove: async ctx => {
    if (ctx.request.body.itemIds) {
      ctx.state.data = {
        status: 200,
        result: 'OK'
      }
    } else {
      ctx.state.data = {
        msg: 'no id'
      }
    }
  },
  count: async ctx => {
    ctx.state.result = Mock.mock({
      count: '@integer(5,10)'
    })

  },

  /**
   * 拉取购物车商品列表
   * 
   */
  list: async ctx => {

    let inventoryCount = '@integer(0,1)', itemId = "@integer(1000,9999)"
    // inventoryCount= '@integer(0,1)'
    // inventoryCount= '@integer(0,2)'
    inventoryCount = 0
    // inventoryCount = 1
    itemId = '3793'
    ctx.state = Mock.mock({
      "result":
      {
        "items": [
          {
            "putShelvesFlg": false,
            "putShelvesFlg": true,
            inventoryCount,
            seriesCode: '@string("number",4)',
            itemBrandId: '@string("lower",10)',
            itemId,
            "itemName": "@ctitle(5,10)",
            "itemSpecification": "420ml*12",
            "itemBrand": "可口可乐",
            "saleUnit": "@pick(['箱','盒'])(@integer(5,10)个)",
            "stockUnit": "个",
            "saleSku": "6956416205147",
            "stockSku": "6956416205147",
            "itemImageAddress1": "@image",
            "itemImageAddress1": 'https://stg-statics.jihuiduo.cn/jhb_images/%E6%83%A0%E7%99%BE%E7%9C%9F%E6%B4%97%E8%A1%A3%E6%B6%B21.jpg',
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "2",
            "salesDescription": "",
            "itemLocationCollection": "12,130,145,146,140,44,18,20,40,46,49,128,54,55,56,57,72,73,75,76,129,79,131,132,133,134,135,136,86,87,119,122,137,138,127,139,143,144",
            "itemCategoryCode": "1205014",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "2018/11/01 14:08:22",
            "price": '@integer(100,200)',
            "quantity": '@integer(2,3)',
            "addTime": "2018-12-18T01:51:22.270+0000"
          }
        ],

      },


    })
  },

  /**
     * 更新购物车商品列表
     * 
     */
  update: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId
    let productList = ctx.request.body.list || []

    // 购物车旧数据全部删除
    await DB.query('DELETE FROM trolley_user WHERE trolley_user.user = ?', [user])

    let sql = 'INSERT INTO trolley_user(id, count, user) VALUES '
    let query = []
    let param = []

    productList.forEach(product => {
      query.push('(?, ?, ?)')

      param.push(product.id)
      param.push(product.count || 1)
      param.push(user)
    })

    await DB.query(sql + query.join(', '), param)

    ctx.state.data = {}
  },
}