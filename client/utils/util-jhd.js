var ERROR_CODE = require("index.js").config.errorCode;
const ACCESS_TOCKEN_EXPIRED = ERROR_CODE.ACCESS_TOCKEN_EXPIRED
const DATA_NOT_FOUND = ERROR_CODE.DATA_NOT_FOUND
const HTTP_SUCCSESS = ERROR_CODE.HTTP_SUCCSESS
const CONNECTION_TIMEOUT = ERROR_CODE.CONNECTION_TIMEOUT
const INVALID_USER_STATUS = ERROR_CODE.INVALID_USER_STATUS
const formatTime = strDate => {
  // dd/MM/yyyy hh:mm:ss -> yyyy-MM-dd hh:mm:ss
  var array = strDate.split(" ")
  var ymd = array[0].split("/")
  const year = ymd[2]
  const month = ymd[1]
  const day = ymd[0]
  return [year, month, day].join('-') + ' ' + array[1]
}

var postRequestWithoutToken = function (url, data) {
  var promise = new Promise((resolve, reject) => {
    var postData = data;
    wx.request({
      url: url,
      data: postData,
      method: 'POST',
      header: {
        //'Authorization': 'Bearer ' + getApp().globalData.token.accessToken,
        'X-Client-Id': 'mini-app'
      },
      success: res => {
        if (res.statusCode !== HTTP_SUCCSESS) {
          console.log(res)
          reject(res.statusCode);
        } else {
          resolve(res.data);
        }
      },
      fail: function (e) {
        console.log(e)
        reject(CONNECTION_TIMEOUT);
      }
    })
  });
  return promise;
}

var putRequest = function (url, data) {
  var promise = new Promise((resolve, reject) => {
    var putData = data;
    wx.request({
      url: url,
      data: putData,
      method: 'PUT',
      header: { 
        'Authorization': 'Bearer ' + getApp().globalData.token.accessToken,
        'X-Client-Id': 'mini-app'
      },
      success: res => {
        if (res.statusCode !== HTTP_SUCCSESS) {
          console.log(res)
          reject(res.statusCode);
        } else {
          resolve(res.data);
        }
      },
      fail: function (e) {
        console.log(e)
        reject(CONNECTION_TIMEOUT);
      }
    })
  });
  return promise;
}

var postRequest = function (url, data) {
  var promise = new Promise((resolve, reject) => {
    var postData = data;
    wx.request({
      url: url,
      data: postData,
      method: 'POST',
      header: { 
        'Authorization': 'Bearer ' + (getApp().globalData.token?getApp().globalData.token.accessToken:"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MzIyNTIwNzIsIm1lbWJlcklkIjoiMTUyOTg5OTMyMDEzNDYxMSJ9.ldc4QQ9H5Ep8oHsgrX_606eSg_61pkwdIYWCTmiCuuk"),
        'X-Client-Id': 'mini-app'
      },
      success: res => {
        if (res.statusCode !== HTTP_SUCCSESS) {
          console.log(res)
          reject(res.statusCode);
        } else {
          resolve(res.data);
        }
      },
      fail: function (e) {
        console.log(e)
        reject(CONNECTION_TIMEOUT);
      }
    })
  });
  return promise;
}

var getRequest = function (url) {
  var promise = new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: 'GET',
      header: { 
        'Authorization': 'Bearer ' + getApp().globalData.token.accessToken,
        'X-Client-Id': 'mini-app'
      },
      success: res => {

        if (res.statusCode !== HTTP_SUCCSESS){
          console.log(res)
          reject(res.statusCode);
        } else {
          resolve(res.data);
        }
      },
      fail: e => {
        console.log(e)
        reject(CONNECTION_TIMEOUT);
      }
    })
  });
  return promise;
}

var getRequestWithoutToken = function (url) {
  var promise = new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: 'GET',
      header: {
        //'Authorization': 'Bearer ' + getApp().globalData.token.accessToken,
        'X-Client-Id': 'mini-app'
      },
      success: res => {

        if (res.statusCode !== HTTP_SUCCSESS) {
          console.log(res)
          reject(res.statusCode);
        } else {
          resolve(res.data);
        }
      },
      fail: e => {
        console.log(e)
        reject(CONNECTION_TIMEOUT);
      }
    })
  });
  return promise;
}

var checkNetwork = function () {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: res => {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        if (res.networkType == "none") {
          wx.navigateTo({
            url: '../noNetwork/noNetwork'
          })
          reject()
          return 
        }else{
          resolve()
          return 
        }
      },
      fail: res => {
        wx.navigateTo({
          url: '../noNetwork/noNetwork'
        })
        reject()
        return 
      }
    })
  })
}

var errorHander = function (errorCode, callback, dataNotFoundHandler) {
  return new Promise((resolve, reject) => {
    switch (errorCode) {
      case INVALID_USER_STATUS:
        getCurrentPages()[0].invalidUserMessage()
        reject(errorCode)
        break
      case DATA_NOT_FOUND:
        console.log(DATA_NOT_FOUND)
        if (dataNotFoundHandler){
          dataNotFoundHandler()
          resolve()
        }
        reject(errorCode)
        break;
      case ACCESS_TOCKEN_EXPIRED:
        if (!callback.tokenRefreshed) {
          refreshAccessToken()
            .then(() => {
              callback.tokenRefreshed = true
              return callback()
            })
            .then(() => { resolve() })
            .catch((errorCode) => { reject(errorCode) })
        } else {
          getApp().globalData.userInfo.registerStatus = false
          wx.reLaunch({
            url: '../member/member'
          })
          reject(errorCode)
        }
        break;
      case CONNECTION_TIMEOUT:
        wx.navigateTo({
          url: '../noNetwork/noNetwork'
        })
        reject(errorCode)
        break;
      default:
        reject(errorCode)
        break;
    }
  })
}
module.exports = {
  checkNetwork: checkNetwork,
  formatTime: formatTime,
  putRequest: putRequest,
  postRequest: postRequest,
  postRequestWithoutToken: postRequestWithoutToken,
  getRequestWithoutToken: getRequestWithoutToken,
  getRequest: getRequest,
  errorHander: errorHander
}
