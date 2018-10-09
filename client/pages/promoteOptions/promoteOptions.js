import utils from "../../utils/util.js";
import promoteUtil from "../../utils/promotion.js";
const app = getApp();
const globalData = app.globalData;
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem,
  // calcPromote = Api.calcPromote,
  selectGoods = Api.selectGoods;
let promoteInfo = {}
let calcPromoteInfo = {}
Page({
  data: {
    badge: 0,
    defImg: getApp().globalData.defaultImg,
    imgTrolly: "../../images/trolley-full.png",
    promoteMsg: "",
    composeProducts: [],
    mainProduct: {},
    // freeGift: {},
    // composeProducts: [{ itemCategoryCode: "2701", itemId: "3496", itemImageAddress1: "https://stg-statics.jihuiduo.cn/jhb_images/%E4%B8%83%E5%96%9C3301.jpg", itemName: "七喜六联", itemSpecification: "330ml*24", price: 41, promoteType: "满减", putShelvesFlg: true, quantity: "2"}],
    // mainProduct: { itemImageAddress1: "./images/u42.jpg", itemName: "惠百真豆油", itemSpecification: "2ML*8", quantity: "2", price: "299.90", itemId: "1" },

    // freeGift: { itemCategoryCode: "2701", itemId: "3496", itemImageAddress1: "https://stg-statics.jihuiduo.cn/jhb_images/%E4%B8%83%E5%96%9C3301.jpg", itemName: "七喜六联", itemSpecification: "330ml*24", price: 41, promoteType: "满减", putShelvesFlg: true, minQuantity: "2",isfree: true },
    selectedProductList: [],

    totalPrice: 0,
    rightArrow: "./images/grey-arrow.png",
    showPromoteDetail: false
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
    // this.categoryId=options.categoryId;
    // this.getCategories(options)
    //this.getProduct(options);
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
      //console.log(data);
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
        var item = 'composeProducts[' + i + '].checked'
        this.setData({
          [item]: !this.data.composeProducts[i].checked
        })
        if (this.data.composeProducts[i].checked){
          this.setData({
            'selectedProductList[1]': this.data.composeProducts[i],
            totalPrice: Number(this.data.selectedProductList[0].price * this.data.selectedProductList[0].minQuantity) + Number(this.data.composeProducts[i].price * this.data.composeProducts[i].minQuantity)
          })
          promoteUtil.calcPromote()
            .then((promoteResult) => {
              console.log(promoteResult)
              //满赠
              if (promoteResult.freeGift) {
                this.setData({
                  'selectedProductList[2]': promoteResult.freeGift
                })
              } else if (promoteResult.discountAmount > 0) { //满减
                console.log("afasdfsadfsdf满减满减满减满减")
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

    //const orderItem = this.data.selectedProductList;
    let orderItem = []
    orderItem.push(this.data.selectedProductList[0])
    orderItem.push(this.data.selectedProductList[1])
    const arr = orderItem.map(item => ({
      itemId: item.itemId,
      quantity: Number(item.minQuantity),
      categoryCode: item.itemCategoryCode
    }));
    //console.log(this.data.selectedProductList)
    let para = {
      addGroupList: [{
        addItemList: arr,
        promotions: [{
          promotionId : promoteInfo.promotionId
        }]
      }]
    }
     console.log(JSON.stringify(para))
    // return
    //console.log(arr)
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
      this.setData({
        showPromoteDetail: !this.data.showPromoteDetail
      })
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
      items: [
        {
          categoryCode: categoryId,
          itemId: itemId
        }
      ],
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
        console.log(data.result)
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
})