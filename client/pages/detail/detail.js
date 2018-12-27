import utils from "../../utils/util.js";
const app = getApp();
const globalData = app.globalData;
import promoteUtil from "../../utils/promotion.js";
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem,
  getRelated = Api.getRelated,
  calcPromote = Api.calcPromote,
  calcAmount = Api.calcAmount,
  getPromoteInfo = Api.getPromoteInfo;

Page({
  data: {
    currentMoney: 0,
    totalMoney: 0,
    discountAmount: 0,
    badge: 0,
    quantity: 1,
    product: {},
    enableBuy: false,
    promotion: false,
    isSelecting: false,
    hasPromotion: false,
    unionPromotion: false,
    promoteInfo: {},
    promoteInfoList: [],
    autoplay: true,
    interval: 3000,
    duration: 1000,
    minAmount: 500,
    top: 0,
    defImg: getApp().globalData.defaultImg,
    buyTxt: '立即购买',
    specificationList: [{
      specification: '',
      num: 1

    }, ],
    icon: '../../images/trolley-full.png',
    imgManjian: "../../images/manjian.png",
    imgManzeng: "../../images/manzeng.png",
  },
  relatedChange(e) {},
  showPromotion(e) {
    const index = e.currentTarget.dataset.index
    const isKind = e.currentTarget.dataset.isKind
    if (!this.data.product.putShelvesFlg || (this.data.promoteInfoList[index].combinationFlag == "0" && this.data.promoteInfoList[index].promotionKind == "1")) return;
    if (this.data.promoteInfoList[index].combinationFlag !== "1" || this.data.promoteInfoList[index].promotionKind) {
      let tmpProduct = {}
      tmpProduct.itemImageAddress1 = this.data.product.itemImageAddress1
      tmpProduct.itemName = this.data.product.itemName
      tmpProduct.itemSpecification = this.data.product.itemSpecification
      tmpProduct.quantity = this.data.promoteInfoList[index].mainQuantity
      tmpProduct.price = this.data.product.price
      tmpProduct.itemId = this.data.product.itemId
      tmpProduct.categoryId = this.data.product.itemCategoryCode
      tmpProduct.isKind = isKind
      const kindStr = isKind ? 'Kind' : ''
      wx.navigateTo({
        url: `/pages/promoteOptions${kindStr}/promoteOptions${kindStr}?promoteInfo=` + JSON.stringify(this.data.promoteInfoList[index]) + "&product=" + JSON.stringify(tmpProduct) + '&kind=' + this.data.promoteInfoList[index].promotionKind,
      })
    }
  },
  plusMinus(e) {
    const dataset = e.currentTarget.dataset;
    const index = dataset.index,
      type = dataset.type;
    const currentNum = this.data.quantity;
    const isMinus = (type === 'minus');
    if ((currentNum === 1) && isMinus) {
      return;
    }
    const num = e.detail.value === undefined ? (isMinus ? (currentNum - 1) : (currentNum + 1)) : e.detail.value
    // const skuQuantity = e.detail.value ? e.detail.value : (isMinus ? -1 : 1)
    let discountAmount = 0
    let totalMoney = num * this.data.product.price
    let currentMoney = totalMoney - discountAmount
    let remaining = this.data.minAmount - currentMoney;
    remaining = utils.getFixedNum(remaining)
    const enableBuy = remaining <= 0;
    currentMoney = utils.getFixedNum(currentMoney);
    this.setData({
      quantity: num,
      totalMoney,
      currentMoney,
      discountAmount,
      buyTxt: enableBuy ? '立即购买' : `还差￥${remaining}可购买`,
      enableBuy
    })
  },

  callPromotionCacl(trollyList, i, num) {
    return new Promise((resolve, reject) => {
      let promises = []
      let itemGroups = []
      let group = {}
      let groupItems = []

      let item = {}
      item.itemId = this.data.product.itemId
      item.brandId = this.data.product.itemBrandId
      item.categoryCode = trollyList[i].itemCategoryCode
      item.quantity = num
      item.unitPrice = trollyList[i].price
      item = {
        ...item,
        seriesCode: this.data.product.seriesCode,
        unitPrice: this.data.product.price,
      }
      groupItems.push(item)

      group.groupId = ""
      group.items = groupItems
      if (trollyList[i].combinationFlag) {
        group.promotions = trollyList[i]
      } else {
        group.promotions = trollyList[i].cartCombinationPromotions
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
          resolve(trollyList)
        })
        .catch(() => {
          reject()
        })
    })
  },
  closePopup() {
    this.setData({
      isSelecting: false,
      buyTxt: '立即购买',
      currentMoney: 0,
      quantity: 1,
      enableBuy: false,
      specificationList: this.data.specificationList.map(item => {
        item.num = 0;
        return item;
      }),
    })
  },
  closePopupPromotion() {
    this.setData({
      promotion: false
    });
  },
  addToTrolley() {
    if (!this.data.isSelecting) {
      let currentMoney = this.data.product.price * this.data.quantity
      let remaining = this.data.minAmount - currentMoney;
      remaining = utils.getFixedNum(remaining)
      const enableBuy = remaining <= 0;

      return this.setData({
        isSelecting: true,
        buyTxt: enableBuy ? '立即购买' : `还差￥${remaining}可购买`,
        currentMoney,
        enableBuy
      })
    }
    const arr = [{
      itemId: this.data.product.itemId,
      quantity: this.data.quantity,
      categoryCode: this.data.product.itemCategoryCode
    }]
    let para = {
      addGroupList: [{
        count: 1,
        addItemList: arr,
        promotions: this.data.product.cartCombinationPromotions
      }]
    }

    utils
      .addToTrolleyByGroup(para)
      .then(badge => {
        this.setData({
          badge: badge,
          icon: '../../images/trolley-missing.png'
        })
        return badge
      })
      .then(data => {
        const related = this.data.product
        utils.addcart({
          itemId: related.itemId,
          itemPro: related.itemSpecification || '',
          itemName: related.itemName,
          price: related.price
        })
        return data
      })
  },
  getProduct({
    itemId,
    categoryCd
  }) {
    const locationId = getApp().globalData.merchant.locationId;
    return utils.getRequest(getProductItem, {
      locationId,
      categoryCd: '',
      itemIds: itemId ? itemId : '',
    }).then(data => {
      if (data.status === 200) {
        const result = data.result[0];
        //计算接口需要额外的数据
        result.unitPrice = result.price
        result.categoryCode = result.itemCategoryCode
        result.brandId = ""
        result.itemImageAddress = (Array(5).fill('')).reduce((accumulator, item, index) => {
          const imgAddress = result['itemImageAddress' + (index + 1)];
          imgAddress !== '' && accumulator.push(`${imgAddress}?x-oss-process=style/750w`);
          return accumulator;
        }, []);
        result.itemImageAddress.length === 0 && result.itemImageAddress.push(this.data.defImg)
        this.setData({
          product: result,
          currentMoney: result.price * this.data.quantity
        })
        return data.result
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
        // categoryId
      }))
      console.log(err);
    })
  },
  getRelated({
    itemId,
    categoryId
  }) {
    const locationId = getApp().globalData.merchant.locationId;
    utils.getRequest(getRelated, {
      locationId,
      // itemIds: 1064 
      itemIds: itemId ? itemId : '',
    }).then(data => {
      if (data.status === 200) {
        let result = []
        for (let i = 0; i < data.result.length; i++) {
          if (data.result[i].itemId != itemId) {
            result.push(data.result[i])
          }
        }
        this.setData({
          related: result
        })
      } else {
        // todo
        if (data instanceof Array) {
          this.setData({
            related: data
          });
        }
      }
    }).catch(err => {
      console.log(err);
    })
  },
  preview(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: this.data.product.itemImageAddress // 需要预览的图片http链接列表
    });
  },
  buy() {
    if (utils.disbaleOperation()) {
      return
    }
    if (!this.data.isSelecting && this.data.minAmount > this.data.product.price) {
      return this.setData({
        isSelecting: true,
        buyTxt: `还差￥${this.data.minAmount - this.data.product.price}可购买`,
        currentMoney: this.data.product.price * this.data.quantity
      })
    } else if (!this.data.isSelecting && this.data.minAmount <= this.data.product.price) {
      return this.setData({
        isSelecting: true,
        currentMoney: this.data.product.price * this.data.quantity,
        enableBuy: true
      })
    }
    if (!this.data.enableBuy) {
      return;
    }
    this.toggleGifts()
  },
  navigateToConfirm(){
    this.data.product.quantity = this.data.quantity
    const selectedItem = this.data.giftItems.find(item => item.checked) //todo how to judge giftItem
    // this.data.product.itemPromotions[0].itemPromotionId = selectedItem.giftItemId
    if (selectedItem) {
      this.data.product.itemPromotions[0].itemPromotionId = this.data.promotionId
    } else if (this.data.product.itemPromotions && this.data.product.itemPromotions[0] && this.data.product.itemPromotions[0].promotionId) {
      this.data.product.itemPromotions[0].itemPromotionId = this.data.product.itemPromotions[0].promotionId
    }
    let itemGroups = []
    let group = {}
    group.groupId = ""
    group.count = 1
    group.combinationFlag = false
    group.checked = true
    group.cartCombinationPromotions = null
    group.items = [this.data.product]
    group.promotions = { promotionId : this.data.promotionId}
    group.putShelvesFlg = this.data.product.putShelvesFlg
    group.suitePrice = this.data.product.price

    itemGroups.push(group)

    let para = {}
    para.locationId = getApp().globalData.merchant.locationId + ""
    para.merchantId = getApp().getMerchantId()
    para.itemGroups = itemGroups
    // 获取促销信息 todo what after selecting gift
    promoteUtil.calcPromote(para)
      .then(arr => {
        const product = this.data.product
        utils.buySku({
          itemId: product.itemId,
          itemPro: product.promotionTypes || '',
          itemName: product.itemName,
          price: product.unitPrice
        })
        return arr
      })
      .then(arr => {
        if (arr) {
          if (arr.giftItems && selectedItem) {
            // todo how set to map line 281 in order-confirm.js
            // arr.giftItems=arr.giftItems.map(item=>{
            //   if (item.itemId === selectedItem.giftItemId){
                
            //   }
            // })
            arr.giftItems[0].itemId = arr.giftItems[0].giftItemId
            arr.giftItems[0].itemName = arr.giftItems[0].giftItemName
            arr.giftItems[0].mainQuantity = arr.giftItems[0].quantity
          } else {
            this.data.currentMoney = this.data.currentMoney - arr.discountAmount
          }
          itemGroups[0].cartCombinationPromotions = [arr]
        } else {

        }
        getApp().globalData.items = itemGroups;
        getApp().globalData.items.orderItemSource = 0;
        wx.navigateTo({
          url: `../order-confirm/order-confirm?itemId=${this.data.product.itemId}&orderStatus=&total=${this.data.currentMoney}&quantity=${this.data.quantity}&totalDiscount=${arr && arr.discountAmount && arr.discountAmount != 0 ? arr.discountAmount : 0}`,
        });
      })
      .catch(() => { })
  },
  navigateTo(evt) {
    const dataset = evt.currentTarget.dataset;
    const related = this.data.related[dataset.index]
    utils.tapSameCategory({
      itemId: related.itemId,
      itemPro: related.itemSpecification,
      itemName: related.itemName,
      price: related.price
    })
    wx.navigateTo({
      url: dataset.url,
    })
  },
  preventTouchMove: function(e) {
    //debugger;
  },
  onLoad: function(options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
    this.getProduct(options)
      .then(data => {
        this.setData({
          top: getApp().globalData.systemInfo.deviceWindowHeight - 750
        })
        return data
      })
      .then(data => {
        return this.getPromoteInfo(options)
      })
      .then(({
        promotionIds
      }) => {
        return this.getPromoteAmount({
          promotionIds
        }) //extend promoteInfoList. todo maybe del getPromoteInfo call
      })
      .then(data => {
        this.setData({
          promoteInfoList: data
        })
        this.calc({
          data,
          quantity: 1
        })

      })
    this.getRelated(options);
    if (getApp().globalData.badge > 0) {
      this.setData({
        badge: getApp().globalData.badge,
        icon: '../../images/trolley-missing.png'
      });
    }
  },
  calc({
    data,
    quantity = this.data.quantity
  }) {
    this.callPromotionCacl(data, 0, quantity).then(data => {
      if (data[0].cartCombinationPromotions) {
        const cartCombinationPromotions = data[0].cartCombinationPromotions[0]
        if (cartCombinationPromotions.promotionType === '1') { //满赠
          console.log(data[0])
          const giftItems = cartCombinationPromotions.giftItems.reduce((accumulator, item, index) => {
            const checked = item.inventoryCount > 0 && !accumulator.hasElected
            if (checked) {
              accumulator.hasElected = true
            }
            accumulator.push({
              ...item,
              itemName: item.giftItemName,
              checked,
              itemId: item.giftItemId
            })
            return accumulator
          }, [])
          this.setData({
            giftItems,
            hasGift: !!giftItems.hasElected,
            promotionId: cartCombinationPromotions.promotionId
          })
        } else if (cartCombinationPromotions.promotionType === '2') { //满减
          this.setData({
            reduced: cartCombinationPromotions.discountAmount
          })
        }
      }
    })
  },
  getPromoteAmount({
    promotionIds
  }) {
    return utils.postRequest({
        url: calcAmount,
        data: {
          // ...getApp().globalData.merchant,
          promotionId: promotionIds.join(','),
          merchantId: getApp().getMerchantId(),
          locationId: getApp().globalData.merchant.locationId,
        }
      })
      .then((data) => {
        if (data.result.length > 0) {
          const promoteInfoList = this.data.promoteInfoList.map(item => {
            const amount = data.result.find(it => it.promotionId === item.promotionId)
            if (amount) {
              item.availableAmount = amount.availableAmount
              item.availableCount = amount.availableCount

            }
            return item
          })
          return promoteInfoList
        }
      })
      .catch(errorCode => {
        console.log(errorCode)
        utils.errorHander(errorCode, this.getPromoteAmount, this.emptyFunc, {
            itemId,
            categoryId
          })
          .then(() => {

          })
          .catch(() => {

          })
      })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    utils.checkNetwork().then(utils.requestStatisLoad);
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  gotoTrolley: function() {
    wx.switchTab({
      url: '/pages/trolley/trolley'
    })
  },

  getPromoteInfo({
    itemId,
    categoryId
  }) {
    return utils.postRequest({
        url: getPromoteInfo,
        data: {
          merchantId: getApp().getMerchantId(),
          locationId: getApp().globalData.merchant.locationId,
          items: [{
            // brandId,
            seriesCode:'todo',//todo where it from
            categoryCode: categoryId ? categoryId : "",
            itemId: itemId
          }],
        }
      })
      .then((data) => {
        if (data.result[0].promotionItems.length > 0) {
          this.setData({
            promoteInfoList: data.result[0].promotionItems,
            "product.itemPromotions": data.result[0].promotionItems,
            hasConsumedGift: data.result[0].promotionItems.some(promoteInfo => promoteInfo.promotionType !== "2"),
            prototionId: itemId
          })
          const items = data.result[0].promotionItems
          const {
            hasPromotion = false, skuKind = false, skuKindKindCategory = false, promotionIds = []
          } = items.reduce((accumulator, item) => {
            accumulator.promotionIds.push(item.promotionId)
            if (item.combinationFlag === "0") {
              if (item.promotionKind === '1') {
                accumulator.sku = true;
              } else if (item.promotionKind === '2') {
                accumulator.skuKind = true
              }
            } else if (item.combinationFlag === "1") {
              if (item.promotionKind === '1') {
                accumulator.hasPromotion = true
              } else if (item.promotionKind === '2') {
                accumulator.skuKindKindCategory = true
              }
            }
            return accumulator
          }, {
            promotionIds: []
          })
          this.setData({
            hasPromotion,
            skuKind,
            skuKindKindCategory
          })
          return {
            promotionIds
          }
        } else {
          this.setData({
            hasPromotion: false
          })
        }
      })
      .catch(errorCode => {
        console.log(errorCode)
        utils.errorHander(errorCode, this.getPromoteInfo, this.emptyFunc, {
            itemId,
            categoryId
          })
          .then(() => {

          })
          .catch(() => {

          })
      })
  },

  emptyFunc: function() {},
  bindinput(e) {
    this.plusMinus(e)
  },
  bindblur(e) {
    if (e.detail.value === '' || +e.detail.value === 0) {
      e.detail.value = 1
    }
    this.calc({
      data: this.data.promoteInfoList,
      quantity: this.data.quantity
    })
    this.plusMinus(e)
  },
  radioChange(e) {
    this.setData({
      giftItems: this.data.giftItems.map((item, index) => {
        item.checked = index === +e.detail.value
        return item
      })
    })
  },
  toggleGifts() {
    this.setData({
      isSelectingGift: !this.data.isSelectingGift
    })
  }
})