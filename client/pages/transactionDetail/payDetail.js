const requestPayment = require('./requestPayment.js').requestPayment;
var utils = require("../../utils/util.js");
var URLs = require("../../utils/envConf.js").Api;
const backendUrlTransCancel = URLs.backendUrlTransCancel;

export default {
  submitOrder() {
    requestPayment()
  },
  requestPayment,
  removeOrder(evt) {
    utils.getRequest(backendUrlTransCancel + this.data.transactionId)
      .then((data) => {
        if (this.data.isWebsocket) {
          wx.navigateBack()
        } else {

          wx.navigateTo({
            url: '../transactionList/transactionList'
          })
        }
      })
      .catch(err => {
        wx.showToast({
          title: '取消订单失败，请重试',
          icon: 'none',
          duration: 2000
        })
      })
  },
  cancelOrder() {
    wx.showModal({
      // title: '提示',
      cancelText: '返回',
      content: '您确定取消订单吗？',
      confirmColor: "#fcb052",
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定')
          this.removeOrder()
          // wx.navigateTo({
          //   url: '../member/member?fromPayment=true'
          // });

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
}