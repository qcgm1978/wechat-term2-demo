import {
  Api
} from './envConf.js';
var ERROR_CODE = require("index.js").config.errorCode;
var refreshAccessToken = require("./refreshToken.js").refreshAccessToken;
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
        // 'X-Client-Id': 'mini-app'
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
        // 'X-Client-Id': 'mini-app'
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

var postRequest = function ({
  METHOD = 'POST',
  url,
  config,
  postData,
  data
}) {
  var promise = new Promise((resolve, reject) => {
    if (config) {
      for (const prop in config) {

        url = url.replace(`{${prop}}`, config[prop]);
      }
    }
    wx.showLoading({
      title: '正在加载',
    })
    wx.request({
      url: url,
      data: postData || data,
      method: METHOD,
      header: {
        'Authorization': 'Bearer ' + getApp().globalData.token.accessToken,
        // 'Content-Type': 'application/json'

        // 'X-Client-Id': 'mini-app'
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
      },
      complete() {
        wx.hideLoading()
      }
    })
  });
  return promise;
}

var getRequest = function (url, data) {
  var promise = new Promise((resolve, reject) => {
    if (data) {
      for (const prop in data) {

        url = url.replace(`{${prop}}`, data[prop]);
      }
    }
    wx.showLoading({
      title: '数据加载中...',
    });
    wx.request({
      url: url,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + (data.accessToken ? data.accessToken : getApp().globalData.token.accessToken),
        // 'X-Client-Id': 'mini-app',
        // 'Content-Type': 'application/json'

      },
      success: res => {

        if (res.statusCode !== HTTP_SUCCSESS) {
          console.log(res);
          reject(res.statusCode);
        } else {
          resolve(res.data);
        }
      },
      fail: e => {
        console.log(e)
        reject(CONNECTION_TIMEOUT);
      },
      complete() {
        wx.hideLoading();
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
        // 'X-Client-Id': 'mini-app'
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
        } else {
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
        if (dataNotFoundHandler) {
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
            .then(() => {
              resolve()
            })
            .catch((errorCode) => {
              reject(errorCode)
            })
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
        wx.showToast({
          title: '连接超时',
          icon: 'loading',
          duration: 2000
        })
        reject(errorCode)
        break;
      default:
        reject(errorCode)
        break;
    }
  })
}
const queryStack = (e) => {
  window.open(`http://stackoverflow.com/search?q=[js]${e.message}`)
}

const addToTrolley = (itemId, quantity = 1, enableChecked = true) => {
  wx.showLoading({
    title: '正在添加到购物车...',
  });
  const merchantId = getApp().getMerchantId();
  const locationId = String(getApp().globalData.merchant.locationId);
  const data = {
    merchantId,
    itemId,
    locationId,
    quantity,
    addItemList: itemId instanceof Array ? itemId : [{
      itemId,
      quantity
    }]
  },
    config = {
      merchantId,
      locationId
    }
  return new Promise((resolve, reject) => {
    postRequest({
      url: Api.addTrolley,
      config,
      data
    })
      .then(ret => {
        if (enableChecked) {
          getApp().globalData.checkedTrolley.push(itemId);
        }
      })
      .then(() => {
        updateTrolleyNum({
          merchantId,
          quantity,
          resolve
        })
      })
      .then(data=>{
        wx.hideLoading();
      })
      .catch(errorCode => {
        reject()
      });
  });
}
const getFixedNum = (float) => {
  let ret = (float).toFixed(2);
  return Number(String(ret).replace(/\.?0+$/, ''));
}
const updateTrolleyNum = ({
  merchantId,
  quantity,
  resolve
} = {
    merchantId: getApp().getMerchantId()
  }) => {
  return getRequest(Api.getCartCount, {
    merchantId
  })
    .then(data => {
      let count = 0;
      if (data.status === 200) {
        count = data.result.count;
        getApp().globalData.badge = count;
        wx.setTabBarBadge({
          index: 2,
          text: (count?count:'') + ''
        });
        // Promise.resolve(count)
      }
      if (!isNaN(quantity)) {
        wx.showToast({
          title: quantity > 0 ? '已添加到进货单' : '已从进货单减去',
        });
      }
      return resolve ? resolve(count) : count;
    });
}
module.exports = {
  checkNetwork: checkNetwork,
  formatTime: formatTime,
  putRequest: putRequest,
  postRequest,
  postRequestWithoutToken,
  getRequestWithoutToken: getRequestWithoutToken,
  getRequest,
  errorHander,
  queryStack,
  addToTrolley,
  getFixedNum,
  updateTrolleyNum
}