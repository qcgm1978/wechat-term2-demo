var URLs = require("envConf.js").Api;
var ERROR_CODE = require("index.js").config.errorCode;
var payCode = require("payCodeGen.js");
const clientSecret = require("envConf.js").clientSecret
const ACCESS_TOCKEN_EXPIRED = ERROR_CODE.ACCESS_TOCKEN_EXPIRED
const DATA_NOT_FOUND = ERROR_CODE.DATA_NOT_FOUND
const HTTP_SUCCSESS = ERROR_CODE.HTTP_SUCCSESS
const CONNECTION_TIMEOUT = ERROR_CODE.CONNECTION_TIMEOUT
const INVALID_USER_STATUS = ERROR_CODE.INVALID_USER_STATUS

const promptTitleMsg = "提示"
const networkErrorMsg = "网络链接失败！"

const backendUrlRefreshToken = URLs.backendUrlRefreshToken

exports.refreshAccessToken = function  () {
  return new Promise((resolve, reject) => {
    wx.request({
      url: backendUrlRefreshToken,
      method: "POST",
      data: {
        clientSecret: clientSecret,
        token: getApp().globalData.token.refreshToken
      },
      header: {
        'content-type': 'application/json',
        'X-Client-Id': 'mini-app'
      },
      success: res => {
        if (res.statusCode !== HTTP_SUCCSESS) {
          switch (res.statusCode) {
            case INVALID_USER_STATUS:
              getCurrentPages()[0].invalidUserMessage()
              break
            case DATA_NOT_FOUND:
              console.log(DATA_NOT_FOUND)
              break;
            case ACCESS_TOCKEN_EXPIRED:
              getApp().globalData.userInfo.registerStatus = false
              break;
            case CONNECTION_TIMEOUT:
              wx.navigateTo({
                url: '../noNetwork/noNetwork'
              })
              break;
            default:
              break;
          }
          reject()
        } else {
          getApp().globalData.token.accessToken = res.data.result.accessToken
          getApp().globalData.token.refreshToken = res.data.result.refreshToken
          wx.setStorage({
            key: "accessToken",
            data: res.data.result.accessToken
          })
          wx.setStorage({
            key: "refreshToken",
            data: res.data.result.refreshToken
          })
          //refresh payCode token
          payCode.getPayCodeToken()
          .then((data)=>{
            var pages = getCurrentPages();
            if (pages.length >= 1) {
              var homePage = pages[0];
              homePage.refreshCodeBar()
            } 
          })
          .catch(() => { })
          resolve()
        }
      },
      fail: e => {
        console.log(e)
        reject()
      }
    })
  })
}
