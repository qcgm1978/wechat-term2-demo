const DB = require('../utils/db.js')
const Mock = require('mockjs');

module.exports = {
  merchant_home: async ctx => {
    ctx.state = Mock.mock({
      'result|4': [{ "category": "merchant_home", "imageUrl": "https://statics.jihuiduo.cn/miniapp_banners/%E5%BC%80%E4%B8%9Abanner%402x.png", "pageUrl": "" }]
    })
  },
  // replaced by controllers.trolley.list
  cart: async ctx => {
    ctx.state = Mock.mock({
      'result|10': [
        {
          "groupId": "f975ae16f86e11e8ac01cff79e35fb48",
          "items": [
            {
              "itemId": "4442",
              "itemName": "中普啤酒瓶超爽8度",
              "itemSpecification": "490ml*12",
              "itemBrand": "中普",
              "saleUnit": "箱(12个)",
              "stockUnit": "个",
              "saleSku": "",
              "stockSku": "6959408012235",
              "itemImageAddress1": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/%E9%87%91%E6%98%9F%E5%95%A4%E9%85%92.jpg",
              "itemImageAddress2": "",
              "itemImageAddress3": "",
              "itemImageAddress4": "",
              "itemImageAddress5": "",
              "applayScope": "2",
              "salesDescription": "",
              "itemLocationCollection": "12,130,143,144,140,145,146,129,127,128,131,132,133,134,135,136,137,138,139,18,20,49,40,44,46,54,55,56,57,72,73,75,76,79,86,87,119,122",
              "itemCategoryCode": "1102004",
              "itemOrigin": "",
              "itemExpirationDays": "",
              "putShelvesDate": "2018/10/30 15:45:23",
              "putShelvesFlg": true,
              inventoryCount: '@integer(0,10)',
              "price": 15,
              "quantity": 2,
              "addTime": "2018-12-05T09:20:15.013+0000"
            }
          ],
          "promotions": null,
          "cartCombinationPromotions": null,
          "addTime": "2018-12-05T09:20:15.013+0000"
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