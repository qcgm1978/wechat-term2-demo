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
    top: getApp().globalData.systemInfo.deviceWindowHeight - (34 + 142) * 2 - 180 - 374,
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
  limit: 1000,
  upperEnable: true,
  lowerEnable: true,
  noMoreData: false,
  scrollDataLoading: false,
  scrollViewY: 0,
  enablePullDownRefresh: false,
  onLoad: function(options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
  },
  confirmOrder() {
    if (utils.disbaleOperation()) {
      return
    }
    if (!this.data.disableBuy) {
      getApp().globalData.items = this.data.trolley.reduce((accumulator, item) => {
        if (item.checked && item.putShelvesFlg) {
          item.count = 1
          accumulator.push(item)
        }
        return accumulator;
      }, []);
      getApp().globalData.items.orderItemSource = 1;
      utils.buyTrolley({
        eventDetail: {
          items: getApp().globalData.items.reduce((accumulator, group) =>
            accumulator.concat(group.items.map(item => ({ ...item,
              itemPro: ''
            }))), [])
        }
      })
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
  upper() {},
  lower() {
    // if (!this.lowerEnable || this.scrollDataLoading) {
    //   return
    // }
    // setTimeout(() => {
    //   this.lowerEnable = true
    // }, 2000)
    // this.lowerEnable = false
    // this.start += this.limit;

    // this.getTrolley()
    //   .then((data) => {})
    //   .catch((e) => {})
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
        if (item.cartCombinationPromotions && item.cartCombinationPromotions.length > 0 && item.cartCombinationPromotions[0] && item.cartCombinationPromotions[0].promotionType == 2) {
          let totalDiscount = item.cartCombinationPromotions[0].discountAmount ? item.cartCombinationPromotions[0].discountAmount : 0
          return accumulator + totalDiscount
        } else {
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

    remaining = utils.getFixedNum(remaining, 2)

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
      for (let j = 0; j < trollyList[i].items.length; j++) {
        let item = {}
        item.itemId = trollyList[i].items[j].itemId
        item.brandId = ""
        item.categoryCode = trollyList[i].items[j].itemCategoryCode
        item.quantity = trollyList[i].items[j].quantity * (trollyList[i].count ? trollyList[i].count : 1)
        item.unitPrice = trollyList[i].items[j].price
        groupItems.push(item)
      }

      group.groupId = trollyList[i].groupId
      group.items = groupItems
      if (trollyList[i].combinationFlag) {
        group.promotions = trollyList[i].promotions
      } else {
        group.items[0].itemPromotions = trollyList[i].cartCombinationPromotions
        if (group.items[0].itemPromotions && group.items[0].itemPromotions.length > 0 && group.items[0].itemPromotions[0]) {
          group.items[0].itemPromotions[0].itemPromotionId = group.items[0].itemPromotions[0].promotionId
        }
      }
      itemGroups.push(group)
      promises.push(promoteUtil.calcPromote({
        itemGroups
      }))

      Promise.all(promises)
        .then(arr => {
          if (arr[0]) {
            trollyList[i].cartCombinationPromotions = arr
          } else {
            trollyList[i].cartCombinationPromotions = null
          }
          resolve(trollyList[i])
        })
        .catch(() => {
          reject()
        })
    })
  },


  getSuteTitle(orderGroup) {
    if (!orderGroup) {
      return ""
    }
    if (orderGroup.suiteTitle && orderGroup.suiteTitle !== "套装") {
      return orderGroup.suiteTitle
    }
    let suiteTitle = "套装"
    if (orderGroup.cartCombinationPromotions && orderGroup.cartCombinationPromotions.length > 0 && (orderGroup.cartCombinationPromotions[0].combinationFlag == "0" || orderGroup.cartCombinationPromotions[0].combinationFlag == 0) && (orderGroup.cartCombinationPromotions[0].promotionKind == "2" || orderGroup.cartCombinationPromotions[0].promotionKind == "1")) {

      suiteTitle = orderGroup.cartCombinationPromotions[0].promotionType == "2" ? "满减" : "满赠"
    }
    return suiteTitle
  },

  removeKindPromotionForSingleProduct(trolleyGroup) {
    if (!trolleyGroup.promotions || !trolleyGroup.promotions[0] || !trolleyGroup.promotions[0].promotionId) {
      if (trolleyGroup.cartCombinationPromotions && trolleyGroup.cartCombinationPromotions.length > 0 && trolleyGroup.cartCombinationPromotions[0]) {
        if (trolleyGroup.cartCombinationPromotions[0].promotionKind == "2") {
          trolleyGroup.cartCombinationPromotions = null
        }
      }
    }
  },

  adjustCartCombinationPromotions1(trolleyGroup, index) {
    if (trolleyGroup && trolleyGroup.promotions && trolleyGroup.promotions.length > 0 && trolleyGroup.cartCombinationPromotions && trolleyGroup.cartCombinationPromotions.length > 0) {
      let rightPromotion = null
      if (trolleyGroup.promotions && trolleyGroup.promotions.length > 0 && trolleyGroup.promotions[0] && trolleyGroup.promotions[0].promotionId) {
        rightPromotion = trolleyGroup.cartCombinationPromotions.find(item => item.promotionId === trolleyGroup.promotions[0].promotionId)
      } else {
        rightPromotion = trolleyGroup.cartCombinationPromotions[0]
      }
      if (rightPromotion /*&& rightPromotion.activeFlg*/ ) {
        trolleyGroup.cartCombinationPromotions[0] = rightPromotion
      } else {
        trolleyGroup.cartCombinationPromotions = null
      }
    }
    if (trolleyGroup.items.length == 1 && trolleyGroup.cartCombinationPromotions == null) {
      this.getPromotionList(trolleyGroup)
        .then((data) => {
          let rightPromotion = null
          if (trolleyGroup.promotions && trolleyGroup.promotions.length > 0 && trolleyGroup.promotions[0] && trolleyGroup.promotions[0].promotionId) {
            rightPromotion = data.result[0].promotions.find(item => item.promotionId === trolleyGroup.promotions[0].promotionId)
          } else {
            rightPromotion = data.result[0].promotions[0]
          }

          trolleyGroup.cartCombinationPromotions = [rightPromotion]
          this.removeKindPromotionForSingleProduct(trolleyGroup)
          trolleyGroup.promotions = [rightPromotion]
          let suiteTitle = "trolley[" + index + "].suiteTitle"
          let cartCombinationPromotions = "trolley[" + index + "].cartCombinationPromotions"
          this.setData({
            [cartCombinationPromotions]: [rightPromotion]
          })
          this.setData({
            [suiteTitle]: this.getSuteTitle(this.data.trolley[index]),
          })
        })
        .catch((e) => {})

    } else {
      let suiteTitle = "trolley[" + index + "].suiteTitle"
      trolleyGroup.suiteTitle = this.getSuteTitle(trolleyGroup)
      this.removeKindPromotionForSingleProduct(trolleyGroup)
    }
  },

  adjustCartCombinationPromotions(trolleyGroup, index) {
    return new Promise((resolve, reject) => {
      if (trolleyGroup && trolleyGroup.promotions && trolleyGroup.promotions.length > 0 && trolleyGroup.cartCombinationPromotions && trolleyGroup.cartCombinationPromotions.length > 0) {
        let rightPromotion = trolleyGroup.cartCombinationPromotions.find(item => item.promotionId === trolleyGroup.promotions[0].promotionId)
        if (rightPromotion /*&& rightPromotion.activeFlg*/ ) {
          trolleyGroup.cartCombinationPromotions[0] = rightPromotion
        } else {
          trolleyGroup.cartCombinationPromotions = null
        }
      }

      if (trolleyGroup.items.length == 1 && trolleyGroup.cartCombinationPromotions == null) {
        this.getPromotionList(trolleyGroup)
          .then((data) => {
            //trolleyGroup.suiteTitle = this.getSuteTitle(this.data.trolley[index])
            if (data.result && data.result.length > 0 && data.result[0]) {
              trolleyGroup.cartCombinationPromotions = data.result[0].promotions
              trolleyGroup.items[0].promotions = []
              trolleyGroup.items[0].promotions.push(data.result[0].promotions[0])
            } else {

            }

            resolve(trolleyGroup)
          })
          .catch((e) => {
            console.log(e)
            reject(e)
          })

      } else {
        let suiteTitle = "trolley[" + index + "].suiteTitle"
        //trolleyGroup.suiteTitle = this.getSuteTitle(trolleyGroup)
        resolve(trolleyGroup)
      }
    })
  },

  calcPromotionInfo(data) {
    return new Promise((resolve, reject) => {
      let trolley = data.result
      let promises = []
      for (let i = 0; i < trolley.length; i++) {
        if (trolley[i].items.length == 1) {
          promises.push(this.callPromotionCacl(trolley, i))
        }
      }
      Promise.all(promises)
        .then((result) => {
          resolve(data)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },

  fillPromotionInfo(data) {
    return new Promise((resolve, reject) => {
      let trolley = data.result
      let promises = []
      for (let i = 0; i < trolley.length; i++) {
        promises.push(this.adjustCartCombinationPromotions(trolley[i], i))
      }
      Promise.all(promises)
        .then((result) => {
          data.result = result
          resolve(data)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },

  getTrolley(adjustResult = false) {

    let temdata = {
      merchantId: app.getMerchantId(),
      locationId: getApp().globalData.merchant ? getApp().globalData.merchant.locationId : "",
      start: this.start,
      limit: this.limit
    }

    this.scrollDataLoading = true
    return new Promise((resolve, reject) => {
      utils.getRequest(getCart, {
          merchantId: app.getMerchantId(),
          locationId: getApp().globalData.merchant ? getApp().globalData.merchant.locationId : "",
          start: this.start,
          limit: this.limit
        })
        .then((data) => {
          if (adjustResult) {
            return this.fillPromotionInfo(data)
          } else {
            return data
          }
        })
        .then((data) => {
          if (adjustResult) {
            return this.calcPromotionInfo(data)
          } else {
            return data
          }
        })
        .then((data) => {
          let result = data.result
          if (result && result.length < this.limit) {
            this.noMoreData = true
          }
          for (let i = 0; i < result.length; i++) {
            this.adjustCartCombinationPromotions1(result[i], i)
            result[i].putShelvesFlg = true
            result[i].items.map((item, index) => {
              if (!item.putShelvesFlg) {
                result[i].putShelvesFlg = false;
              }
              item.price = utils.getFixedNum(item.price, 2)
            });
            if (result[i].cartCombinationPromotions && result[i].cartCombinationPromotions.length > 0 && result[i].cartCombinationPromotions[0] && result[i].cartCombinationPromotions[0].activeFlg == false) {
              result[i].putShelvesFlg = false
            }
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

          //if (getApp().globalData.checkedTrolley.length) {
          this.setData({
            scrollTop: this.scrollViewY
          });
          // getApp().globalData.checkedTrolley = [];
          //}

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
  getSuitePrice(groupItem) {
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
    if (!dataset.enabled) {
      return;
    }
    const index = dataset.index,
      type = dataset.type;
    const currentTrolley = this.data.trolley[index];
    const currentNum = currentTrolley.items.find(item => item.itemId === dataset.itemid).quantity;
    const isMinus = (type === 'minus');
    if ((currentNum === 1) && isMinus) {
      return;
    }
    const num = e.detail.value ? e.detail.value:(isMinus ? (currentNum - 1) : (currentNum + 1));

    const trolley = this.data.trolley.map((item, ind) => {
      if (ind === index) {
        //item.count = num;
        item.items.find(item => item.itemId === dataset.itemid).quantity = num
        item.suitePrice = this.getSuitePrice(item);
      }
      return item;
    })

    if (trolley[index].checked) {} else {
      trolley[index].checked = true
      this.selectedRadio.push(trolley[index].groupId);
    }

    this.setData({
      trolley
    })

    let itemIndex = currentTrolley.items.findIndex(item => item.itemId === dataset.itemid)
    const skuQuantity = e.detail.value ? e.detail.value:(isMinus ? -1 : 1)
    this.updateTrolley(trolley, index, skuQuantity, itemIndex)
      .then((para) => {
        return utils.addToTrolleyByGroup(para)
      })
      .then(badge => {
        utils.updateTrolleyNum();
        this.start = 0
        this.getTrolley()
          .then((data) => {})
          .catch((e) => {})
      })
  },
  onReady: function() {

  },
  onShow: function() {
    this.start = 0;
    if (getApp().globalData.toggleMerchant) {
      this.selectedRadio = [];
      getApp().globalData.toggleMerchant = false;
    }


    this.getTrolley(true)
      .then(data => {
        getApp().globalData.checkedTrolley.map(item => {
          for (let i = 0; i < item.addGroupList[0].addItemList.length; i++) {
            for (let j = 0; j < this.data.trolley.length; j++) {
              for (let k = 0; k < this.data.trolley[j].items.length; k++) {
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

  },
  selectPromotion: function(e) {
    const index = e.currentTarget.dataset.index;
    for (let i = 0; i < this.data.promotionOptions.length; i++) {
      let prop = "promotionOptions[" + i + "].checked"
      this.setData({
        [prop]: false
      })
    }
    let prop = "promotionOptions[" + index + "].checked"
    this.setData({
      [prop]: true
    })
    this.closePopup()
  },

  closePopup() {
    this.setData({
      isSelecting: false,
    })
    let currentPromotion = this.data.promotionOptions.find(item => {
      return (item.checked == true)
    })

    let trolleyItemPromotions = "trolley[" + this.currentTrolleyIndex + "].promotions"
    let trolleyItemCartCombinationPromotions = "trolley[" + this.currentTrolleyIndex + "].cartCombinationPromotions"
    let tempPromotion = this.data.trolley[this.currentTrolleyIndex].cartCombinationPromotions[0]

    this.setData({
      [trolleyItemPromotions]: [currentPromotion],
      [trolleyItemCartCombinationPromotions]: [currentPromotion],
    })
    this.updateTrolley(this.data.trolley, this.currentTrolleyIndex, 0)
      .then((para) => {
        return utils.addToTrolleyByGroup(para)
      })
      .then(data => {
        this.start = 0
        this.getTrolley()
          .then((data) => {})
          .catch((e) => {})
      })
  },


  compare(obj1, obj2) {
    var val1 = obj1.promotionId;
    var val2 = obj2.promotionId;
    return val1 - val2
  },


  showPromotions(e) {
    let selectedGroup = this.data.trolley.find(item => {
      return (item.groupId == e.currentTarget.dataset.groupid)
    })
    this.currentTrolleyIndex = this.data.trolley.indexOf(selectedGroup)
    this.getPromotionList(selectedGroup)
      .then((data) => {
        for (let i = 0; i < data.result.length; i++) {
          data.result[i].promotions.sort(this.compare)
        }
        this.setData({
          isSelecting: true,
          promotionOptions: data.result[0].promotions
        })

        let defaultPromotionOption = data.result[0].promotions.find(item => item.promotionId === selectedGroup.cartCombinationPromotions[0].promotionId)

        let index = data.result[0].promotions.indexOf(defaultPromotionOption)
        if (index >= 0) {
          let prop = "promotionOptions[" + index + "].checked"
          this.setData({
            [prop]: true
          })
        }

      })
      .catch((e) => {})
  },

  updateTrolley(trolley, index, count, itemIndex) {
    return new Promise((resolve, reject) => {
      if (arguments.length == 4) {
        for (let i = 0; i < trolley[index].items.length; i++) {
          trolley[index].items[i].categoryCode = trolley[index].items[i].itemCategoryCode
          if (itemIndex == i) {
            trolley[index].items[i].quantity = count
          } else {
            trolley[index].items[i].quantity = 0
          }
        }
      } else {
        for (let i = 0; i < trolley[index].items.length; i++) {
          trolley[index].items[i].categoryCode = trolley[index].items[i].itemCategoryCode
          trolley[index].items[i].quantity = count
        }
      }

      let para = {
        addGroupList: [{
          count: 1,
          groupId: trolley[index].groupId,
          promotions: trolley[index].promotions ? trolley[index].promotions : trolley[index].cartCombinationPromotions,
          addItemList: trolley[index].items,
        }]
      }
      resolve(para)
    })
  },

  getPromotionList(selectedGroup) {
    return new Promise((resolve, reject) => {
      let categoryCodes = "";
      let itemIds = "";
      // 单品促销：combinationFlag = 0   promotionKind = 1
      // 单品 + 单品组合促销：combinationFlag = 1 promotionKind = 1
      // 单品类促销：combinationFlag = 0   promotionKind = 2
      // 单品类 + 单品类组合促销：combinationFlag = 1   promotionKind = 2
      if (selectedGroup.cartCombinationPromotions && selectedGroup.cartCombinationPromotions.length > 0 && selectedGroup.cartCombinationPromotions[0]) {
        if (selectedGroup.cartCombinationPromotions[0].combinationFlag == "0" && selectedGroup.cartCombinationPromotions[0].promotionKind == "1") {
          itemIds = selectedGroup.items.reduce((accumulator, item, index) => {
            if (index == 0) {
              accumulator = accumulator + (item.itemId);
            } else {
              accumulator = accumulator + "," + (item.itemId);
            }
            return accumulator
          }, "")
        } else if (selectedGroup.cartCombinationPromotions[0].combinationFlag == "1" && selectedGroup.cartCombinationPromotions[0].promotionKind == "1") {
          itemIds = selectedGroup.items.reduce((accumulator, item, index) => {
            if (index == 0) {
              accumulator = accumulator + (item.itemId);
            } else {
              accumulator = accumulator + "," + (item.itemId);
            }
            return accumulator
          }, "")
        } else if (selectedGroup.cartCombinationPromotions[0].combinationFlag == "0" && selectedGroup.cartCombinationPromotions[0].promotionKind == "2") {
          categoryCodes = selectedGroup.items.reduce((accumulator, item, index) => {
            if (accumulator.indexOf(item.itemCategoryCode) == -1) {
              if (index == 0) {
                accumulator = accumulator + (item.itemCategoryCode);
              } else {
                accumulator = accumulator + "," + (item.itemCategoryCode);
              }
            }
            return accumulator
          }, "")
        } else if (selectedGroup.cartCombinationPromotions[0].combinationFlag == "1" && selectedGroup.cartCombinationPromotions[0].promotionKind == "2") {
          categoryCodes = selectedGroup.items.reduce((accumulator, item, index) => {
            if (accumulator.indexOf(item.itemCategoryCode) == -1) {
              if (index == 0) {
                accumulator = accumulator + (item.itemCategoryCode);
              } else {
                accumulator = accumulator + "," + (item.itemCategoryCode);
              }
            }
            return accumulator
          }, "")
        }
      } else {
        itemIds = selectedGroup.items[0].itemId
      }


      let postData = {
        itemGroups: [{
          categoryCodes,
          groupId: selectedGroup.groupId,
          itemIds
        }],
        merchantId: app.getMerchantId(),
        locationId: getApp().globalData.merchant ? getApp().globalData.merchant.locationId : "",
      }
      return utils.postRequest({
          url: getPromotionList,
          config: {
            merchantId: app.getMerchantId()
          },
          data: postData
        })
        .then((data) => {
          for (let i = 0; i < data.result.length; i++) {
            data.result[i].promotions.sort(this.compare)
          }
          resolve(data)
        }).catch((e) => {
          reject(e)
        })
    })
  },
  scroll(event) {
    this.scrollViewY = event.detail.scrollTop
  },
  bindinput() {
    // debugger
  },
  preventBubble() {
    // debugger
  },
  bindblur(e){
    this.plusMinus(e)
  }
})