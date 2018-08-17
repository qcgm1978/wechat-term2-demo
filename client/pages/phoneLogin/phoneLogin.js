var URLs = require("../../utils/envConf.js").Api;
var payCode = require("../../utils/payCodeGen.js");

var utils = require("../../utils/util.js");
var ERROR_CODE = require("../../utils/index.js").config.errorCode;
const backendUrlPhoneLogin = URLs.backendUrlPhoneLogin
const backendUrlVerifyCode = URLs.backendUrlVerifyCode
const VERIFY_WAIT_TIME = 60
const VERIFY_BUTTON_INIT_MSG = "发送验证码"
const PHONE_UNREGIST_ERR_MSG = "此手机号未注册，请使用微信快速授权登录"

const ACCESS_TOCKEN_EXPIRED = ERROR_CODE.ACCESS_TOCKEN_EXPIRED
const DATA_NOT_FOUND = ERROR_CODE.DATA_NOT_FOUND
const HTTP_SUCCSESS = ERROR_CODE.HTTP_SUCCSESS
const CONNECTION_TIMEOUT = ERROR_CODE.CONNECTION_TIMEOUT
const INVALID_USER_STATUS = ERROR_CODE.INVALID_USER_STATUS

const PHONE_NUMBER_LENGTH = 11
const VERIFY_CODE_LENGTH = 6
var interval
Page({
  data: {
    isInputWrong: false,
    inputBox: "images/input-box.png",
    icPhone: {
      active: true,
      enabled: "images/ic-phone-normal.png",
      disabled: "images/ic-phone.png",
    },
    icKey: {
      active: true,
      enabled: "images/ic-key-normal.png",
      disabled: "images/ic-key.png",
    },
    buttonVerifyNormal: {
      active: true,
      enabled: "images/button-verify-normal.png",
      disabled: "images/button-verify.png",
    },
    loginSrc: {
      active: true,
      enabled: "images/button-login-normal.png",
      disabled: "images/button-login.png",
    },
    inputPhone: '',
    inputVerify: '',
    verifyButtonMsg: VERIFY_BUTTON_INIT_MSG,
  },

  phoneLogin: function () {
    if (this.data.loginSrc.active) {
      clearInterval(interval)
      if (this.verifyInput()) {
        this.setData({
          verifyButtonMsg: VERIFY_BUTTON_INIT_MSG,
          'icPhone.active': true,
          'buttonVerifyNormal.active': true,
          isInputWrong: false
        })

        this.doPhoneLogin()
          .then(() => {
            // getApp().globalData.isWechatLogin=false;
            wx.setStorage({
              key: "isWechatLogin",
              data: false
            })
           })
          .catch((err) => {
            console.log(err)
            this.setData({
              isInputWrong: true
            })
          })
      } else {
        this.setData({
          'icKey.active': true,
          'buttonVerifyNormal.active': true,
          isInputWrong: true,
          verifyButtonMsg: VERIFY_BUTTON_INIT_MSG,
          inputVerify: "",
        })
      }
    }
  },

  doPhoneLogin: function () {
    return new Promise((resolve, reject) => {
      var postData = {
        "cellPhone": this.data.inputPhone,
        "code": this.data.inputVerify,

      }
      // return;
      utils.postRequestWithoutToken(backendUrlPhoneLogin, postData)
        .then((data) => {
          getApp().globalData.token.accessToken = data.result.token.accessToken
          getApp().globalData.token.refreshToken = data.result.token.refreshToken
          getApp().globalData.userInfo.registerStatus = true
          getApp().globalData.userInfo.memberId = data.result.memberId
          // getApp().globalData.userInfo.memberName = res.data.result.memberName
          getApp().globalData.userInfo.mobile = this.data.inputPhone
          getApp().globalData.userInfo.savedInDBStatus = true
          wx.setStorage({
            key: "memberId",
            data: getApp().globalData.userInfo.memberId
          })
          wx.setStorage({
            key: "registerStatus",
            data: getApp().globalData.userInfo.registerStatus
          })
          wx.setStorage({
            key: "mobile",
            data: getApp().globalData.userInfo.mobile
          })
          wx.setStorage({
            key: "accessToken",
            data: getApp().globalData.token.accessToken
          })
          wx.setStorage({
            key: "refreshToken",
            data: getApp().globalData.token.refreshToken
          })


          resolve()
        })
        .then(payCode.getPayCodeToken)
        .then(() => {
          wx.switchTab({
            url: '../home/home'
          })
        })
        .catch((errorCode) => {
          console.log(errorCode)
          utils.errorHander(errorCode, this.doPhoneLogin, this.dataNotFoundHandler)
            .then(() => {
              resolve()
            })
            .catch((err) => {
              console.log(err)
              reject(err)
            })
        })
    })
  },

  sendVerifyCode: function () {
    if (this.data.verifyButtonMsg !== VERIFY_BUTTON_INIT_MSG) {
      return
    }
    this.setData({
      'loginSrc.active': true,
      'icKey.active': true,
      'buttonVerifyNormal.active': false,
    })
    //send message here

    var closureFunc = this.showCurrentTime(VERIFY_WAIT_TIME)
    interval = setInterval(() => {
      closureFunc()
      if (parseInt(this.data.verifyButtonMsg) <= 0) {
        clearInterval(interval)
        this.setData({
          verifyButtonMsg: VERIFY_BUTTON_INIT_MSG,
          'icPhone.active': true,
          'buttonVerifyNormal.active': true,
        })
      }
    }, 1000)

    this.doSendOtp()
      .then(() => { })
      .catch((err) => {
        if (err == 400) {
          wx.showModal({
            title: '提示',
            content: "验证码发送次数超过限制",
            showCancel: false,
            success: res => {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }
      })
  },

  doSendOtp: function () {
    return new Promise((resolve, reject) => {
      utils.getRequestWithoutToken(backendUrlVerifyCode + this.data.inputPhone)
        .then((data) => {
          console.log(data)
          resolve()
        })
        .catch((errorCode) => {
          console.log(errorCode)
          utils.errorHander(errorCode, this.doSendOtp, this.dataNotFoundHandler)
            .then(() => {
              resolve()
            })
            .catch((err) => {

              reject(err)
            })
        })
    })
  },

  dataNotFoundHandler: function () {
    wx.showModal({
      title: '提示',
      content: PHONE_UNREGIST_ERR_MSG,
      showCancel: false,
      success: res => {
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },

  bindPhoneInput: function (e) {
    this.setData({
      inputPhone: e.detail.value
    })
  },

  bindVerifyInput: function (e) {
    this.setData({
      inputVerify: e.detail.value
    })
  },

  verifyInput: function () {
    if (this.data.inputPhone.length !== PHONE_NUMBER_LENGTH || this.data.inputVerify.length !== VERIFY_CODE_LENGTH) {
      return false
    } else {
      return true
    }
  },

  showCurrentTime: function (totalTime) {
    var funcb = () => {
      this.setData({
        verifyButtonMsg: totalTime.toString() + "s"
      })
      totalTime = totalTime - 1
    }
    return funcb
  },

  onLoad: function () {
    this.doPhoneLogin.tokenRefreshed = false
    this.doSendOtp.tokenRefreshed = false
  },

  onUnload: function () {
    clearInterval(interval)
    this.setData({
      verifyButtonMsg: VERIFY_BUTTON_INIT_MSG,
      'icPhone.active': true,
      'buttonVerifyNormal.active': true,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    utils.checkNetwork()
  },

})