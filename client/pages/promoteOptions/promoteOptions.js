import utils from "../../utils/util.js";
import promoteUtil from "../../utils/promotion.js";
const app = getApp();
const globalData = app.globalData;
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem,
  selectGoods = Api.selectGoods;
let promoteInfo = {}
let calcPromoteInfo = {}
Page({
  data: {
    top: getApp().globalData.systemInfo.deviceWindowHeight - 270,
    badge: 0,
    defImg: getApp().globalData.defaultImg,
    imgTrolly: "../../images/trolley-full.png",
    promoteMsg: "",
    composeProducts: [],
    mainProduct: {},
    selectedProductList: [],
    totalPrice: 0,
    rightArrow: "./images/grey-arrow.png",
    showPromoteDetail: false,
    totalDiscount: 0
  },

  onLoad: function (options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }

    let product = JSON.parse(options.product)
    promoteInfo = JSON.parse(options.promoteInfo)
    this.setData({
      promoteMsg: promoteInfo.promotionName,
      mainProduct:product,
      'selectedProductList[0]': product,
      totalPrice: 0
    })

    if (getApp().globalData.badge > 0) {
      this.setData({
        badge: getApp().globalData.badge,
        icon: '../../images/trolley-missing.png'
      });
    }

    promoteInfo = promoteInfo
    let paraData = { itemId: product.itemId, categoryId: product.categoryId, promoteInfo}
    this.getComposeProducts(paraData)
  },
  getProduct({
    itemId,
    categoryCd
  }) {
    const locationId = getApp().globalData.merchant.locationId;
    utils.getRequest(getProductItem, {
      locationId,
      categoryCd,
      itemIds: '',
    }).then(data => {
      if (data.status === 200) {
        let result = data.result;
        result = result.map(item => {
          item.itemImageAddress1 = (item.itemImageAddress1 && !item.itemImageAddress1.endsWith("gif")) ? item.itemImageAddress1 : this.data.defImg;
          return item;
        })
        this.setData({
          product: result
        })
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
        categoryId
      }))
      console.log(err);
    })
  },

  radioClick(e) {
    const itemId = e.currentTarget.dataset.itemid;
    
    for (let i = 0; i < this.data.composeProducts.length; i++){
      if (itemId == this.data.composeProducts[i].itemId){
        for (let j = 0; j < this.data.composeProducts.length; j++){
          if (this.data.composeProducts[j].checked){
            if (this.data.selectedProductList.length == 3){
              this.data.selectedProductList.splice(2, 1);
              this.setData({
                selectedProductList: this.data.selectedProductList
              })
            }
              
            var item = 'composeProducts[' + j + '].checked'
            this.setData({
              [item]: false
              })

          }
        }
        var item = 'composeProducts[' + i + '].checked'
        this.setData({
          [item]: !this.data.composeProducts[i].checked
        })
        if (this.data.composeProducts[i].checked){
          this.setData({
            'selectedProductList[1]': this.data.composeProducts[i],
            // totalPrice: Number(this.data.selectedProductList[0].price * this.data.selectedProductList[0].minQuantity) + Number(this.data.composeProducts[i].price * this.data.composeProducts[i].minQuantity)
          })

          let itemGroups = []
          let group = {}

          let groupItems = []

          let item1 = {}
          item1.itemId = this.data.selectedProductList[0].itemId
          item1.brandId = ""
          item1.categoryCode = this.data.selectedProductList[0].itemCategoryCode
          item1.quantity = this.data.selectedProductList[0].minQuantity
          item1.unitPrice = this.data.selectedProductList[0].price
          groupItems.push(item1)

          let item2 = {}
          item2.itemId = this.data.selectedProductList[1].itemId
          item2.brandId = ""
          item2.categoryCode = this.data.selectedProductList[1].itemCategoryCode
          item2.quantity = this.data.selectedProductList[1].minQuantity
          item2.unitPrice = this.data.selectedProductList[1].price
          groupItems.push(item2)

          group.groupId = ""
          group.items = groupItems
          group.promotions = [{ promotionId: promoteInfo.promotionId}]
          itemGroups.push(group)

          promoteUtil.calcPromote({ itemGroups })
            .then((promoteResult) => {
              console.log(promoteResult)
              //满赠

              if (promoteResult.giftItems && promoteResult.giftItems.length>0) {
                promoteResult.giftItems[0].minQuantity = promoteResult.giftItems[0].quantity
                promoteResult.giftItems[0].itemName = promoteResult.giftItems[0].giftItemName
                promoteResult.giftItems[0].price = 0
                promoteResult.giftItems[0].isGift = true
                this.setData({
                  'selectedProductList[2]': promoteResult.giftItems[0]
                })

              } else if (promoteResult.discountAmount > 0) { //满减
                this.setData({
                  totalDiscount: promoteResult.discountAmount,
                  totalPrice: utils.getFixedNum(Number(this.data.selectedProductList[0].price * this.data.selectedProductList[0].minQuantity) + Number(this.data.composeProducts[i].price * this.data.composeProducts[i].minQuantity) - promoteResult.discountAmount, 2)
                })
              }else{
                this.setData({
                  totalPrice: utils.getFixedNum(Number(this.data.selectedProductList[0].price * this.data.selectedProductList[0].minQuantity) + Number(this.data.composeProducts[i].price * this.data.composeProducts[i].minQuantity), 2)
                })
              }
            })
            .catch(() => {

            })
        }else{
          this.data.selectedProductList.splice(1, 2);
          this.setData({
            selectedProductList: this.data.selectedProductList,
            totalPrice: this.data.selectedProductList[0].price * this.data.selectedProductList[0].minQuantity
          })
        }
      }
    }
  },
  addToTrolley() {
    if (this.data.selectedProductList.length == 1){
      wx.showToast({
        title: '请选择促销商品',
        icon: 'none',
        duration: 2500
      })
      return
    }

    let orderItem = []
    orderItem.push(this.data.selectedProductList[0])
    orderItem.push(this.data.selectedProductList[1])
    const arr = orderItem.map(item => ({
      itemId: item.itemId,
      quantity: Number(item.minQuantity),
      categoryCode: item.itemCategoryCode
    }));

    let para = {
      addGroupList: [{
        count:1,
        addItemList: arr,
        promotions: [{
          promotionId : promoteInfo.promotionId
        }]
      }]
    }

    utils
      .addToTrolleyByGroup(para)
      .then(badge => {
        this.setData({
          badge,
          icon: '../../images/trolley-missing.png'
        })
      })
  },

  togglePromoteDetail() {
    if (this.data.showPromoteDetail){
      this.setData({
        top: getApp().globalData.systemInfo.deviceWindowHeight - 270,
        showPromoteDetail : false
      })
    }else{
      this.setData({
        top: getApp().globalData.systemInfo.deviceWindowHeight - 420,
        showPromoteDetail : true
      })
    }
  },

  getComposeProducts: function ({
    itemId,
    categoryId,
    promoteInfo
    }) {
    let tmpData = {
      merchantId: getApp().getMerchantId(),
      locationId: getApp().globalData.merchant.locationId,
      promotionId: promoteInfo.promotionId,
      item: 
        {
          categoryCode: categoryId,
          itemId: itemId
        },
    }

    utils.postRequest({
      url: selectGoods,
      data: {
        merchantId: getApp().getMerchantId(),
        locationId: getApp().globalData.merchant.locationId,
        promotionId: promoteInfo.promotionId,
        item: 
          {
            categoryCode: categoryId,
            itemId: itemId
          },
      }
    })
    .then(data => {
      if (data.status === 200) {
        this.setData({
          composeProducts: data.result.conbinationItems,
          mainProduct: data.result.item,
          'selectedProductList[0]': data.result.item
        })
      } else {
      }
    }).catch(err => {
      console.log(err);
    })
  },
  gotoTrolley: function () {
    wx.switchTab({
      url: '/pages/trolley/trolley'
    })
  },
  
  turnPage(e) {
    const itemId = e.currentTarget.dataset.itemid;
    const itemCategoryCode = e.currentTarget.dataset.categorycode;
    wx.navigateTo({
      url: `/pages/detail/detail?itemId=${itemId}&categoryId=${itemCategoryCode}`,
    })
  },
})