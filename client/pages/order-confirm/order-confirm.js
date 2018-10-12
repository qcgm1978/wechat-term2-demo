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
    usedPoints:0,
    height: getApp().globalData.systemInfo.deviceWindowHeight,
    top:'100%',
    credit: 0,
    actual: 0,
    isVisible: true,
    isReturn: false,
    isFailed: false,
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

  },
  changedTxt: `很抱歉,订单中的商品信息发生变更,请确认商品信息后重新下单`,
  failTxt: `很抱歉，提交订单时遇到未知故障
请稍后重试~`,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
    let points = getApp().globalData.merchant.pointBalance;
    points = points / 100 > options.total ? (options.total*100):points;
    if (points == 0){
      this.selectComponent("#checkbox-ios").setData({
        checked: false
      })
      this.setData({
        isVisible: false
      })
    }
    const credit = this.data.isVisible ? points / 100 : 0;
    const windowHeight = wx.getSystemInfoSync().windowHeight;
    this.setData({
      height: getApp().globalData.systemInfo.deviceWindowHeight,
      top: getApp().globalData.systemInfo.deviceWindowHeight,
      storeName: getApp().globalData.merchant.merchantStoreName,
      max: getApp().globalData.merchant.pointBalance,
      points,
      usedPoints:points,
      credit,
      total: utils.getFixedNum(options.total,2),
      actual: utils.getFixedNum(options.total - credit,2),
      address: getApp().globalData.address,
      phone: app.getPhone(),
      profileName: getApp().globalData.authWechat.authMerchantList[0].userName
    })
    if (getApp().globalData.items) {
      console.log(getApp().globalData.items instanceof Array ? getApp().globalData.items : [getApp().globalData.items])
      this.setData({
        data: getApp().globalData.items instanceof Array ? getApp().globalData.items : [getApp().globalData.items],
      })
    } else {
      this.getProduct(options);
    }
  },
  onChangeChecked(myEventDetail, myEventOption) {
    const isVisible = myEventDetail.detail.checked;
    this.setData({
      isVisible,
      credit: isVisible ? this.data.credit / 100 : 0,
      actual: utils.getFixedNum(this.data.total - (isVisible ? this.data.credit / 100 : 0),2)
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
        credit: utils.getFixedNum(e.detail.value / 100,2) ,
        actual: utils.getFixedNum(this.data.total - e.detail.value / 100, 2)
      });
    } else {
      this.setData({
        credit: utils.getFixedNum(points / 100, 2 ),
        actual: utils.getFixedNum(this.data.total - points / 100, 2)
      });
    }
    this.setData({
      usedPoints: parseInt(this.data.credit * 100)
    })

  },
  getProduct({
    itemId,
    categoryCd,
    quantity
  }) {
    const locationId = getApp().globalData.merchant.locationId;
    utils.getRequest(getProductItem, {
      locationId,
      categoryCd: '',
      itemIds: itemId ? itemId : '',
    }).then(data => {
      console.log(data);
      if (data.status === 200) {
        const result = data.result[0];
        result.itemImageAddress = (Array(5).fill('')).reduce((accumulator, item, index) => {
          const imgAddress = result['itemImageAddress' + (index + 1)];
          imgAddress !== '' && accumulator.push(imgAddress);
          return accumulator;
        }, []);
        result.itemImageAddress.length === 0 && result.itemImageAddress.push(this.data.defImg);
        result.quantity = quantity;
        this.setData({
          data: [result]
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
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '正在创建订单...',
      });
      const locationId = getApp().globalData.merchant.locationId;
      const receiverName = app.getName(),
        receiverCellPhone = app.getPhone(),
        receiverAddress = getApp().globalData.address,
        orderItems = getApp().globalData.items instanceof Array ? getApp().globalData.items : [getApp().globalData.items ? getApp().globalData.items : this.data.data[0]];
      const usePoint = this.data.isVisible ? this.data.credit*100 : 0;
      // return;
      for (let i = 0; i < orderItems.length; i++){
        orderItems[i].promotionId = orderItems[i].promotions[0].promotionId
      }
      
      // console.log("orderItems")
      // console.log(orderItems)
      // console.log("getApp().globalData.items")
      // console.log(getApp().globalData.items)


      let tempData = {
        orderItems,
        merchantId: app.getMerchantId(),
        locationId: String(locationId),
        orderItemSource: getApp().globalData.items.orderItemSource,
            // merchantMsg: this.data.textarea || 'aaa',
            usePoint,
            totalAmount: this.data.total,
        receiverInfo: {
          receiverName,
          receiverCellPhone,
          receiverAddress
        },
      }
      console.log(JSON.stringify(tempData))


      utils.postRequest({
        url: createOrder,
        data: {
          orderItems,
          merchantId: app.getMerchantId(),
          locationId: String(locationId),
          orderItemSource: getApp().globalData.items.orderItemSource,
          // merchantMsg: this.data.textarea || 'aaa',
          usePoint,
          totalAmount: this.data.total,
          receiverInfo: {
            receiverName,
            receiverCellPhone,
            receiverAddress
          },
          //promotion
          //discountTotalAmount: discountTotalAmount,
          //orderItems.
          // -cartGroupId
          // -discountAmount
          // -promotionId
          // -items

        }
      }).then(data => {
        // todo test 409
        // throw (409)
        wx.hideLoading()
        console.log(data);
        if (data.status === 200) {
          const trolley = getCurrentPages().slice(-2, -1)[0];
          if (trolley && trolley.route.includes('trolley/trolley')){
            trolley.selectedRadio = [];
          }
          wx.redirectTo({
            url: `/pages/order-success/order-success?orderId=${data.result.orderId}&orderTotalAmount=${data.result.totalAmount}`,
          })
        } else {}
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
  closePopup() {
    this.setData({
      isFailed: false
    });
    if (this.changedTxt===this.data.prompt){
      wx.navigateBack({
        delta: 1
      });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})