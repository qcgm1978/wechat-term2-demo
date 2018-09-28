import utils from "../../utils/util.js";
const app = getApp();
const globalData = app.globalData;
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem,
  getComposeProducts = Api.getComposeProducts;
Page({
  data: {
    badge: 0,
    defImg: getApp().globalData.defaultImg,
    imgTrolly: "../../images/trolley-full.png",
    promoteMsg: "",
    composeProducts: [{ itemCategoryCode: "2701", itemId: "3496", itemImageAddress1: "https://stg-statics.jihuiduo.cn/jhb_images/%E4%B8%83%E5%96%9C3301.jpg", itemName: "七喜六联", itemSpecification: "330ml*24", price: 41, promoteType: "满减", putShelvesFlg: true, quantity: "2"}],
    mainProduct: { itemImageAddress1: "./images/u42.jpg", itemName: "惠百真豆油", itemSpecification: "2ML*8", quantity: "2", price: "299.90", itemId: "1" },
    freeGift: { itemCategoryCode: "2701", itemId: "3496", itemImageAddress1: "https://stg-statics.jihuiduo.cn/jhb_images/%E4%B8%83%E5%96%9C3301.jpg", itemName: "七喜六联", itemSpecification: "330ml*24", price: 41, promoteType: "满减", putShelvesFlg: true, quantity: "2",isfree: true },
    selectedProductList: [],

    // quantity: 0,
    // promotionItems: ["./images/u40.png", "./images/u42.jpg"],
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
    this.setData({
      promoteMsg: options.promoteMsg,
      mainProduct:product,
      'selectedProductList[0]': product,
      totalPrice: product.price
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
      console.log(data);
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
            totalPrice: Number(this.data.selectedProductList[0].price) + Number(this.data.composeProducts[i].price)
          })
          if(this.data.freeGift){
            this.setData({
              'selectedProductList[2]': this.data.freeGift
            })
          }
        }else{
          if (this.data.freeGift){
            this.data.selectedProductList.splice(1, 2);
          }else{
            this.data.selectedProductList.splice(1, 1);
          }
          this.data.selectedProductList.splice(1, 2);
          this.setData({
            selectedProductList: this.data.selectedProductList,
            totalPrice: this.data.selectedProductList[0].price
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

    console.log(this.data.selectedProductList)
    return
    const orderItem = this.data.selectedProductList;
    const arr = orderItem.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity
    }));
    console.log(arr)
    utils
      .addToTrolley(arr)
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

  getComposeProducts: function () {
    utils.getRequest(getComposeProducts, {
      // locationId,
      // itemIds: itemId ? itemId : '',
    }).then(data => {
      if (data.status === 200) {
        this.setData({
          composeProducts: data.result
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