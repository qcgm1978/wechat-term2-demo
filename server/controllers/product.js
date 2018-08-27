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

    // if (!isNaN(productId)) {
    //   product = (await DB.query('select * from product where product.id = ?', [productId]))[0]
    // } else {
    //   product = {}
    // }

    // product.commentCount = (await DB.query('SELECT COUNT(id) AS comment_count FROM comment WHERE comment.product_id = ?', [productId]))[0].comment_count || 0
    // product.firstComment = (await DB.query('SELECT * FROM comment WHERE comment.product_id = ? LIMIT 1 OFFSET 0', [productId]))[0] || null

    // ctx.state.result = product
    ctx.state.result = [
      {
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