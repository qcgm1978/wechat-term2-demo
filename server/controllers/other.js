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
    ctx.state.result = [
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
            notHasInventory: '@boolean',
            "price": 15,
            "quantity": 2,
            "addTime": "2018-12-05T09:20:15.013+0000"
          }
        ],
        "promotions": null,
        "cartCombinationPromotions": null,
        "addTime": "2018-12-05T09:20:15.013+0000"
      },
      {
        "groupId": "3483c96bf86411e8ac015396f7ce6a93",
        "items": [
          {
            "itemId": "5911",
            "itemName": "惠百真无芯卷纸本色750g（10+2）*16",
            "itemSpecification": "750g*12*16",
            "itemBrand": "惠百真",
            "saleUnit": "箱(16个)",
            "stockUnit": "个",
            "saleSku": "6970946700002",
            "stockSku": "6970946700002",
            "itemImageAddress1": "https://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/5911.png",
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "2",
            "salesDescription": "",
            "itemLocationCollection": "12,130,18,20,40,44,46,49,54,55,56,57,72,73,75,76,79,86,87,119,122,127,128,129,131,132,133,134,135,136,137,138,139,140,143,144,145,146",
            "itemCategoryCode": "2301001",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "2018/10/29 14:31:20",
            "putShelvesFlg": true,
            notHasInventory: '@boolean',
            "price": 144,
            "quantity": 21,
            "addTime": "2018-12-05T08:03:09.628+0000"
          }
        ],
        "promotions": null,
        "cartCombinationPromotions": null,
        "addTime": "2018-12-05T08:03:09.628+0000"
      },
      {
        "groupId": "3483f07cf86411e8ac01ff631c35751f",
        "items": [
          {
            "itemId": "3461",
            "itemName": "美汁源爽粒花语槐花",
            "itemSpecification": "420ml*12",
            "itemBrand": "可口可乐",
            "saleUnit": "箱(12个)",
            "stockUnit": "个",
            "saleSku": "6956416205147",
            "stockSku": "6956416205147",
            "itemImageAddress1": "http://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/3461.jpg",
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
            "putShelvesFlg": true,
            notHasInventory: '@boolean',
            "price": 36,
            "quantity": 1,
            "addTime": "2018-12-05T08:03:09.628+0000"
          }
        ],
        "promotions": null,
        "cartCombinationPromotions": null,
        "addTime": "2018-12-05T08:03:09.628+0000"
      },
      {
        "groupId": "3483f07df86411e8ac015f0df82f4d7f",
        "items": [
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
            "putShelvesFlg": true,
            notHasInventory: '@boolean',
            "price": 19,
            "quantity": 63,
            "addTime": "2018-12-05T08:03:09.628+0000"
          }
        ],
        "promotions": null,
        "cartCombinationPromotions": null,
        "addTime": "2018-12-05T08:03:09.628+0000"
      },
      {
        "groupId": "3483f07ef86411e8ac01d7d367dc7684",
        "items": [
          {
            "itemId": "271",
            "itemName": "惠百真一级大豆油",
            "itemSpecification": "5L*4",
            "itemBrand": "惠百真",
            "saleUnit": "箱(4个)",
            "stockUnit": "个",
            "saleSku": "6971006560437",
            "stockSku": "6971006560444",
            "itemImageAddress1": "http://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/271.png",
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "2",
            "salesDescription": "",
            "itemLocationCollection": "12,130,119,79,87,143,144,140,145,146,18,72,73,75,76,57,138,139,86,127,128,129,131,132,133,134,135,136,137,20,40,44,46,49,54,56,55,122",
            "itemCategoryCode": "1401003",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "2018/12/07 13:30:31",
            "putShelvesFlg": true,
            notHasInventory: '@boolean',
            "price": 128,
            "quantity": 1,
            "addTime": "2018-12-05T08:03:09.628+0000"
          }
        ],
        "promotions": null,
        "cartCombinationPromotions": null,
        "addTime": "2018-12-05T08:03:09.628+0000"
      },
      {
        "groupId": "3483c969f86411e8ac01b958ce487757",
        "items": [
          {
            "itemId": "3351",
            "itemName": "一级大豆油",
            "itemSpecification": "1ton*1",
            "itemBrand": "散油",
            "saleUnit": "吨(1件)",
            "stockUnit": "个",
            "saleSku": "",
            "stockSku": "",
            "itemImageAddress1": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/%E9%87%91%E9%BC%8E%E4%B8%80%E7%BA%A7%E5%A4%A7%E8%B1%86%E6%B2%B9.png",
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "2",
            "salesDescription": "",
            "itemLocationCollection": "122,119,130,140,145,146,143,144,18,86,127,128,129,131,132,133,134,135,136,137,138,139,79,20,40,44,46,49,54,55,56,57,72,73,75,76,87",
            "itemCategoryCode": "1401009",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "2018/11/02 17:19:32",
            "putShelvesFlg": true,
            notHasInventory: '@boolean',
            "price": 6250,
            "quantity": 1,
            "addTime": "2018-12-05T08:03:09.627+0000"
          }
        ],
        "promotions": null,
        "cartCombinationPromotions": null,
        "addTime": "2018-12-05T08:03:09.627+0000"
      },
      {
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
      },
      {
        "groupId": "34837b48f86411e8ac01050e09c46219",
        "items": [
          {
            "itemId": "6075",
            "itemName": "喜盈盈袋装巴厘岛风味虾肉片原味",
            "itemSpecification": "10g*20*10",
            "itemBrand": "喜盈盈",
            "saleUnit": "箱(20个)",
            "stockUnit": "个",
            "saleSku": "",
            "stockSku": "",
            "itemImageAddress1": "http://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/6075.jpg",
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "2",
            "salesDescription": "",
            "itemLocationCollection": "20,12,16,18,37,38,40,44,46,49,54,55,56,57,61,72,73,75,76,79,82,86,87,95,96,119,122,127,128,129,130,131,132,133,136,134,135,137,138,139,140,142,143,144,145,146",
            "itemCategoryCode": "1808006",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "2018/10/29 14:31:17",
            "putShelvesFlg": true,
            notHasInventory: '@boolean',
            "price": 0.01,
            "quantity": 4,
            "addTime": "2018-12-05T08:03:09.626+0000"
          }
        ],
        "promotions": null,
        "cartCombinationPromotions": null,
        "addTime": "2018-12-05T08:03:09.626+0000"
      },
      {
        "groupId": "4f576c56f6d011e889148569e2a1b1b6",
        "items": [
          {
            "itemId": "6103",
            "itemName": "泸州老窖二曲红瓶浓香型500ml*12",
            "itemSpecification": "500ml*12",
            "itemBrand": "泸州",
            "saleUnit": "箱(12个)",
            "stockUnit": "个",
            "saleSku": "6901798192127",
            "stockSku": "6901798192124",
            "itemImageAddress1": "http://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/6103.jpg",
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "2",
            "salesDescription": "",
            "itemLocationCollection": "20,12,16,18,37,38,40,44,46,49,54,55,56,57,61,72,73,75,76,79,82,86,87,95,96,119,122,127,128,129,130,131,132,133,134,135,136,137,138,139,140,142,143,144,145,146,147",
            "itemCategoryCode": "1101010",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "2018/10/29 14:31:23",
            "putShelvesFlg": true,
            notHasInventory: '@boolean',
            "price": 150,
            "quantity": 4,
            "addTime": "2018-12-03T07:51:57.956+0000"
          }
        ],
        "promotions": [
          {
            "promotionId": null
          }
        ],
        "cartCombinationPromotions": null,
        "addTime": "2018-12-03T07:51:57.956+0000"
      },
      {
        "groupId": "fc6e2475f6cf11e88914a1a46805c912",
        "items": [
          {
            "itemId": "6103",
            "itemName": "泸州老窖二曲红瓶浓香型500ml*12",
            "itemSpecification": "500ml*12",
            "itemBrand": "泸州",
            "saleUnit": "箱(12个)",
            "stockUnit": "个",
            "saleSku": "6901798192127",
            "stockSku": "6901798192124",
            "itemImageAddress1": "http://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/6103.jpg",
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "2",
            "salesDescription": "",
            "itemLocationCollection": "20,12,16,18,37,38,40,44,46,49,54,55,56,57,61,72,73,75,76,79,82,86,87,95,96,119,122,127,128,129,130,131,132,133,134,135,136,137,138,139,140,142,143,144,145,146,147",
            "itemCategoryCode": "1101010",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "2018/10/29 14:31:23",
            "putShelvesFlg": true,
            notHasInventory: '@boolean',
            "price": 150,
            "quantity": 4,
            "addTime": "2018-12-03T07:49:38.854+0000"
          }
        ],
        "promotions": [
          {
            "promotionId": null
          }
        ],
        "cartCombinationPromotions": null,
        "addTime": "2018-12-03T07:49:38.854+0000"
      },
      {
        "groupId": "e15d6e74f6cf11e88914c79bc561e00e",
        "items": [
          {
            "itemId": "6103",
            "itemName": "泸州老窖二曲红瓶浓香型500ml*12",
            "itemSpecification": "500ml*12",
            "itemBrand": "泸州",
            "saleUnit": "箱(12个)",
            "stockUnit": "个",
            "saleSku": "6901798192127",
            "stockSku": "6901798192124",
            "itemImageAddress1": "http://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/6103.jpg",
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "2",
            "salesDescription": "",
            "itemLocationCollection": "20,12,16,18,37,38,40,44,46,49,54,55,56,57,61,72,73,75,76,79,82,86,87,95,96,119,122,127,128,129,130,131,132,133,134,135,136,137,138,139,140,142,143,144,145,146,147",
            "itemCategoryCode": "1101010",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "2018/10/29 14:31:23",
            "putShelvesFlg": true,
            notHasInventory: '@boolean',
            "price": 150,
            "quantity": 4,
            "addTime": "2018-12-03T07:48:53.446+0000"
          }
        ],
        "promotions": [
          {
            "promotionId": null
          }
        ],
        "cartCombinationPromotions": null,
        "addTime": "2018-12-03T07:48:53.446+0000"
      },
      {
        "groupId": "cdf0e5b3f6cf11e889144382f3be1f55",
        "items": [
          {
            "itemId": "6103",
            "itemName": "泸州老窖二曲红瓶浓香型500ml*12",
            "itemSpecification": "500ml*12",
            "itemBrand": "泸州",
            "saleUnit": "箱(12个)",
            "stockUnit": "个",
            "saleSku": "6901798192127",
            "stockSku": "6901798192124",
            "itemImageAddress1": "http://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/6103.jpg",
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "2",
            "salesDescription": "",
            "itemLocationCollection": "20,12,16,18,37,38,40,44,46,49,54,55,56,57,61,72,73,75,76,79,82,86,87,95,96,119,122,127,128,129,130,131,132,133,134,135,136,137,138,139,140,142,143,144,145,146,147",
            "itemCategoryCode": "1101010",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "2018/10/29 14:31:23",
            "putShelvesFlg": true,
            notHasInventory: '@boolean',
            "price": 150,
            "quantity": 26,
            "addTime": "2018-12-03T07:48:20.858+0000"
          }
        ],
        "promotions": [
          {
            "promotionId": null
          }
        ],
        "cartCombinationPromotions": null,
        "addTime": "2018-12-03T07:48:20.858+0000"
      },
      {
        "groupId": "e31b7672eda311e8a1b7b112215c0c37",
        "items": [
          {
            "itemId": "500",
            "itemName": "七度空间优雅棉柔薄型夜用卫生巾10p",
            "itemSpecification": "10p*24",
            "itemBrand": "七度空间",
            "saleUnit": "个",
            "stockUnit": "个",
            "saleSku": "",
            "stockSku": "6903244370431",
            "itemImageAddress1": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/Snip20180703_5.png",
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "",
            "salesDescription": "",
            "itemLocationCollection": "140,136",
            "itemCategoryCode": "210303",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "",
            "putShelvesFlg": false,
            notHasInventory: '@boolean',
            "price": 29.25,
            "quantity": 4,
            "addTime": "2018-11-21T15:41:18.048+0000"
          },
          {
            "itemId": "2104",
            "itemName": "万富源一级大豆油20L",
            "itemSpecification": "20L*1",
            "itemBrand": "阳光油脂",
            "saleUnit": "箱(1个)",
            "stockUnit": "个",
            "saleSku": "",
            "stockSku": "6921905801209",
            "itemImageAddress1": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/%E9%87%91%E9%BC%8E%E5%A4%A7%E8%B1%86%E6%B2%B91.jpg",
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "2",
            "salesDescription": "",
            "itemLocationCollection": "12,130,122,119,140,145,146,76,72,73,75,18,143,144,79,87,20,40,44,46,49,54,55,56,57,86,127,128,129,131,132,133,134,135,136,137,138,139",
            "itemCategoryCode": "1401001",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "2018/11/02 16:00:17",
            "putShelvesFlg": true,
            notHasInventory: '@boolean',
            "price": 118,
            "quantity": 4,
            "addTime": "2018-11-21T15:41:18.048+0000"
          }
        ],
        "promotions": [
          {
            "promotionId": "18952"
          }
        ],
        "cartCombinationPromotions": [
          {
            "promotionId": "18952",
            "promotionType": "2",
            "promotionName": "内黄单品+单品促销减test",
            "promotionDescription": "七度空间优雅棉柔薄型夜用卫生巾10p两件+万富源一级大豆油20L 20L*1两件减20.10元",
            "discountAmount": 0,
            "combinationFlag": "1",
            "promotionKind": "1",
            "giftItems": null,
            "activeFlg": true
          }
        ],
        "addTime": "2018-11-21T15:41:18.048+0000"
      },
      {
        "groupId": "2383aaececb411e8a0a483dec363ee44",
        "items": [
          {
            "itemId": "500",
            "itemName": "七度空间优雅棉柔薄型夜用卫生巾10p",
            "itemSpecification": "10p*24",
            "itemBrand": "七度空间",
            "saleUnit": "个",
            "stockUnit": "个",
            "saleSku": "",
            "stockSku": "6903244370431",
            "itemImageAddress1": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/Snip20180703_5.png",
            "itemImageAddress2": "",
            "itemImageAddress3": "",
            "itemImageAddress4": "",
            "itemImageAddress5": "",
            "applayScope": "",
            "salesDescription": "",
            "itemLocationCollection": "140,136",
            "itemCategoryCode": "210303",
            "itemOrigin": "",
            "itemExpirationDays": "",
            "putShelvesDate": "",
            "putShelvesFlg": false,
            notHasInventory: '@boolean',
            "price": 29.25,
            "quantity": 34,
            "addTime": "2018-11-20T11:05:06.890+0000"
          }
        ],
        "promotions": null,
        "cartCombinationPromotions": null,
        "addTime": "2018-11-20T11:05:06.890+0000"
      }
    ]
    // ctx.state = Mock.mock({
    //   'result|10': [{
    //     "groupId": "3483c96af86411e8ac016dbba8211718",
    //     "items": [
    //       {
    //         "itemId": "3562",
    //         "itemName": "零度可乐摩登罐",
    //         "itemSpecification": "330ml*24",
    //         "itemBrand": "可口可乐",
    //         "saleUnit": "箱(24个)",
    //         "stockUnit": "个",
    //         "saleSku": "6928804010091",
    //         "stockSku": "6928804010091",
    //         "itemImageAddress1": "http://pro-img-jihuiduo.oss-cn-beijing.aliyuncs.com/sku_image/3562.jpg",
    //         "itemImageAddress2": "",
    //         "itemImageAddress3": "",
    //         "itemImageAddress4": "",
    //         "itemImageAddress5": "",
    //         "applayScope": "2",
    //         "salesDescription": "",
    //         "itemLocationCollection": "12,130,140,145,146,18,20,40,44,46,49,54,55,56,57,72,73,75,76,79,86,87,119,122,127,128,129,131,132,133,134,135,136,137,138,143,144,139",
    //         "itemCategoryCode": "1201001",
    //         "itemOrigin": "",
    //         "itemExpirationDays": "",
    //         "putShelvesDate": "2018/10/29 14:31:44",
    //         "putShelvesFlg": true,
    //         notHasInventory: '@boolean',
    //         "price": 53,
    //         "quantity": 2,
    //         "addTime": "2018-12-05T08:03:09.627+0000"
    //       }
    //     ],
    //     "promotions": null,
    //     "cartCombinationPromotions": null,
    //     "addTime": "2018-12-05T08:03:09.627+0000"
    //   }]
    // })
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