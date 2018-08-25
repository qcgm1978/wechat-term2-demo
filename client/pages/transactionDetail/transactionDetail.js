var URLs = require("../../utils/envConf.js").Api;
var refreshAccessToken = require("../../utils/refreshToken.js").refreshAccessToken;
var ERROR_CODE = require("../../utils/index.js").config.errorCode;
var utils = require("../../utils/util.js");
const getOrder = URLs.getOrder

const ACCESS_TOCKEN_EXPIRED = ERROR_CODE.ACCESS_TOCKEN_EXPIRED
const DATA_NOT_FOUND = ERROR_CODE.DATA_NOT_FOUND
const HTTP_SUCCSESS = ERROR_CODE.HTTP_SUCCSESS
const CONNECTION_TIMEOUT = ERROR_CODE.CONNECTION_TIMEOUT
const INVALID_USER_STATUS = ERROR_CODE.INVALID_USER_STATUS

const promptTitleMsg = "提示"
const networkErrorMsg = "网络链接失败！"
const payDetail = require('./payDetail.js').default,
  notShowDiscountInfo = false;
const app = getApp();
const globalData = app.globalData;
Page({
  ...payDetail,
  data: {
    payStyle: globalData.payStyle,
    name: '张磊磊',
    phone: 12345678901,
    address: '北京市朝阳区亮马桥234号二十一世纪大厦4楼408',
    src: './images/pic.png',
    standard: '500ML*12',
    top: '',
    showPrepayedCardInfo: "none",
    showPointPayInfo: "none",
    notShowPointPayInfo: true,
    showCashPayInfo: "none",
    notShowCashPayInfo: true,
    showDiscountInfo: "none",
    notShowDiscountInfo,
    amount: 0,
    // netAmount: 0,
    discountAmount: 0,
    earnedPoint: 0,
    itemData: [],
    financialData: {
      programData: {
        points: 0,
        amount: 0,
      },
      cashData: {
        amount: 0,
      },
      prepayedCardData: {
        amount: 0
      }
    },

    addressStore: "images/address.png",
    windowHeight: getApp().globalData.systemInfo.windowHeight * (750 / getApp().globalData.systemInfo.windowWidth),
    windowWidth: getApp().globalData.systemInfo.windowWidth * (750 / getApp().globalData.systemInfo.windowWidth)
  },
  copy() {
    wx.setClipboardData({
      data: this.data.orderId + ''
    })
  },
  requestTransDetail(orderId) {
    let requestData = null;
    if (isNaN(orderId) ) {
      requestData = Promise.resolve()
    } else {
      requestData = utils.getRequest(getOrder, {
        orderId,
        merchantId:globalData.merchantId
      });
    }
    requestData
      .then(data => {
        if (data === undefined) {
          return console.log('no data')
        }
        data = data.result ? data : {
          result: data
        }
        this.setData({
          order: data.result
        });
        wx.hideLoading();
      })
      .catch(errorCode => {
        console.log(errorCode)
        wx.hideLoading()
        switch (errorCode) {
          case INVALID_USER_STATUS:
            getCurrentPages()[0].invalidUserMessage()
            break
          case DATA_NOT_FOUND:
            console.log(DATA_NOT_FOUND)
            break;
          case ACCESS_TOCKEN_EXPIRED:
            if (!this.requestTransDetail.tokenRefreshed) {
              refreshAccessToken()
                .then(() => {
                  this.requestTransDetail.tokenRefreshed = true
                  return this.requestTransDetail()
                })
                .then(() => {})
                .catch(() => {})
            } else {
              getApp().globalData.userInfo.registerStatus = false
              wx.reLaunch({
                url: '../member/member'
              })
            }
            break;
          case CONNECTION_TIMEOUT:
            wx.navigateTo({
              url: '../noNetwork/noNetwork'
            })
            break;
          default:
            break;
        }
      });
  },

  onLoad: function(options) {
    this.requestTransDetail.tokenRefreshed = false
    wx.showLoading({
      title: '加载中',
    })
    const orderStatus = options.orderStatus;
    this.setData({
      orderStatus,

    });
    if (orderStatus === "RETURN_FULL" || orderStatus === "RETURN_PART") {
      wx.setNavigationBarTitle({
        title: '订单详情'
      })
    }
    if (options.isWebsocket) {
      // todo test data used
      const orderData = getApp().globalData.websocketData;
      this.requestTransDetail(orderData);
      this.setData({
        isWebsocket: options.isWebsocket
      })
    } else {
      this.requestTransDetail(options.orderId)
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    utils.checkNetwork()
  },
})