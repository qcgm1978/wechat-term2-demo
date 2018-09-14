const requestPayment = require('./requestPayment.js').requestPayment;
var utils = require("../../utils/util.js");
var URLs = require("../../utils/envConf.js").Api;
const cancelOrder = URLs.cancelOrder;
export default {
  submitOrder() {
    requestPayment()
  },
  requestPayment,
  removeOrder(evt) {
    wx.showModal({
      cancelText: '返回',
      content: '您确定取消订单吗？',
      confirmColor: "#fcb052",
      success: res => {
        if (res.confirm) {
          utils.postRequest({
            url: cancelOrder,
            data: {
              orderId: this.data.order.orderId,
              merchantId: getApp().getMerchantId()
            }
          })
            .then((data) => {
              wx.showToast({
                title: '取消订单成功',
                // icon: 'none',
                duration: 2000
              })
            })
            .catch(err => {
              wx.showToast({
                title: '取消订单失败，请重试',
                icon: 'none',
                duration: 2000
              })
            })
        }
      }
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