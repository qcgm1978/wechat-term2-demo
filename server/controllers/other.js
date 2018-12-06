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
}