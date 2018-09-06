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
    disableBuy: true,
    checkAll: false,
  },
  selectedRadio: [],
  start: 0,
  limit: 20,
  enablePullDownRefresh: false,
  onLoad: function(options) {},
  confirmOrder() {
    if (!this.data.disableBuy) {
      globalData.items = this.data.trolley.reduce((accumulator,item)=>{
        if(item.checked){
          accumulator.push(item)
        }
        return accumulator;
      },[]);
      wx.navigateTo({
        url: `../order-confirm/order-confirm?total=${this.data.currentMoney}&quantity=${this.data.checkbox}`,
      });
    }

  },
  addOn() {
    wx.switchTab({
      url: '/pages/sort/sort',
    })
  },
  selectAll(e) {
    this.setData({
      checkAll: !this.data.checkAll
    });
    const checkbox = []
    const trolley = this.data.trolley.map((item, index) => {
      item.putShelvesFlg && (item.checked = this.data.checkAll);
      this.data.checkAll && item.putShelvesFlg && checkbox.push(index);
      return item;
    });
    this.setMoneyData(checkbox)

    this.setData({
      trolley,
    })
  },
  upper() {
    // if (this.enablePullDownRefresh) {
    //   this.start -= this.limit;
    //   this.getTrolley();
    // }
  },
  lower() {
    this.start += this.limit;
    this.getTrolley().then(data => {
      // setTimeout(()=>{
      //   this.enablePullDownRefresh=true;
      // },2000)
    });
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
  preventBubble(e) {
    const index = e.currentTarget.dataset.index;
    if (this.selectedRadio.includes(index)) {
      const ind = this.selectedRadio.indexOf(index);
      this.selectedRadio.splice(ind, 1);
    } else {
      this.selectedRadio.push(index);
    }
    this.setMoneyData(this.selectedRadio);
    const trolley = this.data.trolley.map((item, index) => {
      if (item.putShelvesFlg && this.selectedRadio.includes(index)) {
        item.checked = true;
      } else {
        item.checked = false;
      }
      return item;
    });

    this.setData({
      trolley,
    })
  },
  turnPage(e) {
    const itemId = e.currentTarget.dataset.itemid;
    wx.navigateTo({
      url: `/pages/detail/detail?itemId=${itemId}`,
    })
  },
  getTrolley() {
    return new Promise((resolve, reject) => {
      utils.getRequest(getCart, {
        merchantId: app.getMerchantId(),
        locationId: getApp().globalData.merchant.locationId,
        start: this.start,
        limit: this.limit
      }).then(({
        result
      }) => {
        if (this.data.checkAll) {
          result = result.map(item => {
            item.putShelvesFlg && (item.checked = true);
            return item;
          })
        }
        this.setData({
          trolley: this.data.trolley.concat(result)
        });
        resolve(result)
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

  },
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})