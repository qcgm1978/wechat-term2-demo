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
    badge: 0,
    product: {},
    autoplay: true,
    interval: 3000,
    duration: 1000,
    icon: '../../images/trolley-full.png',
    info: '保质期(125天)；场地：中国，杭州；品牌：七喜',
    imgUrls: [{
        img: 'https://i01picsos.sogoucdn.com/f29ddb031dfa74e8',
        title: '多种口味听装芬达500ml',
        money: '2.5'
      },
      {
        img: 'http://www.kfzimg.com/G05/M00/3E/63/p4YBAFg-yCCAIXT_AABMUEgSsqU474_n.jpg',
        title: '多种口味听装芬达500ml',
        money: '2.5'
      },
      {
        img: 'https://i03picsos.sogoucdn.com/2a4cac7380108f44',
        title: '多种口味听装芬达500ml',
        money: '2.5',
        type: '满减'
      },
      {
        img: 'https://i03picsos.sogoucdn.com/c6fe007b19eb29b1',
        title: '多种口味听装芬达500ml',
        money: '2.5',
        type: '满减'
      }
    ]
  },
  addToTrolley() {
    utils
      .addToTrolley(this.data.product.item_id)
      .then(badge => {
        this.setData({
          badge,
          icon: '../../images/trolley-missing.png'
        })
      })
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
        const result = data.result[0];
        this.setData({
          product: result
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
      urls: this.data.product.item_image_address // 需要预览的图片http链接列表
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
    this.getProduct(options.orderId);
    if (globalData.badge > 0) {
      this.setData({
        badge: globalData.badge,
        icon: '../../images/trolley-missing.png'
      });
    }
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