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
    disable: false,
    payStyle: globalData.payStyle,
    order: {},
    salesReturn: '拒收申请已完成',
    usePointsStr: '，积分已退回您的账户，请查询',
    defImg: globalData.defaultImg,
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
  addGotoTrolley: function (e) {
    getCurrentPages().slice(-2, -1)[0].addGotoTrolley(e)
    // const dataset = e.currentTarget.dataset;
    // const orderItem = dataset.orderitem;
    // const arr = orderItem.map(item => ({
    //   itemId: item.itemId,
    //   quantity: item.quantity
    // }));
    // utils
    //   .addToTrolley(arr)
    //   .then(badge => {
    //     getApp().globalData.checkedTrolley = arr.map(item => item.itemId)
    //     wx.switchTab({
    //       url: `/pages/trolley/trolley`,
    //     })
    //   });
  },
  copy() {
    wx.setClipboardData({
      data: this.data.orderCode + ''
    })
  },
  turnPage(e) {
    const dataset = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../detail/detail?itemId=${dataset.itemid}&categoryId=${dataset.categoryid}`,
    })
  },
  requestTransDetail(orderId) {
    let requestData = null;
    if (isNaN(orderId)) {
      requestData = Promise.resolve()
    } else {
      requestData = utils.getRequest(getOrder, {
        orderId,
        merchantId: app.getMerchantId()
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
          order: data.result,
        });
        this.setOrderStatus(data.result.orderStatus)
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
                .then(() => { })
                .catch(() => { })
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

  onLoad: function (options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
    this.requestTransDetail.tokenRefreshed = false
    wx.showLoading({
      title: '加载中',
    })

    if (options.isWebsocket) {
      // todo test data used
      const orderData = getApp().globalData.websocketData;
      this.requestTransDetail(orderData);
      this.setData({
        isWebsocket: options.isWebsocket
      })
    } else {
      this.requestTransDetail(options.orderId || options.itemId)
    }
  },
  setOrderStatus(orderStatus) {
    this.setData({
      orderStatus,

    });
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2]; //上一个页面
    const isReturn = (orderStatus === "RETURN_FULL" || orderStatus === "RETURN_PART");
    if (isReturn) {
      wx.setNavigationBarTitle({
        title: '拒收详情'
      });
      this.setData({
        isReturn,
        usePoints: this.data.order.orderReturn.returnStatus === 1 && this.data.order.orderReturn.refundPoint > 0
      });
    }
    this.setData({
      orderCode: isReturn ? this.data.order.orderReturn.returnOrderId : this.data.order.orderId,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    utils.checkNetwork()
  },
})