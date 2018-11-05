var URLs = require("../../utils/envConf.js").Api;
const getProductItem = URLs.getProductItem;
var refreshAccessToken = require("../../utils/refreshToken.js").refreshAccessToken;
var ERROR_CODE = require("../../utils/index.js").config.errorCode;
var utils = require("../../utils/util.js");
import promoteUtil from "../../utils/promotion.js";
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
    partSoldOutDialogFlag: false,
    soldOutDialogFlag: false,
    addressStore: "images/address.png",
    windowHeight: getApp().globalData.systemInfo.windowHeight * (750 / getApp().globalData.systemInfo.windowWidth),
    windowWidth: getApp().globalData.systemInfo.windowWidth * (750 / getApp().globalData.systemInfo.windowWidth)
  },
  timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp );
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    // var month = months[a.getMonth()];
    var month = a.getMonth() + 1;
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    // var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    const time = `${month}月${date}日${hour}:${min}`
    return time;
  },
  getPutShelfFlag: function(orderGroups) {
    var promise = new Promise((resolve, reject) => {
      let promisesArr = []
      for (let i = 0; i < orderGroups.length; i++) {
        for (let j = 0; j < orderGroups[i].items.length; j++) {
          promisesArr.push(this.getProduct(orderGroups[i].items[j].itemId, orderGroups[i].items[j].categoryId))
        }
      }
      Promise.all(promisesArr)
        .then(arr => {
          let soldOutNumber = 0
          for (let i = 0; i < arr.length; i++) {
            if (!arr[i][0].putShelvesFlg) {
              soldOutNumber++
            }
          }

          let flag = 0
          if (soldOutNumber == 0) {} else if (soldOutNumber != arr.length) {
            flag = 1
          } else if (soldOutNumber == arr.length) {
            flag = 2
          }
          let items = arr
          resolve({
            flag,
            items
          })
        })
        .catch(e => {})
    })
    return promise
  },

  addGotoTrolley: function(e) {

    let orderGroups = [];
    orderGroups = this.data.order.orderItems

    this.getPutShelfFlag(orderGroups)
      .then((data) => {
        if (data.flag == 0) {
          //在售
          let para = {
            addGroupList: []
          }
          let promises = []
          for (let i = 0; i < orderGroups.length; i++) {
            promises.push(promoteUtil.isValidPromotion(orderGroups[i]))
          }

          Promise.all(promises)
            .then((arr) => {
              for (let i = 0; i < arr.length; i++) {
                if (arr[i]) {
                  orderGroups[i].count = 1
                  orderGroups[i].addItemList = []
                  let items = orderGroups[i].items
                  for (let j = 0; j < items.length; j++) {
                    items[j].categoryCode = items[j].categoryId
                    if (!items[j].gift) {
                      orderGroups[i].addItemList.push(items[j])
                    }
                  }
                  let promotions = []
                  let promotion = {}
                  promotion.promotionId = orderGroups[i].promotionId
                  promotions.push(promotion)
                  orderGroups[i].promotions = promotions
                  if (orderGroups[i].items && orderGroups[i].items.length > 0) {
                    para.addGroupList.push(orderGroups[i])
                  }
                } else {
                  for (let j = 0; j < orderGroups[i].items.length; j++) {
                    if (orderGroups[i].items[j].gift) {
                      continue
                    }
                    orderGroups[i].count = 1
                    orderGroups[i].addItemList = []
                    orderGroups[i].items[j].categoryCode = orderGroups[i].items[j].categoryId

                    orderGroups[i].addItemList.push(orderGroups[i].items[j])

                    let promotions = []
                    let promotion = {}
                    promotion.promotionId = orderGroups[i].promotionId
                    promotions.push(promotion)
                    orderGroups[i].promotions = promotions
                    let temp = { ...orderGroups[i]
                    }
                    para.addGroupList.push(temp)
                  }
                }
              }
              utils
                .addToTrolleyByGroup(para, 1, false)
                .then(badge => {
                  wx.switchTab({
                    url: `/pages/trolley/trolley`,
                  })
                })
            })
            .catch(() => {})
        } else if (data.flag == 1) {
          //部分售完

          utils.showModal(`订单中的部分商品卖光了,您是否继续购买其余商品?`).then(() => {
            let para = {
              addGroupList: []
            }
            for (let i = 0; i < orderGroups.length; i++) {
              let onShelfNumber = 0
              orderGroups[i].items = orderGroups[i].items.reduce((accumulator, item) => {
                item.categoryCode = item.categoryId
                let isOnShelf = false
                for (let k = 0; k < data.items.length; k++) {
                  if (data.items[k][0].itemId && item.itemId == data.items[k][0].itemId && !item.gift) {
                    isOnShelf = true
                    onShelfNumber++
                  }
                }
                if (isOnShelf) {
                  accumulator.push(item);
                }
                return accumulator;
              }, []);

              if (onShelfNumber == orderGroups[i].items.length) {
                orderGroups[i].isAllOnShelf = true
              } else {
                orderGroups[i].isAllOnShelf = false
              }

              if (orderGroups[i].isAllOnShelf) {
                orderGroups[i].count = 1
                orderGroups[i].addItemList = orderGroups[i].items
                let promotions = []
                let promotion = {}
                promotion.promotionId = orderGroups[i].promotionId
                promotions.push(promotion)
                orderGroups[i].promotions = promotions
                if (orderGroups[i].items && orderGroups[i].items.length > 0) {
                  para.addGroupList.push(orderGroups[i])
                }
              } else {
                for (let m = 0; m < orderGroups[i].items.length; m++) {
                  orderGroups[i].count = 1
                  orderGroups[i].addItemList = [orderGroups[i].items[m]]
                  let promotions = []
                  let promotion = {}
                  promotion.promotionId = orderGroups[i].promotionId
                  promotions.push(promotion)
                  orderGroups[i].promotions = promotions
                  para.addGroupList.push(orderGroups[i])
                }
              }

            }
            utils
              .addToTrolleyByGroup(para, 1, false)
              .then(badge => {
                wx.switchTab({
                  url: `/pages/trolley/trolley`,
                })
              })
          })
        } else if (data.flag == 2) {
          //全部售完
          utils.showModal(`您想购买的商品已下架，无法再次购买`, false);
        }
      })
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
        url: `../transactionDetail/transactionDetail?orderId=${this.data.order.orderId}&orderStatus=${ 'ORDER'}`
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
        const expireTime=order.expireTime
        this.setData({
          order,
          expireTime: this.timeConverter(expireTime) 
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
    this.setData({
      orderStatus,
      remark: (orderStatus === 'COMPLETED' && this.data.order.actualAmount !== this.data.order.payment.cashAmount) ? `(待入账)` : ''

    });
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2]; //上一个页面
    const isReturn = this.isOrderPage ? false : (orderStatus === "RETURN_FULL" || orderStatus === "RETURN_PART");
    if (isReturn) {
      wx.setNavigationBarTitle({
        title: '拒收详情'
      });
      const isWechat = this.data.order.payment.paymentMethod === 'WECHAT_PAY'
      this.setData({
        isReturn,
        usePoints: this.data.order.orderReturn.returnStatus === 1 && this.data.order.orderReturn.refundPoint > 0,
        salesReturn: isWechat ? '拒收/退款进度:已拒收' : this.data.salesReturn,
        isWechat
      });
    }
    this.setData({
      orderCode: this.data.order.orderReturn.returnOrderId
    })
  },
  onShow: function(options) {
    utils.checkNetwork().then(utils.requestStatisLoad);
  },
  onHide() {
    utils.requestStatisUnload();
  },
  onUnload() {
    utils.requestStatisUnload();
  },

  letMeThink: function() {
    this.setData({
      dialogFlag: true
    })
  },

  proceedBuy: function() {

    this.setData({
      dialogFlag: false
    })
  },
  confirmClose: function() {
    this.setData({
      soldOutDialogFlag: true
    })
  },
  getProduct(itemId, categoryCd) {
    const locationId = getApp().globalData.merchant.locationId;
    return utils.getRequest(getProductItem, {
      locationId,
      categoryCd: categoryCd ? categoryCd : '',
      itemIds: itemId ? itemId : '',
    }).then(data => {
      if (data.status === 200) {
        let inStock = []
        // const inStock = data.result.reduce((accumulator, item) => {
        //   if (itemId == item.itemId) {
        //     accumulator.push(item);
        //   }
        //   return accumulator;
        // }, []);
        for (let i = 0; i < data.result.length; i++) {
          if (itemId == data.result[i].itemId) {
            inStock.push(data.result[i]);
          }
        }
        if (inStock.length == 0) {
          let item = {}
          item.putShelvesFlg = false
          inStock.push(item)
        }
        return inStock;
      } else {}
    }).catch(err => {
      console.log(err);
    })
  },
})