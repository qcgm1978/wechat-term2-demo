var URLs = require("../../utils/envConf.js").Api;
var utils = require("../../utils/util.js");
var refreshAccessToken = require("../../utils/refreshToken.js").refreshAccessToken;
var ERROR_CODE = require("../../utils/index.js").config.errorCode;
let refreshTimeExpired = true,
  refreshTimeExpiredToPay = true;
const app=getApp();
let globalData=app.globalData;
const getOrderList = URLs.getOrderList;
const backendUrlTransCancel = URLs.backendUrlTransCancel;
const backendUrlTransCount2 = URLs.backendUrlTransCount2
const ACCESS_TOCKEN_EXPIRED = ERROR_CODE.ACCESS_TOCKEN_EXPIRED
const DATA_NOT_FOUND = ERROR_CODE.DATA_NOT_FOUND
const HTTP_SUCCSESS = ERROR_CODE.HTTP_SUCCSESS
const CONNECTION_TIMEOUT = ERROR_CODE.CONNECTION_TIMEOUT
const INVALID_USER_STATUS = ERROR_CODE.INVALID_USER_STATUS

const promptTitleMsg = "提示"
const networkErrorMsg = "网络链接失败！"

const NO_MORE_DATA = "没有更多数据了"
const PULL_TO_REFRESH = "上拉展示更多"
const LOADING = "正在加载数据，请稍后"

const ITEM_COUNT_PER_PAGE = 10,
  payedColor = 'unselect',
  toPayColor = 'select',
  hidePaid = true;

Page({
  data: {
    isToPay: true,
    hidePaid,
    payedColor,
    toPayColor,
    noMoreData: false,
    noMoreDataToPay: false,
    dataMessage: PULL_TO_REFRESH,
    dataMessageToPay: PULL_TO_REFRESH,
    transList: [],
    transListToPay: [],
    loadCompleted: false,
    homeLogo: "images/pic-no-deal.png",
    windowHeight: getApp().globalData.systemInfo.windowHeight * (750 / getApp().globalData.systemInfo.windowWidth),
    windowWidth: getApp().globalData.systemInfo.windowWidth * (750 / getApp().globalData.systemInfo.windowWidth)
  },
  removeOrder(evt) {
    // todo notify server to remove this order data 
    const obj = Object.assign({}, this.data.transListToPay);
    const selectData = obj[evt.target.dataset.index];
    selectData.toRemove = true;
    wx.showModal({
      cancelText: '返回',
      content: '您确定取消订单吗？',
      confirmColor: "#fcb052",
      success: res => {
        if (res.confirm) {
          utils.getRequest(backendUrlTransCancel + selectData.transactionId)
            .then((data) => {
              this.setData({
                transListToPay: obj,
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
    const isSelected = evt.target.dataset.color === 'select',
      isToPay = evt.target.dataset.type === 'toPayColor';
    if (isSelected) {
      return;
    }
    this.setData({
      toPayColor: isToPay ? 'select' : 'unselect',
      payedColor: isToPay ? 'unselect' : 'select',
      hidePaid: isToPay
    })
  },
  requestTransList: function (url, postData) {
    var promise = new Promise((resolve, reject) => {
     

      if (!getApp().globalData.merchantId) {
        this.setData({
          loginStatus: false,
        });
        // todo test data
        // utils.getRequest('../data/get-order.json')
          // .then(resolve.bind(data))
          console.log('not login')
        return 
      }

      utils.postRequest(url, postData)
        .then((data) => {
          const result = data.result;
          if (this.data.transList.length + result.orders.length >= result.itemTotalCount) {
            this.setData({
              noMoreData: true,
              dataMessage: NO_MORE_DATA
            })
          }
          
          this.setData({
            transList:result.orders
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
   
    this.setData({
      ['dataMessage']: LOADING
    })
    this.requestTransList(getOrderList,{
      ...config,
      merchantId: globalData.merchantId
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
        getApp().failRequest('订单');
      })
  },
  //加载更多
  onReachBottom: function() {
    this.requestMoreData(this.data.toPayColor === 'select')
  },

  //下拉刷新
  onPullDownRefresh: function() {
    //30秒内不用刷新
    const isToPay = this.data.toPayColor === 'select';
    // if (isToPay ? !refreshTimeExpiredToPay : !refreshTimeExpired) {
    //   wx.stopPullDownRefresh()
    //   return
    // }
    setTimeout(() => {
      isToPay ? (refreshTimeExpiredToPay = true) : (refreshTimeExpired = true);
    }, 30000)

    var searchNewIds = true;
    const dataMessage = isToPay ? 'dataMessageToPay' : 'dataMessage'
    //wx.showNavigationBarLoading() 
    this.requestTransList(searchNewIds)
      .then((data) => {
        isToPay ? (refreshTimeExpiredToPay = false) : (refreshTimeExpired = false);
        //wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        if (this.data[isToPay ? 'noMoreDataToPay' : 'noMoreData']) {
          this.setData({
            ['dataMessage']: NO_MORE_DATA
          })
        } else {
          this.setData({
            ['dataMessage']: PULL_TO_REFRESH
          })
        }
      })
      .catch((data) => {
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        if (this.data[isToPay ? 'noMoreDataToPay' : 'noMoreData']) {
          this.setData({
            ['dataMessage']: NO_MORE_DATA
          })
        } else {
          this.setData({
            ['dataMessage']: PULL_TO_REFRESH
          })
        }
      })
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()

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
    }, 10000)

    if (option.transNumber == 0) {
      this.requestTransCount()
        .then(transNumber => {
          var pages = getCurrentPages();
          if (pages.length > 1) {
            var prePage = pages[pages.length - 2];
            prePage.updateTransNumberData(transNumber)
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
    this.requestMoreData({
      orderStatus:'',
      offset:1,
      limit:10
    })
    // this.requestMoreData(false)

  },
  goTransDetails: function(e) {
    wx.navigateTo({
      url: `../transactionDetail/transactionDetail?transId=${e.currentTarget.dataset.transId}&notPaid=${this.data.hidePaid}`
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    utils.checkNetwork()
  },
})