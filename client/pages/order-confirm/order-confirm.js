var utils = require("../../utils/util.js");
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem,
  createOrder = Api.createOrder;
const app = getApp();
const globalData = app.globalData;
Page({
  data: {
    data: {},
    points: 0,
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
    defImg: globalData.defaultImg,
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
    this.setData({
      // itemId: options.itemId,
      storeName: getApp().globalData.merchant.merchantStoreName,
      max: getApp().globalData.merchant.pointBalance,
      points,
      credit,
      total: options.total,
      actual: options.total - credit,
      address: getApp().globalData.address,
      phone: app.getPhone(),
      profileName: getApp().globalData.authWechat.authMerchantList[0].userName
    })
    if (getApp().globalData.items) {
      this.setData({
        data: globalData.items instanceof Array ? globalData.items : [globalData.items],
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
      actual: this.data.total - (isVisible ? this.data.credit / 100 : 0)
    })
  },
  textareaConfirm(e) {
    this.setData({
      textarea: e.detail.value
    });
  },
  bindinput(e) {
    const isVisible = this.data.isVisible;
    const points = this.data.points;
    if (points >= e.detail.value) {
      this.setData({
        credit: isVisible ? e.detail.value / 100 : 0,
        actual: this.data.total - e.detail.value / 100
      });
    } else {
      this.setData({
        credit: isVisible ? points / 100 : 0,
        actual: this.data.total - e.detail.value / 100
      });
    }

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
        // todo
        // result.putShelvesFlg = true;
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
        receiverAddress = globalData.address,
        orderItems = globalData.items instanceof Array ? globalData.items : [globalData.items ? globalData.items : this.data.data[0]];
      const usePoint = this.data.isVisible ? this.data.credit*100 : 0;
      // return;
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
          }
        }
      }).then(data => {
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