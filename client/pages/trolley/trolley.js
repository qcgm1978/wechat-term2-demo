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
      globalData.items.orderItemSource = 1;
      wx.navigateTo({
        url: `../order-confirm/order-confirm?total=${this.data.currentMoney}&quantity=${this.data.checkbox}`,
      });
    }

  },
  addOn() {
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  selectAll(e) {
    this.setData({
      checkAll: !this.data.checkAll
    });
    const trolley = this.data.trolley.map((item, index) => {
      item.putShelvesFlg && (item.checked = this.data.checkAll);
      this.data.checkAll && item.putShelvesFlg && this.selectedRadio.push(item.itemId);
      return item;
    });
    this.setMoneyData(this.selectedRadio)

    this.setData({
      trolley,
    })
  },
  gotoSort() {
    wx.switchTab({
      url: '/pages/home/home',
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
  getTotalPrice(selectedRadio) {
    return this.data.trolley.reduce((accumulator, item) => {
      if (selectedRadio.includes(item.itemId)) {
        return accumulator + item.price * item.quantity
      } else {
        return accumulator;
      }
    }, 0);
  },
  checkboxChange(e) {
    const checkbox = e.detail.value;
    this.setMoneyData(checkbox)
  },
  setMoneyData(selectedRadio) {
    let currentMoney = this.getTotalPrice(selectedRadio)
    let remaining = 500 - currentMoney;
    const disableBuy = remaining > 0;
    currentMoney = utils.getFixedNum(currentMoney);
    remaining = utils.getFixedNum(remaining)
    this.setData({
      checkbox: selectedRadio.length,
      currentMoney,
      disableBuy,
      remaining
    });
  },
  radioClick(e) {
    const itemId = e.currentTarget.dataset.itemid;
    if (this.selectedRadio.includes(itemId)) {
      const ind = this.selectedRadio.indexOf(itemId);
      this.selectedRadio.splice(ind, 1);
      this.setData({
        checkAll: false
      })
    } else {
      this.selectedRadio.push(itemId);
    }
    this.setMoneyData(this.selectedRadio);
    const trolley = this.data.trolley.map((item, index) => {
      if (item.putShelvesFlg && this.selectedRadio.includes(item.itemId)) {
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
        result = result.map((item, index) => {
          if (item.putShelvesFlg && (this.data.checkAll || this.selectedRadio.includes(item.itemId))) {
            item.checked = true;
          } else {
            item.checked = false;
          }
          return item;
        });

        // result=[]
        let trolley = []
        if (this.start === 0) {
          trolley = result;
        } else {
          trolley = this.data.trolley.concat(result);
        }
        this.setData({
          trolley,
          hasOrders: trolley.length
        });
        this.setMoneyData(this.selectedRadio);
        if (getApp().globalData.checkedTrolley.length) {
          this.setData({
            scrollTop: 0
          });
          getApp().globalData.checkedTrolley = [];
        }
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
          removeItems: [{
            itemId
          }]
        }
      }).then(data => {
        return new Promise((resolve, reject) => {
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
          });
          const index = this.selectedRadio.indexOf(itemId);
          if (index !== -1) {
            this.selectedRadio.splice(index, 1);
          }
          this.setMoneyData(this.selectedRadio);
          const trolley = this.data.trolley.reduce((accumulator, item) => {
            if (item.itemId !== itemId) {
              accumulator.push(item)
            }
            return accumulator;
          }, [])
          this.setData({
            trolley
          });
          utils.updateTrolleyNum({
            resolve,
            merchantId: getApp().getMerchantId()
          })
        })
      })
      .then(data => {
        // debugger;
      })
      .catch(err => {
        wx.showToast({
          title: '删除订单失败',
          icon: 'loading',
          duration: 2000
        })
      })
  },
  plusMinus(e) {
    const dataset = e.currentTarget.dataset;
    if (!dataset.enabled) {
      return;
    }
    const index = dataset.index,
      type = dataset.type;
    const currentTrolley = this.data.trolley[index];
    const currentNum = currentTrolley.quantity;
    const isMinus = (type === 'minus');
    if ((currentNum === 1) && isMinus) {
      return;
    }
    const num = isMinus ? (currentNum - 1) : (currentNum + 1);

    const trolley = this.data.trolley.map((item, ind) => {
      if (ind === index) {
        item.quantity = num;
      }
      return item;
    })
    this.setData({
      trolley,

    });
    let currentMoney = this.getTotalPrice(this.selectedRadio)
    let remaining = this.data.minAmount - currentMoney;
    remaining = utils.getFixedNum(remaining)
    const disableBuy = remaining > 0;
    currentMoney = utils.getFixedNum(currentMoney);
    if (currentTrolley.checked) {
      this.setData({
        quantity: num,
        currentMoney,
        // buyTxt: disableBuy ? `还差￥${remaining}可购买` : '立即购买',
        disableBuy,
        remaining
      })
    }
    utils
      .addToTrolley(currentTrolley.itemId, isMinus ? -1 : 1, currentTrolley.checked)
      .then(badge => {
        // debugger;
      })
  },
  onReady: function() {

  },
  onShow: function() {
    this.start = 0;
    this.selectedRadio = this.selectedRadio.concat(getApp().globalData.checkedTrolley);

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