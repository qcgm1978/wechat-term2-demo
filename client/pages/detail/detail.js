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
    const isKind=e.currentTarget.dataset.isKind
    if (!this.data.product.putShelvesFlg || (this.data.promoteInfoList[index].combinationFlag == "0" && this.data.promoteInfoList[index].promotionKind=="1")) return;
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
      const kindStr=isKind?'Kind':''
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
    const num = isMinus ? (currentNum - 1) : (currentNum + 1);

    this.callPromotionCacl([this.data.product], 0, num)
      .then((data)=>{ 
        let discountAmount = 0
        if (data.cartCombinationPromotions && data.cartCombinationPromotions.length > 0 && data.cartCombinationPromotions[0].discountAmount){
          discountAmount = utils.getFixedNum(data.cartCombinationPromotions[0].discountAmount)
        }
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
      })
      .catch((e) => { })

  },
  
  callPromotionCacl(trollyList, i, num) {
    return new Promise((resolve, reject) => {
      let promises = []
      let itemGroups = []
      let group = {}
      let groupItems = []
      
        let item = {}
        item.itemId = trollyList[i].itemId
        item.brandId = ""
        item.categoryCode = trollyList[i].itemCategoryCode
        item.quantity = num
        item.unitPrice = trollyList[i].price
        groupItems.push(item)

      group.groupId = ""
      group.items = groupItems
      if (trollyList[i].combinationFlag) {
        group.promotions = trollyList[i].promotions
      } else {
        group.promotions = trollyList[i].cartCombinationPromotions
      }
      itemGroups.push(group)
      promises.push(promoteUtil.calcPromote({ itemGroups }))

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
      quantity: 1,
      categoryCode: this.data.product.itemCategoryCode
    }]
    let para = {
      addGroupList: [{
        count: this.data.quantity,
        addItemList: arr,
      }]
    }

    utils
      .addToTrolleyByGroup(para)
      .then(badge => {
        this.setData({
          badge: badge,
          icon: '../../images/trolley-missing.png'
        })
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
        });
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
    this.data.product.quantity = this.data.quantity
    if (this.data.product.itemPromotions && this.data.product.itemPromotions[0] && this.data.product.itemPromotions[0].promotionId) {
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
    group.promotions = null
    group.putShelvesFlg = this.data.product.putShelvesFlg
    group.suitePrice = this.data.product.price

    itemGroups.push(group)

    let para = {}
    para.locationId = getApp().globalData.merchant.locationId + ""
    para.merchantId = getApp().getMerchantId()
    para.itemGroups = itemGroups
    // 获取促销信息
    promoteUtil.calcPromote(para)
      .then(arr => {
        if (arr) {
          if (arr.giftItems && arr.giftItems[0]) {
            arr.giftItems[0].itemId = arr.giftItems[0].giftItemId
            arr.giftItems[0].itemName = arr.giftItems[0].giftItemName
            arr.giftItems[0].mainQuantity = arr.giftItems[0].quantity
          }
          itemGroups[0].cartCombinationPromotions = [arr]
        } else {

        }
        getApp().globalData.items = itemGroups;
        getApp().globalData.items.orderItemSource = 0;
        wx.navigateTo({
          url: `../order-confirm/order-confirm?itemId=${this.data.product.itemId}&orderStatus=&total=${this.data.currentMoney}&quantity=${this.data.quantity}&totalDiscount=${arr.discountAmount}`,
        });
      })
      .catch(() => {})


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
        this.getPromoteInfo(options)
      });
    this.getRelated(options);
    if (getApp().globalData.badge > 0) {
      this.setData({
        badge: getApp().globalData.badge,
        icon: '../../images/trolley-missing.png'
      });
    }
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

  getPromoteInfo: function({
    itemId,
    categoryId
  }) {
    utils.postRequest({
        url: getPromoteInfo,
        data: {
          merchantId: getApp().getMerchantId(),
          locationId: getApp().globalData.merchant.locationId,
          items: [{
            categoryCode: categoryId ? categoryId : "",
            itemId: itemId
          }],
        }
      })
      .then((data) => {

        if (data.result[0].promotionItems.length > 0) {
          this.setData({
            //promoteInfo: data.result[0].promotionItems[0],
            promoteInfoList: data.result[0].promotionItems,
            "product.itemPromotions": data.result[0].promotionItems,
          })
          const items = data.result[0].promotionItems
          const { hasPromotion=false, skuKind=false, skuKindKindCategory=false}=items.reduce((accumulator,item)=>{
            if (item.combinationFlag === "0") {
              if (item.promotionKind === '1'){
                accumulator.sku=true;
              } else if (item.promotionKind ==='2'){
                accumulator.skuKind=true
              }
            } else if (item.combinationFlag === "1") {
              if (item.promotionKind === '1'){
                accumulator.hasPromotion=true
              } else if (item.promotionKind === '2'){
                accumulator.skuKindKindCategory=true
              }
            }
            return accumulator
          },{})
          this.setData({
            hasPromotion,
            skuKind,
            skuKindKindCategory
          })
          
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
})