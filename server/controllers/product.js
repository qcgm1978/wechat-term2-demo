const DB = require('../utils/db.js')

module.exports = {
  /**
   * 拉取商品列表
   * 
   */

  list: async ctx => {
    ctx.state.data = await DB.query("SELECT * FROM product;")
  },

  detail: async ctx => {
    let productId = + ctx.params.orderId;
    let product
    ctx.state.result = [
      {
        // "orderId": "111111",
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
        "items": [
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
          }
        ],
        "orderReturn": null,
        "item_brand": "芬达可乐系列整箱(青苹果口味*12、澳洲橘子口味*12、西柚猕猴桃口味*12)",
        "item_id": "123456",
        "item_image_address": [
          'http://img.hb.aicdn.com/9816dc3421383c2b66b701f73a37fe39139e03ed29f2-YesS2H_fw658', 'http://img.hb.aicdn.com/464340c2e6fca6c9fc35143c9a44c99eb1b093201129b-tvhiCM_fw658',
          'https://community-cdn-digitalocean-com.global.ssl.fastly.net/assets/tutorials/images/large/introduction-to-machine-learning_social.png?1510178550',
          'https://talkmetech.com/wp-content/uploads/2017/11/AI.jpg',
          'https://i03picsos.sogoucdn.com/4a583810f8f10251'
        ],

        "item_location_collection": [{
          content: '满300元减10元(芬达葡萄味饮料)',
          type: '满减'
        }, {
          content: '饮料系列满20赠送100积分(芬达香蕉牛奶…',
          type: '满赠'
        }, {
          content: '满300元减10元(芬达葡萄味饮料)',
          type: '满减'
        }, {
          content: '满300元减10元(芬达葡萄味饮料)',
          type: '满减'
        }],
        "item_name": "string",
        "item_specification": '饮料；碳酸饮料',
        "item_status": true,
        "price": 220,
        "sale_sku": "string",
        "sale_unit": "string",
        "sales_description": '混合口味更适合冬天饮用,草莓口味更适合夏天饮品, 值得试试看',
        "stock_sku": "string",
        "stock_unit": "string"
      }
    ];
  }
}