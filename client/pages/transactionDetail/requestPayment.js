const paymentUrl = require('../../utils/envConf.js').Api.backendUrlRequestment;
const postRequest = require('../../utils/util.js').postRequest;
const getRequest = require('../../utils/util.js').getRequest;

var app = getApp()

export function requestPayment(evt) {
  if (this.data.loading) {
    return;
  }
  var self = this

  self.setData({
    loading: true
  });
  const state = wx.getStorageSync('isWechatLogin');
  let promise = null;
  // state always false because wx.setStorage not executed in phoneLogin.js. If needed those code to modify
  if (state) {
    promise = Promise.resolve(0)
  } else {
    promise = new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          if (res.code) {
            resolve(res.code)
          } else {
            reject()
          }

        },
        fail: res => {
          reject()
          wx.showModal({
            title: '提示',
            content: '请重新支付',
            showCancel: false,
            success: res => {}
          })
        },
        complete() {
          wx.hideLoading();

        }
      })
    });
  }

  promise.then(code => {
      // todo to support by server side
      return postRequest({
        url: paymentUrl,
        postData: {
          orderId: this.options.orderId,
          merchantId: getApp().getMerchantId(),
          jsCode: code ? code : getApp().globalData.token.jscode,
          paymentMethodId: 1,
        }
      })
    })
    // todo get interface
    // getRequest(`${paymentUrl}/${evt.currentTarget.dataset.trasaction}`)

    .then(data => {
      if (data.status !== 200) {
        debugger;
        return wx.showToast({
          icon: 'none',
          title: '支付失败',
        })
      }
      console.log('unified order success, response is:', data)
      var payargs = data.result;
      wx.requestPayment({
        timeStamp: payargs.timeStamp,
        nonceStr: payargs.nonceStr,
        package: `prepay_id=${payargs.prepayId}`,
        signType: payargs.signType,
        paySign: payargs.paySign,
        success() {
          return wx.redirectTo({
            url: `/pages/transactionDetail/transactionDetail?orderId=${getApp().globalData.orderId}`,
          })
        },
        fail(err) {
          // do nothing and wait next perhaps paying
          console.log(err)
          wx.showToast({
            icon: 'loading',
            title: '交易未成功',
          })
          // debugger;
        },
        complete() {
          self.setData({
            loading: false
          })
        }
      })
    }).catch(err => {
      // todo test invalid user
      // return invalidUserMessage();
      // do nothing and wait next perhaps paying
      console.log(err)
      debugger;
      if (err !== 406) {
        wx.showToast({
          icon: 'none',
          title: '交易失败，您可以选择继续提交订单',
        });
      }
      this.setData({
        loading: false
      })
      // wx.navigateTo({
      //   url: '../member/member?fromPayment=true',
      // })
    })


  // })
  // 具体文档参考https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-login.html?t=20161230#wxloginobject
  function invalidUserMessage() {
    wx.showModal({
      title: '提示',
      content: '支付失败，请使用微信授权登陆',
      showCancel: false,
      success: res => {
        getApp().globalData.userInfo.registerStatus = false
        wx.setStorage({
          key: "registerStatus",
          data: getApp().globalData.userInfo.registerStatus
        })
        // this.setData({
        //   loginStatus: false,
        //   userName: unregistedUser,
        //   cardNumber: unregistedMsg
        // })
        setTimeout(() => {
          wx.reLaunch({
            url: '../login/login'
          })
        }, 1000)
      }
    })
  }

}