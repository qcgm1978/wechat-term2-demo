import utils from "../../utils/util.js";
var URLs = require("../../utils/envConf.js").Api;
var refreshAccessToken = require("../../utils/refreshToken.js").refreshAccessToken;
var config = require("../../utils/index.js").config;
var ERROR_CODE = require("../../utils/index.js").config.errorCode;
var payCode = require("../../utils/payCodeGen.js");
var memeberStatus = require("../../utils/index.js").config.memeberStatus;
const clientSecret = require("../../utils/envConf.js").clientSecret
import appUtil from '../../app-util.js'

const app = getApp();
let globalData = app.globalData;
const appId = config.appId
const secret = config.secret

const backendUrlLogin = URLs.backendUrlLogin
const backendUrlUserInfo = URLs.backendUrlUserInfo
const backendUrlRefreshToken = URLs.backendUrlRefreshToken
const backendUrlRegister = URLs.backendUrlUserInfo

const ACCESS_TOCKEN_EXPIRED = ERROR_CODE.ACCESS_TOCKEN_EXPIRED
const DATA_NOT_FOUND = ERROR_CODE.DATA_NOT_FOUND
const HTTP_SUCCSESS = ERROR_CODE.HTTP_SUCCSESS
const CONNECTION_TIMEOUT = ERROR_CODE.CONNECTION_TIMEOUT
const INVALID_USER_STATUS = ERROR_CODE.INVALID_USER_STATUS

const promptTitleMsg = "提示"
const networkErrorMsg = "网络链接失败！"
const wechatBtn = '微信快速授权登录'
const phoneBtn = '输入手机号登录'

