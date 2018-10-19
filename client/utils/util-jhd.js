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
};
let isLoading = false;
const showLoading = ({
  title
} = {
    title: '正在加载'
  }) => {
  if (!isLoading) {
    wx.showLoading({
      title,
    });
    isLoading = true;
  }
}
const hideLoading = () => {
  if (isLoading) {
    wx.hideLoading();
    isLoading = false;
  }
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
    showLoading()

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
        hideLoading();
      }
    })
  });
  return promise;
}

var getRequest = function (url, data) {
  showLoading()
  var promise = new Promise((resolve, reject) => {
    if (data) {
      for (const prop in data) {

        url = url.replace(`{${prop}}`, data[prop]);
      }
    }
    wx.request({
      url: url,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + (data.accessToken ? data.accessToken : getApp().globalData.token.accessToken),

      },
      success: res => {
        // debugger;
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
        hideLoading();
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

var errorHander = function(errorCode, callback, dataNotFoundHandler, callbackPara) {
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
              if (callbackPara){
                return callback(callbackPara)
              }else{
                return callback()
              }
              
            })
            .then(data => {
              resolve(data)
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

const addToTrolleyByGroup = (groupList, quantity = 1,enableChecked = true, updateAddTime = true) => {
  showLoading({
    title: '正在添加到购物车...'
  })
  const merchantId = getApp().getMerchantId();
  const locationId = String(getApp().globalData.merchant.locationId);
  const data = {
    merchantId,
    locationId,
    updateAddTime,
    addGroupList: groupList
  },
    config = {
      merchantId,
      locationId
    }
  return new Promise((resolve, reject) => {
    postRequest({
      url: Api.addTrolley,
      config,
      data:groupList
    })
      .then(ret => {
        if (enableChecked) {
          //getApp().globalData.checkedTrolley.push(groupList);
        }
      })
      .then(() => {
        updateTrolleyNum({
          merchantId,
          quantity,
          resolve
        })
      })
      .then(data => {
        hideLoading();
      })
      .catch(errorCode => {
        reject(errorCode)
      });
  });
}

// const addToTrolley = (itemId, quantity = 1, enableChecked = true, updateAddTime = true) => {
//   showLoading({
//     title: '正在添加到购物车...'
//   })
//   const merchantId = getApp().getMerchantId();
//   const locationId = String(getApp().globalData.merchant.locationId);
//   const data = {
//     merchantId,
//     itemId,
//     locationId,
//     quantity,
//     updateAddTime,
//     addItemList: itemId instanceof Array ? itemId : [{
//       itemId,
//       quantity
//     }]
//   },
//     config = {
//       merchantId,
//       locationId
//     }
//   return new Promise((resolve, reject) => {
//     postRequest({
//       url: Api.addTrolley,
//       config,
//       data
//     })
//       .then(ret => {
//         if (enableChecked) {
//           getApp().globalData.checkedTrolley.push(itemId);
//         }
//       })
//       .then(() => {
//         console.log("updateTrolleyNum")
//         updateTrolleyNum({
//           merchantId,
//           quantity,
//           resolve
//         })
//       })
//       .then(data => {
//         hideLoading();
//       })
//       .catch(errorCode => {
//         reject()
//       });
//   });
// }
const getFixedNum = (float, digits = 0) => {
  let ret = Number(float).toFixed(2);
  ret = Number(String(ret).replace(/\.?0+$/, ''));
  return digits ? ret.toFixed(digits) : ret;
}
const updateTrolleyNum = ({
  merchantId,
  locationId,
  quantity,
  resolve
} = {
    merchantId: getApp().getMerchantId()
  }) => {

  return getRequest(Api.getCartCount, {
    merchantId,
    locationId: getApp().globalData.merchant.locationId
  })
    .then(data => {
      let count = 0;
      if (data.status === 200) {
        count = data.result.count;
        getApp().globalData.badge = count;
        wx.setTabBarBadge({
          index: 2,
          text: (count ? count : '') + ''
        });
        if (count === 0) {
          wx.hideTabBarRedDot({
            index: 2
          });
        }
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
const getMerchant = () => {
  wx.showLoading({
    title: '正在加载',
  });
  return new Promise((resolve, reject) => {
    getRequest(Api.getMerchant, {
      merchantId: getApp().getMerchantId()
    })
      .then((data) => {
        const merchant = data.result;
        getApp().globalData.merchant = merchant;
        getApp().globalData.address = (merchant.province + merchant.city + merchant.county + merchant.town + ' ' + merchant.address).replace(/undefined/g, '').replace(/null/g, '');
        wx.getStorage({
          key: 'merchant',
          data: merchant,
        });
        resolve(data)
      })
      .catch(errorCode => {
        // getApp().failRequest();
        errorHander(errorCode, getMerchant)
          .then((data) => {
            resolve(data)
          })
          .catch(err => {
            reject(err)
          })
      })
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
  //addToTrolley,
  addToTrolleyByGroup,
  getFixedNum,
  updateTrolleyNum,
  getMerchant
}