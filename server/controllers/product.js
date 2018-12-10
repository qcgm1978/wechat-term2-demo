const DB = require('../utils/db.js')
const Mock = require('mockjs');

module.exports = {
  category: async ctx => {
    const params = ctx.params;
    if (ctx.query.locationId && ctx.query.categoryDeep) {
      ctx.state.result = [
        {
          first: '1-1',
          val: [
            {
              second: '1-2-1',
              val: [{
                third: '1-2-3-1',
                categoryId: 1,
                val: 'http://cnvod.cnr.cn/audio2017/ondemand/img/1100/20180605/1528185342546.jpg'
              }]
            },
            {
              second: '1-2-2',
              val: [{
                categoryId: 1,
                third: '2-2-3-1',
                val: 'http://cnvod.cnr.cn/audio2017/ondemand/img/1100/20180605/1528185342546.jpg'
              }, {
                categoryId: 1,
                third: '2-2-3-2',
                val: 'http://cnvod.cnr.cn/audio2017/ondemand/img/1100/20180605/1528185342546.jpg'
              }, {
                categoryId: 1,
                third: '2-2-3-3',
                val: 'http://cnvod.cnr.cn/audio2017/ondemand/img/1100/20180605/1528185342546.jpg'
              }]
            }
          ]
        },
        {
          first: '1-2',
          val: [
            {
              second: '2-1',
              val: [{
                categoryId: 1,
                third: '3-1',
                val: 'http://cnvod.cnr.cn/audio2017/ondemand/img/1100/20180605/1528185342546.jpg'
              }]
            }
          ]
        }
      ]
    }
  },

  list: async ctx => {
    ctx.state = Mock.mock({
      'result|20': [
        {
          "itemId": "3467",
          "itemName": "冰露纯悦包装饮用水（纸箱）",
          "itemImageAddress1": "http://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/3467.jpg",
          "price": 19,
          "itemCategoryCode": "1204001",
          "putShelvesFlg": '@boolean',
          "itemSpecification": "550ml*24",
          "promotionTypes": null,
          "saleUnit": "箱(24个)",
          inventoryCount: '@integer(0,10)',
        }
      ]
    })
    // ctx.state.data = await DB.query("SELECT * FROM product;")
  },

  detail: async ctx => {
    let productId = + ctx.params.orderId;
    let product
    ctx.state = {
      "status": 200,
      "message": "OK",
      "result": [
        {
          "itemId": "3467",
          "itemName": "冰露纯悦包装饮用水（纸箱）",
          "itemSpecification": "550ml*24",
          "itemBrand": "可口可乐",
          "saleUnit": "箱(24个)",
          "stockUnit": "个",
          "saleSku": "6928804010015",
          "stockSku": "6928804010015",
          "itemImageAddress1": "http://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/3467.jpg",
          "itemImageAddress2": "",
          "itemImageAddress3": "",
          "itemImageAddress4": "",
          "itemImageAddress5": "",
          "applayScope": "2",
          "salesDescription": "",
          "itemLocationCollection": "12,130,140,145,146,18,20,40,44,46,49,54,55,56,57,72,73,75,76,79,86,87,119,122,127,128,129,131,132,133,134,135,136,137,138,139,143,144",
          "itemCategoryCode": "1204001",
          "itemOrigin": "",
          "itemExpirationDays": "",
          "putShelvesDate": "2018/10/29 14:31:05",
          "price": 19,
          "itemCategoryName": " 可口可乐",
          "priceLevel": "47",
          "putShelvesFlg": true,
          inventoryCount: '@integer(0,10)',
          "promotionTypes": null,
          "saleUnitExchange": 24,
          "purchaseType": "",
          "itemPackage": "瓶",
          "length": "",
          "width": "",
          "height": "",
          "weight": "",
          "isConsignedGood": "N"
        }
      ]
    }
  }
}