Page({
  // ...appUtil,
  data: {
    dialogFlag: true,
    clientSecret: clientSecret,
    //UI contents

    wechatBtnContent: wechatBtn,
    phoneBtnContent: phoneBtn,
    homeLogo: 'images/jihuibaologo@2x.png',
    buttonWechat: 'images/button-wechat.png',
    buttonPhone: 'images/button-phone.png',
    icWechat: 'images/ic-wechat.png',
    icPhone: 'images/ic-phone.png',

    //banner attributes

    indicatorDots: true,
    autoplay: true,
    interval: 2000,
    duration: 1000,

    //disable button click while loading to avoid multiple click

    loadingState: false,
    deviceWindowHeight: getApp().globalData.systemInfo.windowHeight * (750 / getApp().globalData.systemInfo.windowWidth),
  },

  gotoHome: function() {
    wx.switchTab({
      url: '/pages/home/home',
    });
  },

  /**
   * 弹出层函数
   */
  //出现
  showDialog: function() {
    this.setData({
      dialogFlag: false
    })
    setTimeout(() => {
      this.hideDialog()
    }, 2000)
  },
  //消失
  hideDialog: function() {
    this.setData({
      dialogFlag: true
    })
  },

  phoneLogin: function() {
    //this.showDialog()
    wx.navigateTo({
      url: '../phoneLogin/phoneLogin'
    })
  },

  decryptPhoneNumber: function(iv, encryptedData, jsCode) {
    wx.request({
      url: backendUrlLogin,
      method: "POST",
      data: {
        jsCode, //: appUtil.globalData.token.jscode,
        ivForPhoneNumber: iv,
        encryptedPhoneNumber: encryptedData,
      },
      header: {
        'content-type': 'application/json',
        // 'X-Client-Id': 'mini-app'
      },
      success: res => {
        if (res.statusCode !== HTTP_SUCCSESS) {
          try {
            console.log(res.data.message)
          } catch (e) {
            //debugger;
          }
          if (res.statusCode == ACCESS_TOCKEN_EXPIRED && !this.decryptPhoneNumber.tokenRefreshed) {
            utils.errorHander(res.statusCode, () => {
                this.decryptPhoneNumber(iv, encryptedData, jsCode)
              })
              .then(() => {
                resolve()
              })
              .catch(() => {
                reject()
              });
          } else {
            wx.reLaunch({
              url: '../login/login'
            });
          }
        } else {
          const result = res.data.result;
          app.saveGlobalData(result);
          if (result.potentialUser) {
            return wx.redirectTo({
              url: '/pages/home-enter/home-enter',
            })
          }
          this.gotoHome();
        }
      },
      fail: e => {
        console.log(e);
        wx.showModal({
          title: '提示',
          content: '网络链接失败，请稍后再试！',
          showCancel: false,
          success: res => {}
        });
        appUtil.getJsCode();
      },
      complete: () => {
        this.setData({
          loadingState: false,
        })
      }
    })
  },


  getPhoneNumber(e) {
    if (e.detail.iv && e.detail.encryptedData) {
      this.setData({
        loadingState: true,
      });
      utils.requestWechatLogin()
      this.decryptPhoneNumber(e.detail.iv, e.detail.encryptedData, getApp().globalData.token.jscode)
    } else {
      // todo 目前该接口针对非个人开发者，且完成了认证的小程序开放
      // temp mock demo getUserInfo
      // this.onTapLogin()
      console.log('no authorization')
    }
  },
  onTapLogin() {
    app.login({
      success: ({
        userInfo
      }) => {

        wx.switchTab({
          url: '/pages/home/home',
        })
      }
    });
  },
  onLoad: function(para) {
    this.decryptPhoneNumber.tokenRefreshed = false
    this.checkAndRegisterUser.tokenRefreshed = false
    this.saveRegisteredUser.tokenRefreshed = false;
    if (getApp().globalData.registerStatus && getApp().globalData.authWechat && !getApp().globalData.authWechat.potentialUser) {
      utils.getMerchant()
        .then(data => {
          if (data){
            const merchant = data.result;
            getApp().globalData.merchant = merchant;
            if (merchant){
              return (merchant.locationId);
            }else{
              return ""
            }
          }else{
            
          }

        })
        .then(this.gotoHome)
        .catch(err=>{
          //debugger;
          console.log(err)
        })
    } else {
      // appUtil.getJsCode()

      //清除店铺信息
      delete getApp().globalData["merchant"]
      delete getApp().globalData["authMerchantList"]
      delete getApp().globalData["address"]
      delete getApp().globalData["authWechat"]
      getApp().globalData.currentIndex = 0

      wx.setStorage({
        key: "globalData",
        data: this.globalData
      });
    }
  },

  checkAndRegisterUser: function() {
    if (getApp().globalData.userInfo.savedInDBStatus) {
      this.gotoMember();
    } else {
      this.saveRegisteredUser()
    }
  },
  getLocation: function() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'wgs84',
        success: function(res) {
          resolve(res)
        },
        fail: function(err) {
          console.log(err)
          resolve()
        }
      })
    })
  },

  //register user to remote db if the info is not saved yet
  saveRegisteredUser: function(e) {
    if (!getApp().globalData.token.accessToken) {
      this.gotoMember();
      return
    }
    if (getApp().globalData.userInfo.savedInDBStatus) {
      getApp().globalData.userInfo.registerStatus = true
      this.gotoMember();
    } else {
      var latitude = null
      var longitude = null
      this.getLocation()
        .then((data) => {
          if (data) {
            latitude = data.latitude
            longitude = data.longitude
          }
          wx.request({
            url: backendUrlRegister,
            method: "POST",
            data: {
              jsCode: getApp().globalData.token.jscode,
              ivForUserInfo: getApp().globalData.userInfo.iv,
              encryptedUserInfo: getApp().globalData.userInfo.encryptedData,
              phoneNumber: getApp().globalData.userInfo.mobile,
              memberName: getApp().globalData.userInfo.nickName,
              gender: getApp().globalData.userInfo.gender,
              registrationLatitude: latitude,
              registrationLongitude: longitude,
              promoterMemberId: getApp().globalData.userInfo.refMemberId,
              merchantId: getApp().globalData.userInfo.merchantId
            },
            header: {
              'Authorization': 'Bearer ' + getApp().globalData.token.accessToken,
              'X-Client-Id': 'mini-app'
            },
            success: res => {
              if (res.statusCode !== HTTP_SUCCSESS) {
                console.log(res)
                if (res.statusCode == ACCESS_TOCKEN_EXPIRED) {
                  if (!this.saveRegisteredUser.tokenRefreshed) {
                    refreshAccessToken()
                      .then(() => {
                        this.saveRegisteredUser.tokenRefreshed = true
                        return this.saveRegisteredUser()
                      })
                      .then(() => {})
                      .catch(() => {})

                  } else {
                    getApp().globalData.userInfo.registerStatus = false
                    this.gotoMember();
                  }
                } else if (res.statusCode == CONNECTION_TIMEOUT) {
                  wx.navigateTo({
                    url: '../noNetwork/noNetwork'
                  })
                }
              } else {
                getApp().globalData.userInfo.registerStatus = true
                getApp().globalData.userInfo.memberId = res.data.result
                getApp().globalData.userInfo.memberName = getApp().globalData.userInfo.nickName
                getApp().globalData.userInfo.savedInDBStatus = true

                wx.setStorage({
                  key: "memberId",
                  data: getApp().globalData.userInfo.memberId
                })
                wx.setStorage({
                  key: "memberName",
                  data: getApp().globalData.userInfo.memberName
                })
                wx.setStorage({
                  key: "registerStatus",
                  data: getApp().globalData.userInfo.registerStatus
                })
                wx.setStorage({
                  key: "savedInDBStatus",
                  data: getApp().globalData.userInfo.savedInDBStatus
                })
                this.gotoMember();
              }
            },
            fail: e => {
              console.log(e)
            }
          })
        })
        .catch((err) => {})
    }
  },
  onShow: function() {
    appUtil.getJsCode()
    utils.checkNetwork().then(utils.requestStatisLoad);
  },
  
  onUnload() {
    utils.requestStatisUnload();
  }
})