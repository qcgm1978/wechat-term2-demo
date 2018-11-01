var URLs = require("../../utils/envConf.js").Api;
const getProductItem = URLs.getProductItem;
var utils = require("../../utils/util.js");
var refreshAccessToken = require("../../utils/refreshToken.js").refreshAccessToken;
var ERROR_CODE = require("../../utils/index.js").config.errorCode;
import promoteUtil from "../../utils/promotion.js";
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
  totalPages: 0,
  data: {
    config: {
      orderStatus: null,
      offset: 1,
      limit: 10
    },
    defImg: getApp().globalData.defaultImg,
    tabColors: ['selected', 'unselected', 'unselected', 'unselected'],
    payStyle: getApp().globalData.payStyle,
    hasNetwork: true,
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
    windowHeight: getApp().globalData.systemInfo.windowHeight * (750 / getApp().globalData.systemInfo.windowWidth) - 80,
    windowWidth: getApp().globalData.systemInfo.windowWidth * (750 / getApp().globalData.systemInfo.windowWidth)
  },
  arrOrderStatus: [
    null,
    [6],
    [0,2],
    [1, 3,4,5],
    [4, 5]
  ],
  requestPayment(e){
    const dataset = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/checkstand/checkstand?orderId=${dataset.orderId}&orderTotalAmount=${dataset.totalAmount}`,
    })
  },
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

          utils.postRequest({
            url: cancelOrder,
            data: {
              orderId: selectData.orderId,
              merchantId: app.getMerchantId()
            }
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
      this.toggleState(currentIndex)
    } catch (e) {

    }
  },
  // 滚动切换标签样式
  switchTab: function (e) {
    this.toggleState(e.detail.current);
    // this.checkCor();
  },
  toggleState(currentIndex) {
    const tabColors = this.data.tabColors.map((item, index) => index == currentIndex ? 'selected' : 'unselected');
    this.setData({
      currentTab: currentIndex,
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
  },
  requestTransList: function (url, postData) {
    var promise = new Promise((resolve, reject) => {
      utils.postRequest({
        url,
        postData
      })
        .then((data) => {
          const result = data.result;

          const totalPages = Math.ceil(result.orderTotalCount / 10);
          this.setData({
            totalPages,
          })
          if (result.orders === null) {
            this.setData({
              loadCompleted: true
            });
            return resolve(data)
          }
          if (this.data.config.offset >= totalPages) {
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
          const order = result.orders.map(item => {
            const currentItem = {
              ...item
            };
            if (currentItem.orderReturn) {
              currentItem.isReturn = true;
              currentItem.usePoints = currentItem.orderReturn.returnStatus === 1 && currentItem.orderReturn.refundPoint > 0
              if (currentItem.orderReturn.refundCashAmount){
                currentItem.orderReturn.refundCashAmount = utils.getFixedNum(currentItem.orderReturn.refundCashAmount, 2)
              }
            }
            currentItem.totalAmount = utils.getFixedNum(currentItem.totalAmount,2)
            return currentItem;
          });
          this.setData({
            order,
            hasNetwork: true
          })
          resolve()
        })
        .catch((errorCode) => {
          utils
            .errorHander(errorCode, () => this.requestTransList(url, postData))
            .catch(err => {
              if (err === 503) {
                this.setData({
                  hasNetwork: false
                })
              }
            });
        });
    })
    return promise
  },
  refresh() {
    this.onLoad(this.options)
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
        });
        wx.stopPullDownRefresh()

      })
      .catch((data) => {
        this.setData({
          loadCompleted: true
        })
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
  onReachBottom: function () {


  },
  lower() {
    const offset = ++this.data.config.offset;
    if (this.data.totalPages + 1 >= offset) {
      this.setData({
        config: {
          ...this.data.config,
          offset
        }
      });
      this.requestMoreData(this.data.config);
    }
  },
  //下拉刷新
  pullDownRefresh: function () {
    const offset = this.data.config.offset - 1;
    if (offset > 0) {
      this.setData({
        config: {
          ...this.data.config,
          offset
        },
        isLast: false
      });
      this.requestMoreData(this.data.config);
    } else {
      wx.stopPullDownRefresh();
    }

  },


  requestTransCount: function () {
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
  turnPage(e){
    const dataset = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../transactionDetail/transactionDetail?orderId=${dataset.orderId}&orderStatus=${this.data.isReturn ? '' : 'ORDER'}`,
    })
  },
  onLoad: function (option) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
    this.requestTransList.tokenRefreshed = false;
    if (option.tab) {
      const currentIndex = Number(option.tab);
      const tabColors = this.data.tabColors.map((item, index) => index === currentIndex ? 'selected' : 'unselected');
      this.setData({
        // orderNum: JSON.parse(option.orderNum),
        tabColors,
        config: {
          ...this.data.config,
          orderStatus: this.arrOrderStatus[currentIndex],
          offset: 1,
        },
        isLast: false,
        order: []
      });
      if (currentIndex === 4) {
        wx.setNavigationBarTitle({
          title: '拒收列表',
        });
        this.setData({
          isReturn: true
        })
      }
    }

    this.requestMoreData(this.data.config);
  },

  getPutShelfFlag: function (orderGroups) {
    var promise = new Promise((resolve, reject) => {
      let promisesArr = []
      for (let i = 0; i < orderGroups.length;i++){
        for (let j = 0; j < orderGroups[i].items.length; j++){
          promisesArr.push(this.getProduct(orderGroups[i].items[j].itemId, orderGroups[i].items[j].categoryId))
        }
      }
      Promise.all(promisesArr)
        .then(arr => {
          let soldOutNumber = 0
          for (let i = 0; i < arr.length;i++){
              if (!arr[i][0].putShelvesFlg) {
                soldOutNumber++
              }
          }

          let flag = 0
          if (soldOutNumber == 0){
          } else if (soldOutNumber != arr.length){
            flag = 1
          } else if(soldOutNumber == arr.length){
            flag = 2
          }
          let items = arr
          resolve({ flag, items })
        })
        .catch(e => { })
    })
    return promise
  },

  addGotoTrolley: function (e) {
    const dataset = e.currentTarget.dataset;
    let orderGroups = [];
    for(let i = 0; i<this.data.order.length; i++){
      if (this.data.order[i].orderId === dataset.orderId){
        orderGroups = this.data.order[i].orderItems
      }
    }
    this.getPutShelfFlag(orderGroups)
    .then((data) => {
      if(data.flag == 0){
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
            for (let i = 0; i < arr.length; i++ ){
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
                  let temp = { ...orderGroups[i]}
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
          .catch(() => {
          })
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
                if (data.items[k][0].itemId && item.itemId == data.items[k][0].itemId && !item.gift){
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

            if (orderGroups[i].isAllOnShelf){
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
            }else{
              for (let m = 0; m < orderGroups[i].items.length; m++){
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
            .addToTrolleyByGroup(para,1,false)
            .then(badge => {
              wx.switchTab({
                url: `/pages/trolley/trolley`,
              })
            })
        })
      } else if (data.flag == 2){
        //全部售完
        utils.showModal(`您想购买的商品已下架，无法再次购买`, false);
      }
    })

  },

  getProduct(itemId,categoryCd) {
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
        for (let i = 0; i < data.result.length; i++){
          if (itemId == data.result[i].itemId) {
            inStock.push(data.result[i]);
          }
        }
        if (inStock.length == 0){
          let item={}
          item.putShelvesFlg = false
          inStock.push(item)
        }
        return inStock;
      }else{
      }
    }).catch(err => {
      console.log(err);
    })
  },
  goTransDetails: function (e) {
    wx.navigateTo({
      url: `../transactionDetail/transactionDetail?orderId=${e.currentTarget.dataset.orderId}&orderStatus=${e.currentTarget.dataset.orderStatus}`
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    utils.checkNetwork().then(utils.requestStatisLoad);
  },
  onUnload(){
    utils.requestStatisUnload();
  }
})