import utils from "../../utils/util.js";
import promoteUtil from "../../utils/promotion.js";
import {
  Api
} from '../../utils/envConf.js';
import testData from 'data.js'
import {
  getRequest
} from '../../utils/util.js';
const getCart = Api.getCart;
const calcPromoteRule = Api.calcPromoteRule;
const getPromotionList = Api.getPromotionList
const app = getApp();
let globalData = app.globalData;
Page({
  data: {
    isSelecting: false,
    top: getApp().globalData.systemInfo.windowHeight - 600,
    promotionOptions: [],
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
  currentTrolleyIndex: 0,
  selectedRadio: [],
  start: 0,
  limit: 20,
  scrollDataLoading: false,
  enablePullDownRefresh: false,
  onLoad: function (options) {
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
            item.count = 1
          }
          accumulator.push(item)
        }
        return accumulator;
      }, []);
      getApp().globalData.items.orderItemSource = 1;
      wx.navigateTo({
        url: `../order-confirm/order-confirm?total=${this.data.currentMoney}&totalDiscount=${this.data.totalDiscountMoney}`,
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
      if (this.data.checkAll && item.putShelvesFlg) {
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
    // this.start += this.limit;
    if (this.scrollDataLoading) return

  },
  getTotalPrice(selectedRadio) {
    return this.data.trolley.reduce((accumulator, item) => {
      if (selectedRadio.includes(item.groupId)) {
        return accumulator + Number(item.suitePrice)
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
      checkAll: this.selectedRadio.length === trolley.filter(item => item.putShelvesFlg).length,
    })

  },
  turnPage(e) {
    const itemId = e.currentTarget.dataset.itemid;
    const itemCategoryCode = e.currentTarget.dataset.categorycode;
    wx.navigateTo({
      url: `/pages/detail/detail?itemId=${itemId}&categoryId=${itemCategoryCode}`,
    })
  },

  callPromotionCacl(trollyList, i) {
    return new Promise((resolve, reject) => {
      let promises = []
      let itemGroups = []
      let group = {}
      
      let groupItems = []
      for (let j = 0; j < trollyList[i].items.length; j++){
        let item = {}
        item.itemId = trollyList[i].items[j].itemId
        item.brandId = ""
        item.categoryCode = trollyList[i].items[j].itemCategoryCode
        item.quantity = trollyList[i].items[j].quantity * trollyList[i].count
        item.unitPrice = trollyList[i].items[j].price
        groupItems.push(item)
      }

      group.groupId = trollyList[i].groupId
      group.items = groupItems
      if (trollyList[i].combinationFlag){
        group.promotions = trollyList[i].promotions
      }else{
        group.promotions = trollyList[i].cartCombinationPromotions
      }
      itemGroups.push(group)
      promises.push(promoteUtil.calcPromote({itemGroups}))

      Promise.all(promises)
      .then(arr => {
        if (arr[0]){
          trollyList[i].cartCombinationPromotions = arr
        }else{
          trollyList[i].cartCombinationPromotions = null
        }
        resolve(trollyList[i])
      })
      .catch(()=>{
        reject()
      })
    })
  },

  getSuteTitle(orderGroup){
    let suiteTitle = "套装"

    if (orderGroup.cartCombinationPromotions && orderGroup.cartCombinationPromotions.length>0 && orderGroup.cartCombinationPromotions[0].combinationFlag == "0" && orderGroup.cartCombinationPromotions[0].promotionKind == "2"){
      console.log(orderGroup.cartCombinationPromotions[0])
      suiteTitle = orderGroup.cartCombinationPromotions[0].promotionType == "2"? "满减":"满赠"
    }
    console.log(suiteTitle)
    return suiteTitle
  },

  getTrolley() {

    let temdata = {
      merchantId: app.getMerchantId(),
      locationId: getApp().globalData.merchant ? getApp().globalData.merchant.locationId : "",
      start: this.start,
      limit: this.limit
    }
    // console.log(JSON.stringify(temdata))
    this.scrollDataLoading = true
    return new Promise((resolve, reject) => {
      utils.getRequest(getCart, {
        merchantId: app.getMerchantId(),
        locationId: getApp().globalData.merchant? getApp().globalData.merchant.locationId:"",
        start: this.start,
        limit: this.limit
      })
      .then((data) => {
        //let result = data.result
        let result = testData.testData
        if(result.length > 0){
          result.reverse()
        }
        console.log(JSON.stringify(result))
        for(let i = 0; i<result.length; i++){
          result[i].suiteTitle = this.getSuteTitle(result[i])
          result[i].putShelvesFlg = true
          result[i].items.map((item, index) => {
            if (!item.putShelvesFlg) {
              result[i].putShelvesFlg = false;
            }
            item.price = utils.getFixedNum(item.price, 2)
          });

          if (result[i].putShelvesFlg && (this.data.checkAll || this.selectedRadio.includes(result[i].groupId))) {
            result[i].checked = true;
          } else {
            result[i].checked = false;
          }
          result[i].combinationFlag = result[i].items.length > 1 ? true : false
          result[i].suitePrice = utils.getFixedNum(this.getSuitePrice(result[i]), 2);
          
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
          checkAll: this.selectedRadio.length === trolley.filter(item => item.putShelvesFlg).length,
        });
        this.setMoneyData(this.selectedRadio);

        if (getApp().globalData.checkedTrolley.length) {
          this.setData({
            scrollTop: 0
          });
          // getApp().globalData.checkedTrolley = [];
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
  promptDel(e) {
    utils.showModal('您确定删除商品吗？').then(data => {
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
        suitePrice = groupItem.items[0].price * groupItem.items[0].quantity
      }
    }
    return suitePrice
  },

  plusMinus(e) {
    const dataset = e.currentTarget.dataset;
    console.log(dataset)
    if (!dataset.enabled) {
      return;
    }
    const index = dataset.index,
      type = dataset.type;
    const currentTrolley = this.data.trolley[index];
    // const currentNum = currentTrolley.count;
    const currentNum = currentTrolley.items.find(item => item.itemId === dataset.itemid).quantity;
    console.log(currentNum)
    const isMinus = (type === 'minus');
    if ((currentNum === 1) && isMinus) {
      return;
    }
    const num = isMinus ? (currentNum - 1) : (currentNum + 1);

    const trolley = this.data.trolley.map((item, ind) => {
      if (ind === index) {
        //item.count = num;
        item.items.find(item => item.itemId === dataset.itemid).quantity = num
        item.suitePrice = this.getSuitePrice(item);
      }
      return item;
    })

    if (trolley[index].checked) {
    } else {
      trolley[index].checked = true
      this.selectedRadio.push(trolley[index].groupId);
    }

    this.setData({
      trolley
    })

    this.setMoneyData(this.selectedRadio);
    //this.updateTrolley(trolley, index, isMinus ? -1 : 1)

    //调用计算接口
    // this.callPromotionCacl(trolley, index)
    // .then((data) =>{
    //   trolley[index] = data
    //   var singleGroup = 'trolley[' + index + ']'
    //   this.setData({
    //     [singleGroup]: trolley[index]
    //   });
    //   this.setMoneyData(this.selectedRadio);
    // })
    // for (let i = 0; i < trolley[index].items.length; i++){
    //   trolley[index].items[i].categoryCode = trolley[index].items[i].itemCategoryCode
    // }

    // let para = {
    //   addGroupList: [{
    //     count: isMinus ? -1 : 1,
    //     addItemList: trolley[index].items,
    //   }]
    // }

    // utils
    //   .addToTrolleyByGroup(para)
    //   .then(badge => {
    //     utils.updateTrolleyNum();
    //   })
  },
  onReady: function () {

  },
  onShow: function () {
    this.start = 0;
    if (getApp().globalData.toggleMerchant) {
      this.selectedRadio = [];
      getApp().globalData.toggleMerchant = false;
    }


    this.getTrolley()
      .then(data => {
        getApp().globalData.checkedTrolley.map(item => {
          for (let i = 0; i < item.addGroupList[0].addItemList.length; i++){
            for (let j = 0; j < this.data.trolley.length; j++){
              for (let k = 0; k < this.data.trolley[j].items.length; k++){
                if (item.addGroupList[0].addItemList[i].itemId == this.data.trolley[j].items[k].itemId && item.addGroupList[0].addItemList[i].quantity == this.data.trolley[j].items[k].quantity && item.addGroupList[0].addItemList[i].categoryCode == this.data.trolley[j].items[k].itemCategoryCode) {
                  if (!this.selectedRadio.includes(this.data.trolley[j].groupId)) {
                    let currentTrolley = "trolley[" + j + "].checked"
                    this.setData({
                      [currentTrolley]: true
                    })
                    this.selectedRadio.push(this.data.trolley[j].groupId)
                    this.setMoneyData(this.selectedRadio)
                  }
                }
              }
            }
          }

        });
        getApp().globalData.checkedTrolley = [];
        this.setData({
          dataLoaded: true
        })
        this.setMoneyData(this.selectedRadio)

        const trolley = this.data.trolley.map((item, index) => {
          if (this.selectedRadio.includes(item.groupId)) {
            item.checked = true;
          } else {
            item.checked = false;
          }
          return item;
        });
        this.setData({
          trolley
        })
      })
      .catch(e => {
        getApp().globalData.checkedTrolley = [];
        this.setData({
          dataLoaded: true
        })
        this.setMoneyData(this.selectedRadio)
      })
    utils.updateTrolleyNum();
    utils.checkNetwork().then(utils.requestStatisLoad);
    this.setMoneyData(this.selectedRadio)
  },

  onHide() {
    utils.requestStatisUnload();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  selectPromotion: function (e) {
    const index = e.currentTarget.dataset.index;
    for (let i = 0; i < this.data.promotionOptions.length; i++){
      let prop = "promotionOptions[" + i +"].checked"
      this.setData({
        [prop]: false
      })
    }
    let prop = "promotionOptions[" + index + "].checked"
    this.setData({
      [prop]: true
    })
    if (trollyList[i].combinationFlag) {
      trollyList[this.currentTrolleyIndex].promotions = [this.data.promotionOptions[index]]
    } else {
      trollyList[this.currentTrolleyIndex].cartCombinationPromotions = [this.data.promotionOptions[index]]
    }
    this.updateTrolley(trollyList, this.currentTrolleyIndex, 0)
  },

  closePopup() {
    this.setData({
      isSelecting: false,
    })
  },
  showPromotions(e) {
    let selectedGroup = this.data.trolley.find(item => {
      return (item.groupId == e.currentTarget.dataset.groupid)
    })
    this.currentTrolleyIndex = this.data.trolley.indexOf(selectedGroup)
    // this.getPromotionList(selectedGroup)
    // .then((data) => {
    //   this.setData({
    //     isSelecting: true,
    //     promotionOptions: selectedGroup.cartSelectPromotions
    //   })
    //   if (selectedGroup.cartCombinationPromotions[0].combinationFlag == 0 && selectedGroup.cartCombinationPromotions[0].promotionKind == 1) {
    //     let prop = "promotionOptions[0].checked"
    //     this.setData({
    //       [prop]: true
    //     })
    //   } else {
    //     let defaultPromotionOption = this.data.promotionOptions.find(item => item.promotionId === selectedGroup.cartCombinationPromotions[0].promotionId)
    //     let index = this.data.promotionOptions.indexOf(defaultPromotionOption)
    //     if (index >= 0) {
    //       let prop = "promotionOptions[" + index + "].checked"
    //       this.setData({
    //         [prop]: true
    //       })
    //     }
    //   }
    // })
    // .catch((e) => {})
    
    this.setData({
        isSelecting: true,
        promotionOptions: selectedGroup.cartSelectPromotions
      })
      if (selectedGroup.cartCombinationPromotions[0].combinationFlag == 0 && selectedGroup.cartCombinationPromotions[0].promotionKind == 1) {
        let prop = "promotionOptions[0].checked"
        this.setData({
          [prop]: true
        })
      } else {
        let defaultPromotionOption = this.data.promotionOptions.find(item => item.promotionId === selectedGroup.cartCombinationPromotions[0].promotionId)
        let index = this.data.promotionOptions.indexOf(defaultPromotionOption)
        if (index >= 0) {
          let prop = "promotionOptions[" + index + "].checked"
          this.setData({
            [prop]: true
          })
        }
      }
  },

  updateTrolley(trolley, index, count){
    this.callPromotionCacl(trolley, index)
      .then((data) => {
        trolley[index] = data
        var singleGroup = 'trolley[' + index + ']'
        this.setData({
          [singleGroup]: trolley[index]
        });
        this.setMoneyData(this.selectedRadio);
      })
    for (let i = 0; i < trolley[index].items.length; i++) {
      trolley[index].items[i].categoryCode = trolley[index].items[i].itemCategoryCode
      trolley[index].items[i].quantity = trolley[index].items[i].quantity * count
    }

    let para = {
      addGroupList: [{
        count,
        addItemList: trolley[index].items,
      }]
    }

    utils
      .addToTrolleyByGroup(para)
      .then(badge => {
        utils.updateTrolleyNum();
      })
  },

  getPromotionList() {
    return new Promise((resolve, reject) => {
      utils.getRequest(getPromotionList, {

      })
        .then((data) => {
          this.setData({
            promotionOptions: data.result
          })
        }).catch((e) => {

        })
    })
  }
})