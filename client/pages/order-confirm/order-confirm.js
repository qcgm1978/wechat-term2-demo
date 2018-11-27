var utils = require("../../utils/util.js");
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem,
  createOrder = Api.createOrder;
const app = getApp();
Page({
  data: {
    data: {},
    points: 0,
    pointBalance: 0,
    usedPoints: 0,
    heightGoods: 212 * 2 + 54, //height-8-74*2-211*2-53*2
    height: '100%',
    top: '100%',
    credit: 0,
    actual: 0,
    enableCreateOrder: true,
    expandAll: false,
    isVisible: true,
    isReturn: false,
    isFailed: false,
    checked: [true, false],
    total: '',
    textarea: '',
    order: {},
    name: '',
    phone: 0,
    defImg: getApp().globalData.defaultImg,
    storeName: '',
    salesReturn: '拒收申请已完成，积分已退回您的账户，请查询',
    address: '',
    addressStore: '../transactionDetail/images/address.png',
    discountTotalAmount: 0,
    totalBeforePromotion: 0,
    totalItemNumber: 0
  },
  changedTxt: `很抱歉,订单中的商品信息发生变更,请确认商品信息后重新下单`,
  failTxt: `很抱歉，提交订单时遇到未知故障
请稍后重试~`,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
    // if (this.inTimeRange()) {
    //   this.setData({
    //     enableCreateOrder: false
    //   })
    // }
    utils.getMerchant().then(data => {
      const points = data.result.availablePoint;
      this.updateData({
        options,
        points,
        pointBalance: data.result.pointBalance,
      });
    });
    if (getApp().globalData.items) {
      let tempData = getApp().globalData.items instanceof Array ? getApp().globalData.items : [getApp().globalData.items]
      let count = 0

      for (let i = 0; i < tempData.length; i++) {
        count += tempData[i].items.length
        if (tempData[i].cartCombinationPromotions && tempData[i].cartCombinationPromotions.length > 0 && tempData[i].cartCombinationPromotions[0] && tempData[i].cartCombinationPromotions[0].giftItems && tempData[i].cartCombinationPromotions[0].giftItems.length > 0) {
          count += tempData[i].cartCombinationPromotions[0].giftItems.length
        }
      }
      this.setData({
        data: getApp().globalData.items instanceof Array ? getApp().globalData.items : [getApp().globalData.items],
        totalItemNumber: count,
      })

      this.setData({
        heightGoods: this.data.data[0].combinationFlag ? 212 * 2 + 54 : 212 * 2 + 54
      })
    } else {
      this.getProduct(options).then(data => {
        this.setData({
          heightGoods: this.data.data[0].combinationFlag ? 212 * 2 + 54 : 212 * 2 + 54
        })
      });
    }
  },
  radioClick(e) {
    this.setData({
      checked: this.data.checked.map((item, index) => {
        const currentIndex = e.currentTarget.dataset.index;
        return currentIndex === index
      }),
    })
  },
  toggleGoods() {
    this.setData({
      expandAll: !this.data.expandAll
    })
  },
  updateData({
    options,
    points,
    pointBalance
  }) {
    // let points = getApp().globalData.merchant.pointBalance;
    points = points / 100 > options.total ? (options.total * 100) : points;
    if (points == 0) {
      this.selectComponent("#checkbox-ios").setData({
        checked: false
      })
      this.setData({
        isVisible: false
      })
    }
    const credit = utils.getFixedNum(this.data.isVisible ? utils.getFixedNum(points / 100, 2) : 0, 2);
    const windowHeight = wx.getSystemInfoSync().windowHeight;
    points = utils.getFixedNum(points);
    this.setData({

      height: getApp().globalData.systemInfo.deviceWindowHeight,
      top: getApp().globalData.systemInfo.deviceWindowHeight,

      storeName: getApp().globalData.merchant.merchantStoreName,
      pointBalance,
      points,
      maxDeduction: credit,
      usedPoints: points,
      credit,
      total: utils.getFixedNum(options.total, 2),
      actual: utils.getFixedNum(options.total - credit, 2),
      address: getApp().globalData.address,
      phone: app.getPhone(),
      profileName: getApp().globalData.authWechat.authMerchantList[0].userName,
      discountTotalAmount: utils.getFixedNum(options.totalDiscount,2),
      totalBeforePromotion: utils.getFixedNum(Number(options.total) + Number(options.totalDiscount), 2)
    })
  },
  onChangeChecked(myEventDetail, myEventOption) {
    const isVisible = myEventDetail.detail.checked;
    this.setData({
      credit: utils.getFixedNum(isVisible ? this.data.usedPoints / 100 : 0),
    })
    this.setData({
      isVisible,
      // usedPoints: utils.getFixedNum(this.data.credit * 100),
      actual: utils.getFixedNum(this.data.total - (isVisible ? this.data.usedPoints / 100 : 0), 2)
    })
  },
  textareaConfirm(e) {
    this.setData({
      textarea: e.detail.value
    });
  },
  bindinput(e) {
    const points = Number(this.data.points);
    if (points >= e.detail.value) {
      this.setData({
        credit: utils.getFixedNum(e.detail.value / 100, 2),
        actual: utils.getFixedNum(this.data.total - e.detail.value / 100, 2)
      });
    } else {
      this.setData({
        credit: utils.getFixedNum(points / 100, 2),
        actual: utils.getFixedNum(this.data.total - points / 100, 2)
      });
    }
    this.setData({
      usedPoints: utils.getFixedNum(this.data.credit * 100)
    })

  },
  getProduct({
    itemId,
    categoryCd,
    quantity = 1
  }) {
    const locationId = getApp().getLocationId();
    return utils.getRequest(getProductItem, {
      locationId,
      categoryCd: '',
      itemIds: itemId ? itemId : '',
    }).then(data => {
      if (data.status === 200) {
        const result = data.result[0];
        result.itemImageAddress = (Array(5).fill('')).reduce((accumulator, item, index) => {
          const imgAddress = result['itemImageAddress' + (index + 1)];
          imgAddress !== '' && accumulator.push(imgAddress);
          return accumulator;
        }, []);
        result.itemImageAddress.length === 0 && result.itemImageAddress.push(this.data.defImg);
        result.quantity = quantity;
        let dataWrapper = [{
          // "groupId": "",
          // "count": 1,
          // "combinationFlag": false,
          // "checked": true,
          // "cartCombinationPromotions": null,
          // "promotions": null,
          // "putShelvesFlg": true,
          // "suitePrice": 6250,
          items: [result]
        }];
        // todo create array with multi ele
        // dataWrapper=new Array(10).fill(result)
        this.setData({
          data: dataWrapper
        })
      } else {
        if (data instanceof Array) {
          this.setData({
            product: data[0]
          });
        }
      }
    }).catch(err => {
      utils.errorHander(err, () => this.getProduct({
        itemId,
      }))
      console.log(err);
    })
  },
  
  createOrder(itemId) {
    // if (this.inTimeRange()) {
    //   return this.setData({
    //     enableCreateOrder: false
    //   })
    // }
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '正在创建订单...',
      });
      const locationId = getApp().globalData.merchant.locationId;
      const receiverName = app.getName(),
        receiverCellPhone = app.getPhone(),
        receiverAddress = getApp().globalData.address,
        orderItems = getApp().globalData.items instanceof Array ? getApp().globalData.items : [getApp().globalData.items ? getApp().globalData.items : this.data.data[0]];

      const usePoint = this.data.isVisible ? this.data.credit * 100 : 0;
      let sumDiscount = 0
      for (let i = 0; i < orderItems.length; i++) {
        orderItems[i].discountAmount = "0"
        if (orderItems[i].cartCombinationPromotions && orderItems[i].cartCombinationPromotions.length > 0 && orderItems[i].cartCombinationPromotions[0]) {
          orderItems[i].promotionId = orderItems[i].cartCombinationPromotions[0].promotionId
        } else {
          orderItems[i].promotionId = ""
        }

        orderItems[i].cartGroupId = orderItems[i].groupId

        if (orderItems[i].cartCombinationPromotions && orderItems[i].cartCombinationPromotions.length > 0 && orderItems[i].cartCombinationPromotions[0]) {
          orderItems[i].discountAmount = orderItems[i].cartCombinationPromotions[0].discountAmount ? orderItems[i].cartCombinationPromotions[0].discountAmount : "0"
          orderItems[i].discountPercentage = orderItems[i].cartCombinationPromotions[0].discountPercentage
          if (orderItems[i].discountAmount && orderItems[i].discountAmount > 0) {
            sumDiscount += orderItems[i].discountAmount
          }
          for (let j = 0; j < orderItems[i].items.length; j++) {
            orderItems[i].items[j].unit = orderItems[i].items[j].saleUnit
            orderItems[i].items[j].itemUnit = orderItems[i].items[j].saleUnit

            if (orderItems[i].combinationFlag) {
              orderItems[i].items[j].quantity = orderItems[i].items[j].quantity * orderItems[i].count
            } else {
              orderItems[i].items[j].promotionId = orderItems[i].promotionId
              orderItems[i].items[j].discountAmount = orderItems[i].discountAmount
              orderItems[i].items[j].discountPercentage = orderItems[i].discountPercentage
            }
          }
          if (orderItems[i].cartCombinationPromotions[0].giftItems && orderItems[i].cartCombinationPromotions[0].giftItems.length > 0) {
            for (let j = 0; j < orderItems[i].cartCombinationPromotions[0].giftItems.length; j++) {
              orderItems[i].cartCombinationPromotions[0].giftItems[j].isGift = true
              // if (!orderItems[i].combinationFlag) {
              orderItems[i].cartCombinationPromotions[0].giftItems[j].promotionId = orderItems[i].promotionId
              orderItems[i].cartCombinationPromotions[0].giftItems[j].discountAmount = 0
              orderItems[i].cartCombinationPromotions[0].giftItems[j].discountPercentage = 0
              // }
              orderItems[i].cartCombinationPromotions[0].giftItems[j].unit = "个"
              orderItems[i].cartCombinationPromotions[0].giftItems[j].itemUnit = "个"
              orderItems[i].cartCombinationPromotions[0].giftItems[j].saleUnit = "个"
              orderItems[i].cartCombinationPromotions[0].giftItems[j].itemId = orderItems[i].cartCombinationPromotions[0].giftItems[j].giftItemId
              orderItems[i].cartCombinationPromotions[0].giftItems[j].itemName = orderItems[i].cartCombinationPromotions[0].giftItems[j].giftItemName
              orderItems[i].items.push(orderItems[i].cartCombinationPromotions[0].giftItems[j])
            }
          }
        }


        if (!orderItems[i].combinationFlag) {
          delete orderItems[i]["promotionId"]
          delete orderItems[i]["discountAmount"]
          delete orderItems[i]["discountPercentage"]
        }
        //itemUnit补全
        for (let j = 0; j < orderItems[i].items.length; j++) {
          orderItems[i].items[j].itemUnit = orderItems[i].items[j].itemUnit ? orderItems[i].items[j].itemUnit:orderItems[i].items[j].saleUnit
        }
      }

      let tempdata = {
        orderItems,
        orderPomotionId: "0",
        orderPomotionDiscountAmount: 0,
        cashAmount: this.data.total - this.data.credit,
        discountTotalAmount: sumDiscount,
        merchantId: app.getMerchantId(),
        locationId: String(locationId),
        orderItemSource: getApp().globalData.items ? getApp().globalData.items.orderItemSource : 0,
        usePoint,
        totalAmount: /*0.01||*/this.data.total,
        receiverInfo: {
          receiverName,
          receiverCellPhone,
          receiverAddress
        },
      }

      console.log(JSON.stringify(tempdata))
      const isWechat = this.data.checked[0]
      utils.postRequest({
        url: createOrder,
        data: {
          paymentMethod: (isWechat && this.isNotFullCredits()) ? 1 : 3,
          orderItems,
          orderPomotionId: "0",
          orderPomotionDiscountAmount: 0,
          cashAmount: utils.getFixedNum(this.data.total - this.data.credit),
          discountTotalAmount: sumDiscount,
          merchantId: app.getMerchantId(),
          locationId: String(locationId),
          orderItemSource: getApp().globalData.items ? getApp().globalData.items.orderItemSource : 0,
          usePoint,
          totalAmount: this.data.total,
          receiverInfo: {
            receiverName,
            receiverCellPhone,
            receiverAddress
          },
        }
      }).then(data => {
        // todo test 409
        // throw (409)
        wx.hideLoading()
        if (data.status === 200) {
          const trolley = getCurrentPages().slice(-2, -1)[0];
          if (trolley && trolley.route.includes('trolley/trolley')) {
            trolley.selectedRadio = [];
          }
          const isToCheckstand = isWechat && this.isNotFullCredits()
          wx.redirectTo({
            url: `/pages/${isToCheckstand ? 'checkstand/checkstand' : 'order-success/order-success'}?orderId=${data.result.orderId}&orderTotalAmount=${data.result.totalAmount}`,
          })
        } else { }
      }).catch(err => {
        // todo test 409
        // err=409;
        if (err === 409) { //price or putShelfFlg change
          // 调用上个页面的onload函数实现页面重新加载
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2]; //上一个页面
          prevPage && prevPage.onLoad(prevPage.options);
          this.setData({
            prompt: this.changedTxt
          })
        } else {
          console.log(err);
          this.setData({
            prompt: this.failTxt
          })
        }
        this.setData({
          isFailed: true
        });
        wx.hideLoading();
      })
    })
  },
  isNotFullCredits(){
    return this.data.actual !== '0.00'
  },
  closePopup() {
    this.setData({
      isFailed: false
    });
    if (this.changedTxt === this.data.prompt) {
      wx.navigateBack({
        delta: 1
      });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    utils.checkNetwork().then(utils.requestStatisLoad);
  },
  onHide() {
    utils.requestStatisUnload();
  },
  onUnload() {
    utils.requestStatisUnload();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})