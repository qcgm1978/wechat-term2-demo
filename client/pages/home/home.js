import utils from "../../utils/util.js";
// const io = require('/socket.io/socket.io.js')
const getUserInfo = require('./getUserInfo').default;
import {
  Api
} from '../../utils/envConf.js';
import {
  getRequest
} from '../../utils/util.js';
const getMerchant = Api.getMerchant,
  getProductList = Api.getProductList,
  getHot = Api.getHot;
const app = getApp()
let globalData = app.globalData;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    stores: [],
    productList: [], // 商品列表
  },
  start: 0,
  limit: 20,
  onPullDownRefresh: function() {


  },
  errorFunction(e) {
    const productList = getApp().errorFunction(e, this.data.productList);
    this.setData({
      productList
    })
  },
  callPhone(evt) {
    wx.makePhoneCall({
      phoneNumber: '400-101-5288' //仅为示例，并非真实的电话号码
    })
  },
  getMerchant() {
    return new Promise((resolve, reject) => {
      getRequest(Api.getMerchant, {
          merchantId: app.getMerchantId()
        })
        .then((data) => {
          const merchant = data.result;
          // // todo 
          // merchant.locationId = 55;
          getApp().globalData.merchant = merchant;
          getApp().globalData.address = (merchant.province + merchant.city + merchant.county + merchant.town + ' ' + merchant.address).replace(/undefined/g, '').replace(/null/g, '');
          resolve(merchant.locationId)
        })
        .catch(errorCode => {
          // getApp().failRequest();
          utils.errorHander(errorCode, this.getMerchant)
            .then(() => {
              resolve()
            })
            .catch(() => {
              reject()
            })
        })
    });
  },
  getProductList(locationId) {
    return new Promise((resolve, reject) => {
      locationId = locationId ? locationId : getApp().globalData.locationId;
      getRequest(getHot, {
        locationId,
        start: this.start,
        limit: this.limit
      }).then(result => {
        let data = result.result;
        if (result.status === 200) {
          this.setData({
            productList: data
          });
          resolve(data)
        } else {
          wx.showToast({
            icon: 'none',
            title: '商品数据加载错误',
          });
          reject(result.status)
        }
      }).catch(err => {
        wx.showToast({
          icon: 'none',
          title: '商品数据加载错误',
        });
        reject(err)
      });
    });
  },
  addToTrolley(event) {
    const itemId = event.currentTarget.dataset.itemid;
    utils.addToTrolley(itemId).catch(errorCode => {
      // getApp().failRequest();
      utils.errorHander(errorCode, this.getMerchant)
        .then(() => {
          resolve()
        })
        .catch(() => {
          reject()
        })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getMerchant()
      .then(locationId => this.getProductList(locationId))
      .then(() => {
        getRequest(Api.getCartCount, {
          merchantId: app.getMerchantId(),
          // accessToken: this.globalData.token.accessToken
        })
      })
      .then(data => {
        if (data.status === 200) {
          wx.setTabBarBadge({
            index: 2,
            text: data.result.count + ''
          });
        }
      })
      .then(data => {
        wx.setStorage({
          key: 'globalData',
          data: getApp().globalData,
        })
      })
      .catch(err => {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      });
    this.setData({
      stores: getApp().globalData.authWechat.authMerchantList,
    });
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.start += this.limit;
    this.getProductList(globalData.merchant.locationId);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})