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
  scrollDataLoading: false,
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
          if (item.items.length == 1){
            item.items[0].quantity = item.count
          }
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
    if (this.scrollDataLoading) {
      return
    }

  },
  lower() {
    this.start += this.limit;
    if (this.scrollDataLoading) return

  },
  getTotalPrice(selectedRadio) {
    return this.data.trolley.reduce((accumulator, item) => {
      if (selectedRadio.includes(item.groupId)) {
        return accumulator + item.suitePrice * item.count
      } else {
        return accumulator;
      }
    }, 0);
  },
  getTotalDiscountPrice(selectedRadio) {
    return this.data.trolley.reduce((accumulator, item) => {
      if (selectedRadio.includes(item.groupId)) {
        if (item.cartCombinationPromotions && item.cartCombinationPromotions.length > 0 && item.cartCombinationPromotions[0] && item.cartCombinationPromotions[0].promotionType == 2){
          return accumulator + item.cartCombinationPromotions[0].discountAmount
        } else{
          return accumulator
        }
        
      } else {
        return accumulator;
      }
    }, 0);
  },
  setMoneyData(selectedRadio) {
    let totalDiscountMoney = utils.getFixedNum(this.getTotalDiscountPrice(selectedRadio), 2);
    let overallMoney = this.getTotalPrice(selectedRadio)
    // utils.getFixedNum(Number(currentMoney) + Number(totalDiscountMoney), 2);
    let currentMoney = utils.getFixedNum(Number(overallMoney) - Number(totalDiscountMoney), 2);
    let remaining = 500 - currentMoney;
    const disableBuy = remaining > 0;
    remaining = utils.getFixedNum(remaining,2)
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

  callPromotionCacl(trollyList, i) {
    return new Promise((resolve, reject) => {
      let promises = []
      // for (let i = index; i < trollyList.length; i++){
        let itemGroups = []
        let group = {}
        
        let groupItems = []
        for (let j = 0; j < trollyList[i].items.length; j++){
          let item = {}
          item.itemId = trollyList[i].items[j].itemId
          item.brandId = ""
          item.categoryCode = trollyList[i].items[j].itemCategoryCode
          if (trollyList[i].combinationFlag){
            item.quantity = trollyList[i].items[j].quantity * trollyList[i].count
          }else{
            item.quantity = trollyList[i].items[j].quantity * trollyList[i].count
          }
          
          item.unitPrice = trollyList[i].items[j].price
          groupItems.push(item)
        }
      console.log(groupItems)
        group.groupId = trollyList[i].groupId
        group.items = groupItems
        if (trollyList[i].combinationFlag){
          group.promotions = trollyList[i].promotions
        }else{
          group.promotions = trollyList[i].cartCombinationPromotions
        }
        itemGroups.push(group)
        promises.push(promoteUtil.calcPromote({itemGroups}))
      // }
      Promise.all(promises)
      .then(arr => {
        trollyList[i].cartCombinationPromotions = arr
        resolve(trollyList[i])
      })
      .catch(()=>{
        reject()
      })
    })
  },

  getTrolley() {
    this.scrollDataLoading = true
    return new Promise((resolve, reject) => {
      utils.getRequest(getCart, {
        merchantId: app.getMerchantId(),
        locationId: getApp().globalData.merchant.locationId,
        start: this.start,
        limit: this.limit
      })
      .then((data) => {
        let result = data.result
        console.log(result)
        for(let i = 0; i<result.length; i++){
          result[i].items = result[i].items.map((item, index) => {
            if (/*item.putShelvesFlg &&*/ (this.data.checkAll || this.selectedRadio.includes(item.itemId))) {
              item.checked = true;
            } else {
              item.checked = false;
            }
            return item;
          });

          result[i].combinationFlag = result[i].items.length > 1 ? true : false
          result[i].suitePrice = this.getSuitePrice(result[i])
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

        setTimeout(() => {
          this.scrollDataLoading = false;
        }, 5000)
        resolve(result)
      }).catch(errorCode => {
        utils.errorHander(errorCode, this.getTrolley)
          .then(() => {
            setTimeout(() => {
              this.scrollDataLoading = false;
            }, 5000)
            resolve()
          })
          .catch(() => {
            this.setData({
              hasOrders: this.data.trolley.length
            });
            setTimeout(() => {
              this.scrollDataLoading = false;
            }, 5000)
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
  getSuitePrice(groupItem){
    let suitePrice = 0
    if (groupItem.combinationFlag) {
      for (let j = 0; j < groupItem.items.length; j++) {
        suitePrice += groupItem.items[j].price * groupItem.items[j].quantity
      }
    } else {
      if (groupItem.items.length > 0) {
        suitePrice = groupItem.items[0].price
      }
    }
    return suitePrice
  },

  plusMinus(e) {
    const dataset = e.currentTarget.dataset;
    if (!dataset.enabled) {
      return;
    }
    const index = dataset.index,
      type = dataset.type;
    const currentTrolley = this.data.trolley[index];
    const currentNum = currentTrolley.count;
    const isMinus = (type === 'minus');
    if ((currentNum === 1) && isMinus) {
      return;
    }
    const num = isMinus ? (currentNum - 1) : (currentNum + 1);

    const trolley = this.data.trolley.map((item, ind) => {
      if (ind === index) {
        item.count = num;
        //item.suitePrice = this.getSuitePrice(item);
      }
      return item;
    })
    if (currentTrolley.checked) {
      trolley[index].count = num
    } else {
      trolley[index].checked = true
      trolley[index].count = num
      this.selectedRadio.push(trolley[index].groupId);
    }
    //调用计算接口

    this.callPromotionCacl(trolley, index)
    .then((data) =>{
      trolley[index] = data
      console.log(data)
      var singleGroup = 'trolley[' + index + ']'
      this.setData({
        [singleGroup]: trolley[index]
      });
      this.setMoneyData(this.selectedRadio);
    })

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