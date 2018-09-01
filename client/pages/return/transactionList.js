var URLs = require("../../utils/envConf.js").Api;
var utils = require("../../utils/util.js");
var refreshAccessToken = require("../../utils/refreshToken.js").refreshAccessToken;
var ERROR_CODE = require("../../utils/index.js").config.errorCode;
let refreshTimeExpired = true,
  refreshTimeExpiredToPay = true;
const app = getApp();
let globalData = app.globalData;
const getOrderList = URLs.getOrderList;
const cancelOrder = URLs.cancelOrder
const ACCESS_TOCKEN_EXPIRED = ERROR_CODE.ACCESS_TOCKEN_EXPIRED
const DATA_NOT_FOUND = ERROR_CODE.DATA_NOT_FOUND
const HTTP_SUCCSESS = ERROR_CODE.HTTP_SUCCSESS
const CONNECTION_TIMEOUT = ERROR_CODE.CONNECTION_TIMEOUT
const INVALID_USER_STATUS = ERROR_CODE.INVALID_USER_STATUS

const promptTitleMsg = "提示"
const networkErrorMsg = "网络链接失败！"

const NO_MORE_DATA = "没有更多订单了~"
const PULL_TO_REFRESH = "上拉展示更多"
const LOADING = "正在加载数据，请稍后"

const ITEM_COUNT_PER_PAGE = 10,
  payedColor = 'unselect',
  toPayColor = 'select',
  hidePaid = true;

Page({
  data: {
    config: {
      orderStatus: null,
      offset: 1,
      limit: 10
    },
    tabColors: ['selected', 'unselected', 'unselected', 'unselected'],
    payStyle: globalData.payStyle,
    isToPay: true,
    hidePaid,
    payedColor,
    toPayColor,
    noMoreData: false,
    noMoreDataToPay: false,
    dataMessage: PULL_TO_REFRESH,
    dataMessageToPay: PULL_TO_REFRESH,
    order: [],
    loadCompleted: false,
    homeLogo: "images/pic-no-deal.png",
    windowHeight: getApp().globalData.systemInfo.windowHeight * (750 / getApp().globalData.systemInfo.windowWidth),
    windowWidth: getApp().globalData.systemInfo.windowWidth * (750 / getApp().globalData.systemInfo.windowWidth)
  },
  arrOrderStatus: [null, 1, 3, [2, 4]],
  removeOrder(evt) {
    const arr = this.data.order;
    const selectData = arr[evt.target.dataset.index];
    selectData.toRemove = true;
    wx.showModal({
      cancelText: '返回',
      content: '您确定取消订单吗？',
      confirmColor: "#fcb052",
      success: res => {
        if (res.confirm) {
          utils.postRequest(cancelOrder, {
              orderId: selectData.orderId,
              merchantId: globalData.merchantId
            })
            .then((data) => {
              this.setData({
                order: arr,
              });
            })
            .catch(err => {
              wx.showToast({
                title: '取消订单失败，请重试',
                icon: 'none',
                duration: 2000
              })
            })
        }
      }
    })
  },
  toggleTab(evt) {
    try {
      let currentIndex = evt.target.dataset.index
      const tabColors = this.data.tabColors.map((item, index) => index == currentIndex ? 'selected' : 'unselected');
      this.setData({
        tabColors,
        config: {
          ...this.data.config,
          orderStatus: this.arrOrderStatus[currentIndex],
          offset: 1,
        },
        isLast: false,
        order: []
      });
      this.requestMoreData(this.data.config);
    } catch (e) {

    }
  },
  requestTransList: function(url, postData) {
    var promise = new Promise((resolve, reject) => {
      utils.postRequest(url, postData)
        .then((data) => {
          const result = data.result;
          if (this.data.order.length + result.orders.length >= result.orderTotalCount) {
            this.setData({
              dataMessage: NO_MORE_DATA,
              isLast: true
            })
          } else {
            this.setData({
              dataMessage: PULL_TO_REFRESH,
              isLast: false
            })
          }

          this.setData({
            order: result.orders
          })
          resolve()
        })
        .catch((errorCode) => {
          // return resolve(fakeData)
          console.log(errorCode);
          switch (errorCode) {
            case INVALID_USER_STATUS:
              getCurrentPages()[0].invalidUserMessage()
              reject()
              break
            case DATA_NOT_FOUND:
              reject()
              break;
            case ACCESS_TOCKEN_EXPIRED:
              if (!this.requestTransList.tokenRefreshed) {

                refreshAccessToken()
                  .then(() => {
                    this.requestTransList.tokenRefreshed = true
                    return this.requestTransList()
                  })
                  .then(() => {
                    resolve()
                  })
                  .catch(() => {
                    reject()
                  })

              } else {
                getApp().globalData.userInfo.registerStatus = false
                wx.reLaunch({
                  url: '../member/member'
                })
                reject()
              }
              break;
            case CONNECTION_TIMEOUT:
              wx.navigateTo({
                url: '../noNetwork/noNetwork'
              })
              reject()
              break;
            default:
              reject()
              break;
          }
        });
    })
    return promise
  },

  requestMoreData(config) {
    if (this.data.isLast) {
      return;
    }
    this.setData({
      ['dataMessage']: LOADING
    })
    this.requestTransList(getOrderList, {
        ...config,
        merchantId: getApp().getMerchantId()
      })
      .then((data) => {
        this.setData({
          loadCompleted: true
        })
        wx.hideLoading()

        wx.stopPullDownRefresh()

      })
      .catch((data) => {
        this.setData({
          loadCompleted: true
        })
        wx.hideLoading()
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        if (this.data.isLast) {
          this.setData({
            ['dataMessage']: NO_MORE_DATA
          })
        } else {
          this.setData({
            ['dataMessage']: PULL_TO_REFRESH
          })
        }
        app.failRequest('订单');
      })
  },
  //加载更多
  onReachBottom: function() {
    this.setData({
      config: {
        ...this.data.config,
        offset: ++this.data.config.offset
      }
    });
    this.requestMoreData(this.data.config);

  },

  //下拉刷新
  onPullDownRefresh: function() {
    const offset = this.data.config.offset - 1;
    if (offset > 0) {
      this.setData({
        config: {
          ...this.data.config,
          offset
        }
      });
      this.requestMoreData(this.data.config);
    } else {
      wx.stopPullDownRefresh();
    }

  },


  requestTransCount: function() {
    var promise = new Promise((resolve, reject) => {
      utils.getRequest(backendUrlTransCount2 + getApp().globalData.userInfo.memberId + "/transactions/count")
        .then(data => {
          resolve(data.result)
        })
        .catch(errorCode => {
          reject(errorCode)
        });

    })
    return promise
  },

  onLoad: function(option) {
    this.requestTransList.tokenRefreshed = false
    wx.showLoading({
      title: '加载中',
    })
    setTimeout(() => {
      wx.hideLoading()
    }, 10000);
    if (option.tab) {
      const currentIndex = Number(option.tab);
      const tabColors = this.data.tabColors.map((item, index) => index === currentIndex ? 'selected' : 'unselected');
      this.setData({
        tabColors,
        config: {
          ...this.data.config,
          orderStatus: this.arrOrderStatus[currentIndex],
          offset: 1,
        },
        isLast: false,
        order: []
      });
    }
    this.requestMoreData(this.data.config);
  },
  goTransDetails: function(e) {
    wx.navigateTo({
      url: `../detail/detail?orderId=${e.currentTarget.dataset.orderId}&orderStatus=${e.currentTarget.dataset.orderStatus}`
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    utils.checkNetwork()
  },
})