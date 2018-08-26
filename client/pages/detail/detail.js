const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
const _ = require('../../utils/util');

import utils from "../../utils/util.js";
const app = getApp();
const globalData = app.globalData;
import {
  Api
} from '../../utils/envConf.js'
const getProduct = Api.getProduct;

Page({
  data: {
    product: {},
    autoplay: true,
    interval: 3000,
    duration: 1000,
    type:'饮料；碳酸饮料',
    info:'保质期(125天)；场地：中国，杭州；品牌：七喜',
    intro: '混合口味更适合冬天饮用,草莓口味更适合夏天饮品, 值得试试看',
    promotions: [{
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
    }]
  },

  getProduct(orderId) {
    wx.showLoading({
      title: '商品数据加载中...',
    })
    utils.getRequest(getProduct, {
      orderId,
      merchantId: globalData.merchantId
    }).then(data => {
      wx.hideLoading()
      console.log(data);
      if (data.status === 200) {
        this.setData({
          product: data.result,
          imgUrls: [data.result.image]
        })
      } else {
        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
      }
    }).catch(err => {
      wx.hideLoading();
      console.log(err)
      // setTimeout(() => {
      //   wx.navigateBack()
      // }, 2000)
    })
  },
  preview(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: this.data.imgUrls // 需要预览的图片http链接列表
    });
  },

  buy() {
    wx.showLoading({
      title: '商品购买中...',
    })

    let product = Object.assign({
      count: 1
    }, this.data.product)

    qcloud.request({
      url: config.service.addOrder,
      login: true,
      method: 'POST',
      data: {
        list: [product],
        isInstantBuy: true
      },
      success: result => {
        wx.hideLoading()

        let data = result.data

        if (!data.code) {
          wx.showToast({
            title: '商品购买成功',
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '商品购买失败',
          })
        }
      },
      fail: () => {
        wx.hideLoading()

        wx.showToast({
          icon: 'none',
          title: '商品购买失败',
        })
      }
    })
  },

  addToTrolley() {
    wx.showLoading({
      title: '正在添加到购物车...',
    })

    qcloud.request({
      url: config.service.addTrolley,
      login: true,
      method: 'PUT',
      data: this.data.product,
      success: result => {
        wx.hideLoading()

        let data = result.data

        if (!data.code) {
          wx.showToast({
            title: '已添加到购物车',
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '添加到购物车失败',
          })
        }
      },
      fail: () => {
        wx.hideLoading()

        wx.showToast({
          icon: 'none',
          title: '添加到购物车失败',
        })
      }
    })

  },

  onTapCommentEntry() {
    let product = this.data.product
    if (product.commentCount) {
      wx.navigateTo({
        url: `/pages/comment/comment?id=${product.id}&price=${product.price}&name=${product.name}&image=${product.image}`
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getProduct(options.orderId)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})