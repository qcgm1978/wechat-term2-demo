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
      item.checked = this.data.checkAll
      if (this.data.checkAll) {
        if (!this.selectedRadio.includes(item.groupId))
          this.selectedRadio.push(item.groupId);
      } else {
        const ind = this.selectedRadio.indexOf(item.groupId);
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
      if (selectedRadio.includes(item.groupId)) {
        return accumulator + item.suitePrice * item.quantity
      } else {
        return accumulator;
      }
    }, 0);
  },
  getTotalDiscountPrice(selectedRadio) {
    return this.data.trolley.reduce((accumulator, item) => {
      if (selectedRadio.includes(item.groupId)) {
        return accumulator + item.discountAmount
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
    const groupId = e.currentTarget.dataset.groupid;
    if (this.selectedRadio.includes(groupId)) {
      const ind = this.selectedRadio.indexOf(groupId);
      if (ind !== -1) {
        this.selectedRadio.splice(ind, 1);
      }
      this.setData({
        checkAll: false
      });
    } else {
      if (!this.selectedRadio.includes(groupId)) {
        this.selectedRadio.push(groupId);
      }
    }
    this.setMoneyData(this.selectedRadio);
    const trolley = this.data.trolley.map((item, index) => {
      if (this.selectedRadio.includes(item.groupId)) {
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
        let postData = {
          // "itemGroups": [{
          //   "groupId": "A1",
          //   "items": [{
          //     "itemId": "4438",
          //     "brandId": "",
          //     "categoryCode": "1202010",
          //     "quantity": 20,
          //     "unitPrice": 100,
          //     "itemPromotions": [{
          //       "itemPromotionId": "15649"
          //     }]
          //   },
          //   {
          //     "itemId": "2103",
          //     "brandId": "",
          //     "categoryCode": "1202010",
          //     "quantity": 3,
          //     "unitPrice": 88,
          //     "itemPromotions": [{
          //       "itemPromotionId": "15760"
          //     }]
          //   },
          //   ],
          //   "promotions": [{
          //     "promotionId": "15780"
          //   }]
          // }
          // ]
        }

        let itemGroups = []
        let group = {}
        
        let groupItems = []
        for (let j = 0; j < trollyList[i].items.length; j++){
          let item = {}
          item.itemId = trollyList[i].items[j].itemId
          item.brandId = ""
          item.categoryCode = trollyList[i].items[j].itemCategoryCode
          item.quantity = trollyList[i].items[j].quantity
          item.unitPrice = trollyList[i].items[j].price
          groupItems.push(item)
        }

        group.groupId = trollyList[i].groupId
        group.items = groupItems
        group.promotions = trollyList[i].promotions
        itemGroups.push(group)
        promises.push(promoteUtil.calcPromote({itemGroups}))
      }
      Promise.all(promises)
      .then(arr => {
        for (let i = 0; i < trollyList.length; i++) {
          console.log(arr[i])
          if (JSON.stringify(arr[i]) !== "{}" && arr[i].freeGift){
            trollyList[i].items.push(arr[i].freeGift)
          } else if (JSON.stringify(arr[i]) !== "{}" && arr[i].discountAmount>0){
            trollyList[i].discountAmount = arr[i].discountAmount
          }else{
            // delete trollyList[i].promoteType
            console.log(trollyList[i])
          }
          
        }
        console.log(trollyList)
        resolve(trollyList)
      })
      .catch(()=>{
        reject()
      })
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
          let suitePrice = 0
          for (let j = 0; j < result[i].items.length;j++){
            if (!result[i].items[j].isfree){
              suitePrice += result[i].items[j].price * result[i].items[j].quantity
            }
          }
          result[i].suitePrice = suitePrice
          result[i].quantity = 1
          result[i].putShelvesFlg = true
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
    const groupId = dataset.groupid;
    let tempdata = {
        groupIds: [
          groupId
        ]
    }
    utils.postRequest({
        METHOD: 'DELETE',
        url: Api.removeCart,
        config: {
          merchantId: app.getMerchantId()
        },
        data: {
          groupIds: [
            groupId
          ]
        }
      }).then(data => {
        return new Promise((resolve, reject) => {
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
          });
          const index = this.selectedRadio.indexOf(groupId);
          if (index !== -1) {
            this.selectedRadio.splice(index, 1);
          }
          this.setMoneyData(this.selectedRadio);
          const trolley = this.data.trolley.reduce((accumulator, item) => {
            if (item.groupId !== groupId) {
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

    if (currentTrolley.checked) {
      this.setData({
        quantity: num,
        disableBuy
      })
    } else {
      let curItem = `trolley[${index}].checked`
      this.setData({
        [curItem]: true
      })
      this.selectedRadio.push(trolley[index].groupId);
    }


    let currentMoney = this.getTotalPrice(this.selectedRadio)
    let remaining = this.data.minAmount - currentMoney;
    remaining = utils.getFixedNum(remaining,2)
    const disableBuy = remaining > 0;
    currentMoney = utils.getFixedNum(currentMoney,2);
    let totalDiscountMoney = utils.getFixedNum(this.getTotalDiscountPrice(this.selectedRadio), 2);
    let overallMoney = utils.getFixedNum(Number(currentMoney) + Number(totalDiscountMoney), 2);
    if (currentTrolley.checked) {
      this.setData({
        // quantity: num,
        currentMoney,
        // disableBuy,
        remaining,
        totalDiscountMoney,
        overallMoney
      })
    }else{
      // let curItem = `trolley[${index}].checked`
      // this.setData({
      //   [curItem]:true
      // })
      // this.selectedRadio.push(trolley[index].groupId);
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