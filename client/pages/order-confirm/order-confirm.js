var utils = require("../../utils/util.js");
import {
  Api
} from '../../utils/envConf.js'
const getProduct = Api.getProduct;
const app=getApp();
const globalData=app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReturn:false,
    name: '张磊磊',
    phone: 12345678901,
    salesReturn: '拒收申请已完成,积分已退回您的账户，请查询',
    address: globalData.address,
    addressStore: '../transactionDetail/images/address.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getProduct(options.itemId);
    
  },
  getProduct(itemId) {
    wx.showLoading({
      title: '商品数据加载中...',
    })
    utils.getRequest(getProduct, {
      itemId,
      merchantId: globalData.merchantId
    }).then(data => {
      wx.hideLoading()
      console.log(data);
      if (data.status === 200) {
        const result = data.result[0];
        this.setData({
          order: result
        })
      } else {
        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
      }
    }).catch(err => {
      wx.hideLoading();
      console.log(err);
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})