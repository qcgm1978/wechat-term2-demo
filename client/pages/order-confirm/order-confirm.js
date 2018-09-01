var utils = require("../../utils/util.js");
import {
  Api
} from '../../utils/envConf.js'
const getProduct = Api.getProduct,
  createOrder = Api.createOrder;
const app = getApp();
const globalData = app.globalData;
Page({
  data: {
    data:{},
    points: 0,
    credit:0,
    isReturn: false,
    isFailed: false,
    total:'',
    textarea: '',
    order:{},
    name: '',
    phone: 12345678901,
    salesReturn: '拒收申请已完成,积分已退回您的账户，请查询',
    address: '',
    addressStore: '../transactionDetail/images/address.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      data:globalData.items,
      itemId: options.itemId,
      max: globalData.merchant.pointBalance,
      points: globalData.merchant.pointBalance,
      total:options.total,
      address: globalData.address,
      address: getApp().globalData.address,
      profileName: getApp().globalData.authWechat.authMerchantList[0].userName
    })
    this.getProduct(options.itemId);

  },
  onChangeChecked(myEventDetail, myEventOption) {
    const isVisible = myEventDetail.detail.checked;
    this.setData({
      isVisible,
      credit:isVisible?this.data.points/100:0
    })
  },
  textareaConfirm(e) {
    this.setData({
      textarea: e.detail.value
    });
  },
  bindinput(e) {
    const isVisible = this.data.isVisible;
    this.setData({
      points: e.detail.value,
      credit: isVisible ? e.detail.value / 100 : 0
    });
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
  createOrder(itemId) {
    return new Promise((resolve, reject) => {

      wx.showLoading({
        title: '正在创建订单...',
      })
      utils.postRequest(createOrder, {
        orderItems: this.data.order.orderItem,
        merchantId: globalData.merchantId,
        merchantMsg: this.data.textarea,
        usePoint: this.data.isVisible ? this.data.points : 0
      }).then(data => {
        wx.hideLoading()
        console.log(data);
        if (data.status === 200) {
          wx.redirectTo({
            url: `/pages/order-success/order-success?orderId=${data.result.orderId}`,
          })
        } else {
          setTimeout(() => {
            wx.navigateBack()
          }, 2000)
        }
      }).catch(err => {
        wx.hideLoading();
        console.log(err);
        this.setData({
          isFailed: true
        });
      })
    })
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