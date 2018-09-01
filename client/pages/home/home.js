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
  errorFunction(e){
    const productList=getApp().errorFunction(e, this.data.productList);
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
          globalData.merchant = merchant;
          globalData.address = (merchant.province + merchant.city + merchant.county + merchant.town + ' ' + merchant.address).replace(/undefined/g, '').replace(/null/g, '');
          wx.setStorage({
            key: 'globalData',
            data: getApp().globalData,
          });
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
    wx.showLoading({
      title: '商品数据加载中...',
    })
    getRequest(getHot,{
      locationId,
      start:0,
      limit:20
    }).then(result => {
      wx.hideLoading()
      let data = result.result;
      if (result.status === 200) {
        this.setData({
          productList: data
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: '商品数据加载错误',
        })
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '商品数据加载错误',
      })
    });
  },

  addToTrolley(event) {
    let productId = event.currentTarget.dataset.id
    let productList = this.data.productList
    let product

    for (let i = 0, len = productList.length; i < len; i++) {
      if (productList[i].id === productId) {
        product = productList[i]
        break
      }
    }
    if (product) {
      utils.addToTrolley(product.id)
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getMerchant().then(locationId => this.getProductList(locationId));
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