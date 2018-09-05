import utils from "../../utils/util.js";
import {
  Api
} from '../../utils/envConf.js';
import {
  getRequest
} from '../../utils/util.js';
const getCart = Api.getCart;
const app = getApp();
let globalData = app.globalData;
Page({
  data: {
   
    trolley: [],
    minAmount: 500,
    height: getApp().globalData.systemInfo.windowHeight - (34 + 48) * 2,
    checkbox: 0,
    currentMoney: 0,
    disableBuy: true
  },
  start: 0,
  limit: 20,
  checkAll: false,
  onLoad: function(options) {},
  addOn() {
    wx.switchTab({
      url: '/pages/sort/sort',
    })
  },
  selectAll(e) {
    this.checkAll = !this.checkAll;
    const checkbox = []
    const trolley = this.data.trolley.map((item, index) => {
      item.putShelvesFlg && (item.checked = this.checkAll);
      this.checkAll && item.putShelvesFlg && checkbox.push(index);
      return item;
    });
    this.setMoneyData(checkbox)

    this.setData({
      trolley,
    })
  },
  lower() {

  },
  getTotalPrice(checkbox) {
    return checkbox.reduce((accumulator, item) => {
      const trolleyItem = this.data.trolley[item];
      trolleyItem.checked = true;
      return accumulator + trolleyItem.price * trolleyItem.quantity
    }, 0);
  },
  checkboxChange(e) {
    const checkbox = e.detail.value;
    this.setMoneyData(checkbox)
  },
  setMoneyData(checkbox) {
    const currentMoney = this.getTotalPrice(checkbox)
    const remaining = 500 - currentMoney;
    const disableBuy = remaining > 0
    this.setData({
      checkbox: checkbox.length,
      currentMoney,
      disableBuy,
      remaining
    });
  },
  getTrolley() {
    return new Promise((resolve, reject) => {
      utils.getRequest(getCart, {
        merchantId: app.getMerchantId(),
        locationId: globalData.merchant.locationId,
        start:this.start,
        limit:this.limit
      }).then(({
        result
      }) => {
        // todo
        // result[0].price = 10.50;
        // for (let i = 0; i < 5; i++) {
        //   const obj = { ...result[0]
        //   }
        //   result = result.concat([obj])
        // }
        this.setData({
          trolley: result
        })
      }).catch(errorCode => {
        // getApp().failRequest();
        utils.errorHander(errorCode, this.getTrolley)
          .then(() => {
            resolve()
          })
          .catch(() => {
            reject()
          })
      })
    })
  },
  del(e) {
    const itemId = e.currentTarget.dataset.itemid;
    utils.postRequest({
      METHOD: 'DELETE',
      url: Api.removeCart,
      config: {
        merchantId: app.getMerchantId()
      },
      data: {
        itemId
      }
    }).then(data => {
      wx.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 2000
      });
      this.getTrolley();
    })
  },
  plusMinus(e) {
    const dataset = e.currentTarget.dataset;
    const index = dataset.index,
      type = dataset.type;
    const currentNum = this.data.trolley[index].quantity;
    const isMinus = (type === 'minus');
    if ((currentNum === 1) && isMinus) {
      return;
    }
    const num = isMinus ? (currentNum - 1) : (currentNum + 1);
    let currentMoney = num * this.data.trolley[index].price;
    let remaining = this.data.minAmount - currentMoney;
    remaining = utils.getFixedNum(remaining)
    const enableBuy = remaining <= 0;
    currentMoney = utils.getFixedNum(currentMoney);
    const trolley = this.data.trolley.map((item, ind) => {
      if (ind === index) {
        item.quantity = num;
      }
      return item;
    })
    this.setData({
      trolley,
      quantity: num,
      currentMoney,
      buyTxt: enableBuy ? '立即购买' : `还差￥${remaining}可购买`,
      enableBuy
    })
  },
  onReady: function() {

  },
  onShow: function() {
    this.getTrolley()
  },

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
    this.start -= this.limit;
    this.getTrolley();
  },
  onReachBottom: function() {
    this.start += this.limit;
    this.getTrolley();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})