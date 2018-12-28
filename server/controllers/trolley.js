const DB = require('../utils/db');
const Mock = require('mockjs');

module.exports = {
  /**
   * 添加到购物车列表
   * 
   */
  add: async ctx => {
    // let user = ctx.state.$wxInfo.userinfo.openId
    // let product = ctx.request.body

    // let list = await DB.query('SELECT * FROM trolley_user WHERE trolley_user.id = ? AND trolley_user.user = ?', [product.id, user])

    // if (!list.length) {
    //   // 商品还未添加到购物车
    //   await DB.query('INSERT INTO trolley_user(id, count, user) VALUES (?, ?, ?)', [product.id, 1, user])
    // } else {
    //   // 商品之前已经添加到购物车
    //   let count = list[0].count + 1
    //   await DB.query('UPDATE trolley_user SET count = ? WHERE trolley_user.id = ? AND trolley_user.user = ?', [count, product.id, user])
    // }
    if (ctx.request.body.item_id) {
      ctx.state.data = {
        status: 200
      }
    } else {
      ctx.state.data = {
        msg: 'no id'
      }
    }



  },

  /**
   * 拉取购物车商品列表
   * 
   */
  list: async ctx => {
    ctx.state = Mock.mock({
      "result": [
        {
          "groupId": "6ba9fc3c026711e9ac015979ba8a54ad",
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
              "price": 36,
              "quantity": 1,
              "addTime": "2018-12-18T01:51:22.270+0000"
            }
          ],
          "promotions": [
            {
              "promotionId": "19011"
            }
          ],
          "cartCombinationPromotions": [
            {
              "promotionId": "19011",
              "promotionType": "2",
              "promotionName": "单品A满10件减5元",
              "promotionDescription": "",
              "discountAmount": 0,
              "combinationFlag": "0",
              "promotionKind": "1",
              "giftItems": null,
              "activeFlg": false
            }
          ],
          "addTime": "2018-12-18T01:51:22.270+0000"
        },
        {
          "groupId": "6a8c091b026711e9ac01210b1ff8eccb",
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
              "price": 144,
              "quantity": 1,
              "addTime": "2018-12-18T01:51:20.396+0000"
            }
          ],
          "promotions": null,
          "cartCombinationPromotions": null,
          "addTime": "2018-12-18T01:51:20.396+0000"
        },
        {
          "groupId": "69e05fca026711e9ac01f7c3d4027828",
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
              "price": 19,
              "quantity": 2,
              "addTime": "2018-12-18T01:51:19.271+0000"
            }
          ],
          "promotions": [
            {
              "promotionId": "19103"
            }
          ],
          "cartCombinationPromotions": [
            {
              "promotionId": "19103",
              "promotionType": "1",
              "promotionName": "单品A满5件赠A1",
              "promotionDescription": "",
              "discountAmount": 0,
              "combinationFlag": "0",
              "promotionKind": "1",
              "giftItems": null,
              "activeFlg": true
            }
          ],
          "addTime": "2018-12-18T01:51:19.271+0000"
        },
        {
          "groupId": "fad37291019f11e9ac01d10a01929ca1",
          "items": [
            {
              "itemId": "3473",
              "itemName": "七喜",
              "itemSpecification": "1L*12",
              "itemBrand": "百事",
              "saleUnit": "箱(12个)",
              "stockUnit": "个",
              "saleSku": "6956553400474",
              "stockSku": "",
              "itemImageAddress1": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/%E4%B8%83%E5%96%9C1.jpg",
              "itemImageAddress2": "",
              "itemImageAddress3": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/%E4%B8%83%E5%96%9C1.jpg",
              "itemImageAddress4": "",
              "itemImageAddress5": "",
              "applayScope": "2",
              "salesDescription": "",
              "itemLocationCollection": "12,130,122,131,86,127,128,129,133,134,135,136,137,138,139,87,46,20,40,44,49,54,55,56,57,72,73,75,76,79,143,144,119,140,145,146,18",
              "itemCategoryCode": "1201013",
              "itemOrigin": "",
              "itemExpirationDays": "",
              "putShelvesDate": "2018/11/26 15:47:26",
              "putShelvesFlg": true,
              "price": 38,
              "quantity": 2,
              "addTime": "2018-12-17T02:03:43.110+0000"
            },
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
              "price": 15,
              "quantity": 3,
              "addTime": "2018-12-17T02:03:43.110+0000"
            }
          ],
          "promotions": [
            {
              "promotionId": "18995"
            }
          ],
          "cartCombinationPromotions": [
            {
              "promotionId": "18995",
              "promotionType": "2",
              "promotionName": "测试促销：3a+2b，立减20元",
              "promotionDescription": "",
              "discountAmount": 0,
              "combinationFlag": "1",
              "promotionKind": "1",
              "giftItems": null,
              "activeFlg": false
            }
          ],
          "addTime": "2018-12-17T02:03:43.110+0000"
        },
        {
          "groupId": "f96f0090019f11e9ac01a7324e354634",
          "items": [
            {
              "itemId": "3473",
              "itemName": "七喜",
              "itemSpecification": "1L*12",
              "itemBrand": "百事",
              "saleUnit": "箱(12个)",
              "stockUnit": "个",
              "saleSku": "6956553400474",
              "stockSku": "",
              "itemImageAddress1": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/%E4%B8%83%E5%96%9C1.jpg",
              "itemImageAddress2": "",
              "itemImageAddress3": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/%E4%B8%83%E5%96%9C1.jpg",
              "itemImageAddress4": "",
              "itemImageAddress5": "",
              "applayScope": "2",
              "salesDescription": "",
              "itemLocationCollection": "12,130,122,131,86,127,128,129,133,134,135,136,137,138,139,87,46,20,40,44,49,54,55,56,57,72,73,75,76,79,143,144,119,140,145,146,18",
              "itemCategoryCode": "1201013",
              "itemOrigin": "",
              "itemExpirationDays": "",
              "putShelvesDate": "2018/11/26 15:47:26",
              "putShelvesFlg": true,
              "price": 38,
              "quantity": 2,
              "addTime": "2018-12-17T02:03:40.774+0000"
            },
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
              "price": 15,
              "quantity": 3,
              "addTime": "2018-12-17T02:03:40.774+0000"
            }
          ],
          "promotions": [
            {
              "promotionId": "18995"
            }
          ],
          "cartCombinationPromotions": [
            {
              "promotionId": "18995",
              "promotionType": "2",
              "promotionName": "测试促销：3a+2b，立减20元",
              "promotionDescription": "",
              "discountAmount": 0,
              "combinationFlag": "1",
              "promotionKind": "1",
              "giftItems": null,
              "activeFlg": false
            }
          ],
          "addTime": "2018-12-17T02:03:40.774+0000"
        },
        {
          "groupId": "c585036f019e11e9ac016b352ed3c1a1",
          "items": [
            {
              "itemId": "3473",
              "itemName": "七喜",
              "itemSpecification": "1L*12",
              "itemBrand": "百事",
              "saleUnit": "箱(12个)",
              "stockUnit": "个",
              "saleSku": "6956553400474",
              "stockSku": "",
              "itemImageAddress1": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/%E4%B8%83%E5%96%9C1.jpg",
              "itemImageAddress2": "",
              "itemImageAddress3": "http://stg-img-jihuiduo.oss-cn-beijing.aliyuncs.com/jhb_images/%E4%B8%83%E5%96%9C1.jpg",
              "itemImageAddress4": "",
              "itemImageAddress5": "",
              "applayScope": "2",
              "salesDescription": "",
              "itemLocationCollection": "12,130,122,131,86,127,128,129,133,134,135,136,137,138,139,87,46,20,40,44,49,54,55,56,57,72,73,75,76,79,143,144,119,140,145,146,18",
              "itemCategoryCode": "1201013",
              "itemOrigin": "",
              "itemExpirationDays": "",
              "putShelvesDate": "2018/11/26 15:47:26",
              "putShelvesFlg": true,
              "price": 38,
              "quantity": 2,
              "addTime": "2018-12-17T01:55:04.180+0000"
            },
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
              "price": 15,
              "quantity": 3,
              "addTime": "2018-12-17T01:55:04.180+0000"
            }
          ],
          "promotions": [
            {
              "promotionId": "18995"
            }
          ],
          "cartCombinationPromotions": [
            {
              "promotionId": "18995",
              "promotionType": "2",
              "promotionName": "测试促销：3a+2b，立减20元",
              "promotionDescription": "",
              "discountAmount": 0,
              "combinationFlag": "1",
              "promotionKind": "1",
              "giftItems": null,
              "activeFlg": false
            }
          ],
          "addTime": "2018-12-17T01:55:04.180+0000"
        }
      ]
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