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
    defImg: globalData.defaultImg,
    trolley: [],
    minAmount: 500,
    height: getApp().globalData.systemInfo.windowHeight > 960 ? getApp().globalData.systemInfo.windowHeight - (34 + 48) * 2 : 960,
    checkbox: 0,
    currentMoney: 0,
    hasOrders: true,
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
      globalData.items = this.data.trolley.reduce((accumulator, item) => {
        if (item.checked) {
          accumulator.push(item)
        }
        return accumulator;
      }, []);
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
  gotoSort() {
    wx.switchTab({
      url: '/pages/sort/sort',
    })
  },
  upper() {
    this.start = 0;
    this.getTrolley();
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
  setMoneyData(selectedRadio) {
    const currentMoney = this.getTotalPrice(selectedRadio)
    const remaining = 500 - currentMoney;
    const disableBuy = remaining > 0
    this.setData({
      checkbox: selectedRadio.length,
      currentMoney,
      disableBuy,
      remaining
    });
    this.selectedRadio = selectedRadio;
  },
  preventBubble(e) {
    const index = e.currentTarget.dataset.index;
    if (this.selectedRadio.includes(index)) {
      const ind = this.selectedRadio.indexOf(index);
      this.selectedRadio.splice(ind, 1);
      this.setData({
        checkAll: false
      })
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
      let buyAgainGoods = getApp().globalData.buyAgainGoods;
      if (buyAgainGoods.length) {
        this.start = 0;
      }
      utils.getRequest(getCart, {
        merchantId: app.getMerchantId(),
        locationId: getApp().globalData.merchant.locationId,
        start: this.start,
        limit: this.limit
      }).then(({
        result
      }) => {
        result = result.map(item => {
          if (item.putShelvesFlg && (this.data.checkAll || buyAgainGoods.includes(item.itemId))){
            item.checked = true
          }
          return item;
        })
        // result=[]
        const trolley = buyAgainGoods.length ? result: this.data.trolley.concat(result) ;
        this.setData({
          trolley,
          hasOrders: trolley.length
        });
        if(buyAgainGoods.length){
          this.setData({
            scrollTop:0
          })
        }
        getApp().globalData.buyAgainGoods = []
        resolve(result)
      }).catch(errorCode => {
        // getApp().failRequest();
        utils.errorHander(errorCode, this.getTrolley)
          .then(() => {
            resolve()
          })
          .catch(() => {
            this.setData({
              hasOrders: this.data.trolley.length
            });
            reject()
          })
      })
    })
  },
  del(e) {
    const dataset = e.currentTarget.dataset;
    const itemId = dataset.itemid;
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
      // this.getTrolley();
      const itemStr = `trolley[${dataset.index}].isRemoved`;
      this.setData({
        [itemStr]: true
      })
    })
  },
  plusMinus(e) {
    const dataset = e.currentTarget.dataset;
    const index = dataset.index,
      type = dataset.type;
    const currentTrolley = this.data.trolley[index];
    const currentNum = currentTrolley.quantity;
    const isMinus = (type === 'minus');
    if ((currentNum === 1) && isMinus) {
      return;
    }
    const num = isMinus ? (currentNum - 1) : (currentNum + 1);
    let currentMoney = num * currentTrolley.price;
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
    });
    utils
      .addToTrolley(currentTrolley.itemId, isMinus ? -1 : 1)
      .then(badge => {
        debugger;
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