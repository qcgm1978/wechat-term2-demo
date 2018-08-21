var URLs = require("../../utils/envConf.js").Api;
var refreshAccessToken = require("../../utils/refreshToken.js").refreshAccessToken;
var ERROR_CODE = require("../../utils/index.js").config.errorCode;
var utils = require("../../utils/util.js");
const backendUrlTrans = URLs.backendUrlTrans

const ACCESS_TOCKEN_EXPIRED = ERROR_CODE.ACCESS_TOCKEN_EXPIRED
const DATA_NOT_FOUND = ERROR_CODE.DATA_NOT_FOUND
const HTTP_SUCCSESS = ERROR_CODE.HTTP_SUCCSESS
const CONNECTION_TIMEOUT = ERROR_CODE.CONNECTION_TIMEOUT
const INVALID_USER_STATUS = ERROR_CODE.INVALID_USER_STATUS

const promptTitleMsg = "提示"
const networkErrorMsg = "网络链接失败！"
const payDetail = require('./payDetail.js').default,
  notShowDiscountInfo = false;
Page({
  ...payDetail,
  data: {
    payStyle:'货到付款',
    time:'2017-12-90 07:07:35',
    payTime:'2017-12-90 07:05:10',
    orderId: 20171290078765,
    netAmountAll:320,
    total:20,
    name:'张磊磊',
    phone:12345678901,
    address:'北京市朝阳区亮马桥234号二十一世纪大厦4楼408',
    src:'./images/pic.png',
    standard:'500ML*12',
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
  copy(){
    wx.setClipboardData({
      data: this.data.orderId+''
    })
  },
  requestTransDetail: function(transId) {
    // if (!getApp().globalData.userInfo.memberId) {
    //   this.setData({
    //     loginStatus: false,
    //   })
    //   return
    // }
    let requestData = null;
    if (isNaN(transId)) {
      requestData = Promise.resolve(transId)
    } else {
      requestData = utils.getRequest(backendUrlTrans + getApp().globalData.userInfo.memberId + "/transactions/" + transId);
    }
    requestData
      .then(data => {
        if (data === undefined){
          data=require('../../data/order')
        }
        data = data.result ? data : {
          result: data
        }
        if (data.result.orderData) {
          var itemDataTemp = data.result.orderData[0].itemData
          for (let i = 0; i < itemDataTemp.length; i++) {
            var itemName = 'itemData[' + i + '].itemName'
            var itemId = 'itemData[' + i + '].itemId'
            var itemPrice = 'itemData[' + i + '].itemPrice'
            var itemQuantity = 'itemData[' + i + '].itemQuantity'
            var totalPrice = 'itemData[' + i + '].totalPrice'
            this.setData({
              [itemName]: itemDataTemp[i].itemName,
              [itemId]: itemDataTemp[i].itemId,
              [itemPrice]: parseFloat(itemDataTemp[i].itemPrice).toFixed(2),
              [itemQuantity]: parseInt(itemDataTemp[i].itemQuantity),
              [totalPrice]: (itemDataTemp[i].itemPrice * parseInt(itemDataTemp[i].itemQuantity)).toFixed(2),
            })
          }
        }

        var totalAmount = parseFloat(0).toFixed(2)
        for (let i = 0; i < this.data.itemData.length; i++) {
          totalAmount = (parseFloat(totalAmount) + parseFloat(this.data.itemData[i].totalPrice)).toFixed(2)
        }

        var pointsTmp = {
          points: 0,
          amount: 0,
        }
        var cashTmp = {
            amount: 0
          },
          wxTmp = {
            points: 0,
            amount: 0,
          }
        var actualPay = 0
        var cashPayed = false
        var pointPayed = false,
          actualActive = true;
        for (let i = 0; i < data.result.financialData.length; i++) {
          if (data.result.financialData[i].cashData) {
            cashTmp.amount = parseFloat(data.result.financialData[i].cashData.amount).toFixed(2)
            if (cashTmp.amount !== 0 && actualActive) {
              cashPayed = true
              actualPay = (parseFloat(actualPay) + parseFloat(data.result.financialData[i].cashData.amount)).toFixed(2)
            }
          } else if (data.result.financialData[i].programData) {
            pointsTmp.amount = parseFloat(data.result.financialData[i].programData.amount).toFixed(2);
            const tempPoints = data.result.financialData[i].programData.points;
            pointsTmp.points = tempPoints;
            if (pointsTmp.amount !== 0 && actualActive) {
              pointPayed = true
              actualPay = (parseFloat(actualPay) + parseFloat(pointsTmp.amount)).toFixed(2)
            }
          } else {
            const other = data.result.financialData[i].otherAccountData;
            other&&(wxTmp.amount = parseFloat(other.amount).toFixed(2));
            if (other&&(other.accountType === 'WeChatPay')) {
              actualPay = other.amount;
              actualActive = false;
            } else if (wxTmp.amount !== 0) {
              actualPay = (parseFloat(actualPay) + parseFloat(wxTmp.amount)).toFixed(2)
            }
          }
        }

        var discountAmount = totalAmount == 0 ? 0 : totalAmount - actualPay
        //0 items
        if (totalAmount == 0) {
          totalAmount = parseFloat(data.result.amount).toFixed(2)
          discountAmount = parseFloat(data.result.discountAmount).toFixed(2);
          if (actualActive) {

            actualPay = parseFloat(data.result.netAmount).toFixed(2)
          } else {
            actualPay = parseFloat(actualPay).toFixed(2);
          }
        }
        wxTmp.points = pointsTmp.points;
        this.setData({
          transShop: data.result.locationData.merchantName,
          timestamp: utils.formatTime(data.result.timestamp),
          earnedPoint: data.result.earnedPoint ? data.result.earnedPoint : 0,
          transactionId: data.result.transactionId,
          amount: parseFloat(totalAmount).toFixed(2),
          discountAmount: parseFloat(discountAmount).toFixed(2),
          netAmount: parseFloat(actualPay).toFixed(2),
          'financialData.programData': pointsTmp,
          'financialData.cashData': cashTmp,
          'financialData.wxTmp': wxTmp,
          showPointPayInfo: pointPayed ? "block" : "none",
          notShowPointPayInfo: !pointPayed,
          showCashPayInfo: cashPayed ? "block" : "none",
          notShowCashPayInfo: false,
          showDiscountInfo: discountAmount == 0 ? "none" : "block",
          notShowDiscountInfo: discountAmount == 0
        })
        wx.hideLoading()
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
    const isToPay = options.notPaid === 'true';
    this.setData({
      isToPay,
      top: `position: absolute;top:${getApp().globalData.systemInfo.windowHeight}px ;transform: translate(0,-100%);`
    });
    isToPay && wx.setNavigationBarTitle({
      title: '订单详情'
    })
    if (options.isWebsocket) {
      // todo test data used
      const orderData = getApp().globalData.websocketData;
      this.requestTransDetail(orderData);
      this.setData({
        isWebsocket: options.isWebsocket
      })
    } else {
      this.requestTransDetail(options.transId)
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    utils.checkNetwork()
  },
})