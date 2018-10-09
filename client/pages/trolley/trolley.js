import utils from "../../utils/util.js";
import promoteUtil from "../../utils/promotion.js";
import {
  Api
} from '../../utils/envConf.js';
import {
  getRequest
} from '../../utils/util.js';
const getCart = Api.getCart;
const calcPromoteRule = Api.calcPromoteRule;
const app = getApp();
let globalData = app.globalData;
Page({
  data: {
    defImg: getApp().globalData.defaultImg,
    trolley: [],
    minAmount: 500,
    height: getApp().globalData.systemInfo.windowHeight > 960 ? getApp().globalData.systemInfo.windowHeight - (38 + 52) * 2 - 38 : 960,
    currentMoney: 0,
    hasOrders: true,
    disableBuy: true,
    checkAll: false,
    dataLoaded: false,
    totalDiscountMoney: 0,
    overallMoney: 0
  },
  selectedRadio: [],
  start: 0,
  limit: 20,
  enablePullDownRefresh: false,
  onLoad: function(options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
  },
  confirmOrder() {
    if (!this.data.disableBuy) {
      getApp().globalData.items = this.data.trolley.reduce((accumulator, item) => {
        if (item.checked) {
          accumulator.push(item)
        }
        return accumulator;
      }, []);
      getApp().globalData.items.orderItemSource = 1;
      wx.navigateTo({
        url: `../order-confirm/order-confirm?total=${this.data.currentMoney}`,
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
      if (this.data.checkAll && item.putShelvesFlg) {
        if (!this.selectedRadio.includes(item.itemId))
          this.selectedRadio.push(item.itemId);
      } else {
        const ind = this.selectedRadio.indexOf(item.itemId);
        if (ind !== -1) {
          this.selectedRadio.splice(ind, 1)
        }
      }
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
  getTotalDiscountPrice(selectedRadio) {
    return this.data.trolley.reduce((accumulator, item) => {
      if (selectedRadio.includes(item.itemId)) {
        return accumulator + item.discountAmount * item.quantity
      } else {
        return accumulator;
      }
    }, 0);
  },
  setMoneyData(selectedRadio) {
    let currentMoney = this.getTotalPrice(selectedRadio)
    let remaining = 500 - currentMoney;
    const disableBuy = remaining > 0;
    currentMoney = utils.getFixedNum(currentMoney,2);
    remaining = utils.getFixedNum(remaining,2)
    let totalDiscountMoney = utils.getFixedNum(this.getTotalDiscountPrice(selectedRadio), 2);
    let overallMoney = utils.getFixedNum(Number(currentMoney) + Number(totalDiscountMoney), 2);
    this.setData({
      currentMoney,
      disableBuy,
      remaining,
      selectedLen: selectedRadio.length,
      totalDiscountMoney,
      overallMoney
    });
  },
  radioClick(e) {
    const itemId = e.currentTarget.dataset.itemid;
    if (this.selectedRadio.includes(itemId)) {
      const ind = this.selectedRadio.indexOf(itemId);
      if (ind !== -1) {
        this.selectedRadio.splice(ind, 1);
      }
      this.setData({
        checkAll: false
      });
    } else {
      if (!this.selectedRadio.includes(itemId)) {
        this.selectedRadio.push(itemId);
      }
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
      checkAll: this.selectedRadio.length === trolley.length,
    })
  },
  turnPage(e) {
    const itemId = e.currentTarget.dataset.itemid;
    wx.navigateTo({
      url: `/pages/detail/detail?itemId=${itemId}`,
    })
  },

  addPromoteInfo(trollyList) {
    return new Promise((resolve, reject) => {
      let promises = []
      for (let i = 0; i < trollyList.length; i++){
        promises.push(promoteUtil.calcPromote())
      }
      Promise.all(promises)
      .then(arr => {
        for (let i = 0; i < trollyList.length; i++) {
          trollyList[i].items.push(arr[i].freeGift)
        }
        resolve(trollyList)
      })
      .catch(()=>{
        reject()
      })
      // promoteUtil.calcPromote()
      //   .then((promoteResult) => {
      //     //满赠
      //     if (promoteResult.freeGift) {
      //       promoteResult.freeGift.quantity = promoteResult.freeGift.minQuantity
      //       group.items.push(promoteResult.freeGift)
      //       resolve(group)
      //     } else if (promoteResult.discountAmount > 0) { //满减

      //     }
      //   })
      //   .catch(() => {
      //     reject()
      //   })
    })
  },
  getPromoteInfo(trollyList) {
    return new Promise((resolve, reject) => {
      let promises = []
      for (let i = 0; i < trollyList.length; i++) {
        promises.push(promoteUtil.getPromoteInfo(trollyList[i].items[0].itemId, trollyList[i].items[0].itemCategoryCode))
      }

      Promise.all(promises)
        .then(arr => {
          for (let i = 0; i < trollyList.length; i++) {
            if (arr.length > 0){
              trollyList[i].promoteName = arr[i].promotionName
              trollyList[i].promoteType = arr[i].promotionType
              trollyList[i].combinationFlag = arr[i].combinationFlag
            }
          }
          resolve(trollyList)
        })
        .catch(() => {
          reject()
        })
    })
  },
  getTrolley() {
    return new Promise((resolve, reject) => {
      utils.getRequest(getCart, {
        merchantId: app.getMerchantId(),
        locationId: getApp().globalData.merchant.locationId,
        start: this.start,
        limit: this.limit
      })
      .then((data) => {
        return this.addPromoteInfo(data.result)
      })
      .then((data) => {
        return this.getPromoteInfo(data)
      })
      .then((result) => {
        for(let i = 0; i<result.length; i++){
          result[i].items = result[i].items.map((item, index) => {
            if (/*item.putShelvesFlg &&*/ (this.data.checkAll || this.selectedRadio.includes(item.itemId))) {
              item.checked = true;
            } else {
              item.checked = false;
            }
            return item;
          });
        }

        let trolley = []
        if (this.start === 0) {
          trolley = result;
        } else {
          trolley = this.data.trolley.concat(result);
        }
        this.setData({
          trolley,
          hasOrders: trolley.length,
          checkAll: this.selectedRadio.length === trolley.length,
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
  promptDel(e){
    utils.showModel('您确定删除商品吗？').then(data=>{
      this.del(e)
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
    remaining = utils.getFixedNum(remaining,2)
    const disableBuy = remaining > 0;
    currentMoney = utils.getFixedNum(currentMoney,2);
    let totalDiscountMoney = utils.getFixedNum(this.getTotalDiscountPrice(this.selectedRadio), 2);
    let overallMoney = utils.getFixedNum(Number(currentMoney) + Number(totalDiscountMoney), 2);
    if (currentTrolley.checked) {
      this.setData({
        quantity: num,
        currentMoney,
        // buyTxt: disableBuy ? `还差￥${remaining}可购买` : '立即购买',
        disableBuy,
        remaining,
        totalDiscountMoney,
        overallMoney
      })
    }else{
      let curItem = `trolley[${index}].checked`
      this.setData({
        [curItem]:true
      })
      this.selectedRadio.push(trolley[index].itemId);
      this.setMoneyData(this.selectedRadio);
    }

    // utils
    //   .addToTrolley(currentTrolley.itemId, isMinus ? -1 : 1, false,false)
    //   .then(badge => {
    //     // debugger;
    //   })
  },
  onReady: function() {

  },
  onShow: function() {
    this.start = 0;
    if (getApp().globalData.toggleMerchant){
      this.selectedRadio=[];
      getApp().globalData.toggleMerchant=false;
    }
    getApp().globalData.checkedTrolley.map(item=>{
      if (!this.selectedRadio.includes(item)){
        this.selectedRadio.push(item)
      }
    });
    this.getTrolley()
    .then(data => {
      this.setData({
        dataLoaded: true
      })
    })
    .catch(e => {
      this.setData({
        dataLoaded: true
      })
    })
    utils.updateTrolleyNum();
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