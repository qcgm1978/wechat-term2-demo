const DB = require('../utils/db.js')
const Mock = require('mockjs');

module.exports = {
  category: async ctx => {
    const params = ctx.params;
    if (ctx.query.locationId && ctx.query.categoryDeep) {
      ctx.state = Mock.mock({
        'result|10': [
          {
            "itemCategoryId": "320678",
            "itemCategoryCode": "12",
            "itemCategoryName": "@cword(2,5)",
            "itemCategoryHierarchy": 1,
            "itemCategoryParent": "",
            "childCategory|10": [
              {
                "itemCategoryId": "320679",
                "itemCategoryCode": "1201",
                "itemCategoryName": " 碳酸饮料",
                "itemCategoryHierarchy": 2,
                "itemCategoryParent": "320678",
                "childCategory|10": [
                  {
                    "itemCategoryId": "321180",
                    "itemCategoryCode": "1201012",
                    "itemCategoryName": "@cword(5,20)",
                    "itemCategoryHierarchy": 3,
                    "itemCategoryParent": "320679",
                    "childCategory": [],
                    "itemCategoryPath": "12 饮料 : 1201 碳酸饮料 : 1201012 百事2L*6系列",
                    "itemCategoryImage": "@image"
                  },

                ],
                "itemCategoryPath": "12 饮料 : 1201 碳酸饮料",
                "itemCategoryImage": null
              },

            ],
            "itemCategoryPath": "12 饮料",
            "itemCategoryImage": null
          },

        ]
      })
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
          "itemSpecification": "550ml*24",
          "promotionTypes": null,
          "saleUnit": "箱(24个)",
          // "putShelvesFlg": '@boolean',
          // inventoryCount: '@integer(0,10)',
          "putShelvesFlg": false,
          inventoryCount: 0,
        }
      ]
    })
    // ctx.state.data = await DB.query("SELECT * FROM product;")
  },

  detail: async ctx => {
    let productId = + ctx.params.orderId;
    let product
    let inventoryCount = 0, putShelvesFlg = true
    // inventoryCount = 1
    // putShelvesFlg = false
    const itemId = ctx.query.itemIds
    ctx.state.result = [
      Mock.mock({
        putShelvesFlg,
        inventoryCount,
        itemBrandId: '@string("number",5)',
        seriesCode: '@string("number",5)',
        itemId,
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
        "promotionTypes": null,
        "saleUnitExchange": 24,
        "purchaseType": "",
        "itemPackage": "瓶",
        "length": "",
        "width": "",
        "height": "",
        "weight": "",
        "isConsignedGood": "N"
      }),

    ];
  },
  related: async ctx => {
    let productId = + ctx.params.orderId;
    let product
    ctx.state = Mock.mock({
      'result|10': [{
        inventoryCount: 0,
        itemBrandId: '@string("number",5)',
        seriesCode: '@string("number",5)',
        "itemId": "346" + '@increment(1)',
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
        // "promotionTypes": ['2', '1', '3'],
        "promotionTypes": "@pick([['1', '2', '3'], ['2', '1', '3']])",
        "saleUnitExchange": 24,
        "purchaseType": "",
        "itemPackage": "瓶",
        "length": "",
        "width": "",
        "height": "",
        "weight": "",
        "isConsignedGood": "N"
      }]
    })
  }
}