const DB = require('../utils/db.js')
const Mock = require('mockjs');

module.exports = {
  merchant_home: async ctx => {
    ctx.state = Mock.mock({
      'result|4': [{ "category": "merchant_home", "imageUrl": "https://statics.jihuiduo.cn/miniapp_banners/%E5%BC%80%E4%B8%9Abanner%402x.png", "pageUrl": "" }]
    })
  },
  count: async ctx => {

    ctx.state.result = Mock.mock({
      count: '@integer(5,10)'
    })
  },
  cart: async ctx => {

    ctx.state = Mock.mock({
      'result|10': [{
        "groupId": "3483c96af86411e8ac016dbba8211718",
        "items": [
          {
            "itemId": "3562",
            "itemName": "零度可乐摩登罐",
            "itemSpecification": "330ml*24",
            "itemBrand": "可口可乐",
            "saleUnit": "箱(24个)",
            "stockUnit": "个",
            "saleSku": "6928804010091",
            "stockSku": "6928804010091",
            "itemImageAddress1": "http://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/3562.jpg",
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "2",
            "salesDescription": "",
            "itemLocationCollection": "12,130,140,145,146,18,20,40,44,46,49,54,55,56,57,72,73,75,76,79,86,87,119,122,127,128,129,131,132,133,134,135,136,137,138,143,144,139",
            "itemCategoryCode": "1201001",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "2018/10/29 14:31:44",
            "putShelvesFlg": true,
            notHasInventory: '@boolean',
            "price": 53,
            "quantity": 2,
            "addTime": "2018-12-05T08:03:09.627+0000"
          }
        ],
        "promotions": null,
        "cartCombinationPromotions": null,
        "addTime": "2018-12-05T08:03:09.627+0000"
      }]
    })
  },
  calc: async ctx => {

    ctx.state = Mock.mock({
      'result': [
        {
          "groupId": "3483f07df86411e8ac015f0df82f4d7f",
          "totalDiscountAmount": 0,
          "promotionActives": []
        }
      ]
    })
  },
  selectPromotions: async ctx => {

    ctx.state = Mock.mock({
      'result|1': [
        // {
        //   "groupId": "3483f07df86411e8ac015f0df82f4d7f",
        //   "totalDiscountAmount": 0,
        //   "promotionActives": []
        // }
      ]
    })
  },
}