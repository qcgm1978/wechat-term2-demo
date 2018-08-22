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

    payStyle:{
      "UNPAY":'待支付',
      "WAIT_SHIPMENT":'待配送',
      CANCELED:'订单取消',
      "WAIT_RECEIVE":'待收货',
      RECEIVED:'已收货',
      "RETURN_FULL":'全部退货',
      "RETURN_PART":'部分退货'
    },
    
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
  requestTransDetail: function (orderId, merchantId) {
    // if (!getApp().globalData.userInfo.memberId) {
    //   this.setData({
    //     loginStatus: false,
    //   })
    //   return
    // }
    let requestData = null;
    if (isNaN(orderId) || merchantId===undefined) {
      requestData = Promise.resolve()
    } else {
      requestData = utils.getRequest(backendUrlTrans + getApp().globalData.userInfo.memberId + "/transactions/" + orderId);
    }
    requestData
      .then(data => {
        if (data === undefined){
          data=require('../../data/get-order')
        }
        data = data.result ? data : {
          result: data
        }
        this.setData({
          order:data.result
        });
        wx.hideLoading();
        return;
        if (data.result.orderItem) {
          var itemDataTemp = data.result.orderItem;
          for (let i = 0; i < itemDataTemp.length; i++) {
            var itemName = 'itemData[' + i + '].itemName'
            var itemId = 'itemData[' + i + '].itemId'
            var itemPrice = 'itemData[' + i + '].unitPrice'
            var itemQuantity = 'itemData[' + i + '].quantity'
            var totalPrice = 'itemData[' + i + '].totalPrice';
            const locationId = itemDataTemp[i].locationId;
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
        var actualPay = data.result.payment;
        var cashPayed = false
        var pointPayed = false,
          actualActive = true;
       

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
      this.requestTransDetail(options.orderId, options.merchantId)
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    utils.checkNetwork()
  },
})