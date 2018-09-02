var utils = require("../../utils/util.js");
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem,
  createOrder = Api.createOrder;
const app = getApp();
const globalData = app.globalData;
Page({
  data: {
    data: {},
    points: 0,
    credit: 0,
    actual: 0,
    isReturn: false,
    isFailed: false,
    total: '',
    textarea: '',
    order: {},
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
      itemId: options.itemId,
      max: globalData.merchant.pointBalance,
      points: globalData.merchant.pointBalance,
      total: options.total,
      actual: options.total,
      address: globalData.address,
      phone: app.getPhone(),
      profileName: getApp().globalData.authWechat.authMerchantList[0].userName
    })
    if (globalData.items) {
      this.setData({
        data: globalData.items,
      })
    } else {
      this.getProduct(options.itemId, options.categoryId);
    }
  },
  onChangeChecked(myEventDetail, myEventOption) {
    const isVisible = myEventDetail.detail.checked;
    this.setData({
      isVisible,
      credit: isVisible ? this.data.points / 100 : 0,
      actual: this.data.total - (isVisible ? this.data.points / 100 : 0)
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
      credit: isVisible ? e.detail.value / 100 : 0,
      actual: this.data.total - e.detail.value / 100
    });
  },
  getProduct(itemId, categoryId) {
    wx.showLoading({
      title: '商品数据加载中...',
    });
    const locationId = globalData.merchant.locationId;
    utils.getRequest(getProductItem, {
      locationId,
      categoryId,
      itemId,
      merchantId: globalData.merchantId
    }).then(data => {
      wx.hideLoading()
      console.log(data);
      if (data.status === 200) {
        const result = data.result[0];
        this.setData({
          data: result
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
      });
      const locationId = globalData.merchant.locationId;
      const receiverName = app.getName(),
        receiverCellPhone = app.getPhone(),
        receiverAddress = globalData.address;
      utils.postRequest(createOrder, {
        orderItems: globalData.items ? globalData.items : this.data.data.items,
        merchantId: app.getMerchantId(),
        locationId,
        merchantMsg: this.data.textarea,
        usePoint: this.data.isVisible ? this.data.points : 0,
        totalAmount: this.data.actual,
        recerverInfo: {

          receiverName,
          receiverCellPhone,
          receiverAddress
        }
      }).then(data => {
        wx.hideLoading()
        console.log(data);
        if (data.status === 200) {
          wx.redirectTo({
            url: `/pages/order-success/order-success?orderId=${data.result.orderId}&orderTotalAmount=${data.result.orderTotalAmount}`,
          })
        } else {}
      }).catch(err => {
        wx.hideLoading();
        console.log(err);
        this.setData({
          isFailed: true
        });
      })
    })
  },
  closePopup() {
    this.setData({
      isFailed: false
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