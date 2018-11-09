var URLs = require("../../utils/envConf.js").Api;
const getProductItem = URLs.getProductItem;
var refreshAccessToken = require("../../utils/refreshToken.js").refreshAccessToken;
var ERROR_CODE = require("../../utils/index.js").config.errorCode;
var utils = require("../../utils/util.js");
import promoteUtil from "../../utils/promotion.js";
import checkPromotion from '../transactionList/checkPromotion.js'
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
var partSoldOut = false
var soldOut = false
Page({
  ...payDetail,
  ...checkPromotion.methods,
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
    remark: '',
    showPrepayedCardInfo: "none",
    showPointPayInfo: "none",
    notShowPointPayInfo: true,
    showCashPayInfo: "none",
    notShowCashPayInfo: true,
    showDiscountInfo: "none",
    notShowDiscountInfo,
    amount: 0,
    expireTime: 0,
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
    isReturn: false,
    partSoldOutDialogFlag: false,
    soldOutDialogFlag: false,
    addressStore: "images/address.png",
    windowHeight: getApp().globalData.systemInfo.windowHeight * (750 / getApp().globalData.systemInfo.windowWidth),
    windowWidth: getApp().globalData.systemInfo.windowWidth * (750 / getApp().globalData.systemInfo.windowWidth)
  },
  timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    // var month = months[a.getMonth()];
    var month = a.getMonth() + 1;
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    // var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    const time = `${month}月${date}日${hour < 10 ? ('0' + hour) : hour}:${min < 10 ? ('0' + min) : min}`
    return time;
  },
  addGotoTrolley: function (e) {

    let orderGroups = [];
    orderGroups = this.data.order.orderItems
    this.buyOrderGroupsAgain(orderGroups)
  },
  copy() {
    wx.setClipboardData({
      data: this.data.isReturn ? (this.data.orderCode + '') : this.data.order.orderId
    })
  },
  turnPage(e) {
    const dataset = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../detail/detail?itemId=${dataset.itemid}&categoryId=${dataset.categoryid}`,
    })
  },
  turnOrderPage(e) {
    const dataset = e.currentTarget.dataset;
    if (dataset.type === 'order' && this.data.isReturn) {
      wx.navigateTo({
        url: `../transactionDetail/transactionDetail?orderId=${this.data.order.orderId}&orderStatus=${'ORDER'}`
      });
    } else if (dataset.type === 'return' && !this.data.isReturn) {
      wx.navigateTo({
        url: `../transactionDetail/transactionDetail?orderId=${this.data.order.orderId}&orderStatus=${e.currentTarget.dataset.orderStatus}`
      });
    }
  },
  requestPayment(e) {
    const dataset = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/checkstand/checkstand?orderId=${dataset.orderId}&orderTotalAmount=${dataset.totalAmount}`,
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
        };
        const order = data.result;
        // const expireTime = (new Date().getTime() + 6 * 60 * 60 * 1000) / 1000
        const expireTime = order.expireTime
        const isWechat = order.payment.paymentMethod === 'WECHAT_PAY'
        this.setData({
          order,
          expireTime: this.timeConverter(expireTime),
          isWechat,
        });
        this.setOrderStatus(order.orderStatus)
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
    this.isOrderPage = options.orderStatus === 'ORDER';
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
    const isCanceled = this.data.payStyle[orderStatus] === "订单取消"
    const isReturnOrder = this.data.payStyle[orderStatus] === '全部拒收' || this.data.payStyle[orderStatus] === '部分拒收'
    this.setData({
      orderStatus,
      isCanceled,
      isReturnOrder,
      remark: (orderStatus === 'COMPLETED' && this.data.order.actualAmount !== this.data.order.payment.cashAmount) ? `(待入账)` : ''

    });
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2]; //上一个页面
    const isReturn = this.isOrderPage ? false : (orderStatus === "RETURN_FULL" || orderStatus === "RETURN_PART");
    const returnCompleted = this.data.order.orderReturn.returnStatus === 1
    if (returnCompleted) {
      this.setData({
        returnCompleted,
      })
    }
    if (isReturn) {
      wx.setNavigationBarTitle({
        title: '拒收详情'
      });
      this.setData({
        isReturn,
        usePoints: returnCompleted && this.data.order.orderReturn.refundPoint > 0,
        salesReturn: this.data.isWechat ? '拒收/退款进度:已拒收' : this.data.salesReturn,
      });
    }
    this.setData({
      orderCode: this.data.order.orderReturn.returnOrderId
    })
  },
  onShow: function (options) {
    utils.checkNetwork().then(utils.requestStatisLoad);
  },
  onHide() {
    utils.requestStatisUnload();
  },
  onUnload() {
    utils.requestStatisUnload();
  },

  letMeThink: function () {
    this.setData({
      dialogFlag: true
    })
  },

  proceedBuy: function () {

    this.setData({
      dialogFlag: false
    })
  },
  confirmClose: function () {
    this.setData({
      soldOutDialogFlag: true
    })
  },
})