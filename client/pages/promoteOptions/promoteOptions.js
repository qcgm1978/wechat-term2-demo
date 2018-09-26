import utils from "../../utils/util.js";
const app = getApp();
const globalData = app.globalData;
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem;
Page({
  data: {
    defImg: getApp().globalData.defaultImg,
    imgTrolly: "../../images/trolley-missing.png",
    promoteMsg: "",
    product: [{ itemName: "惠百真豆油", itemSpecification: "2ML*8", price: "299.90", itemId: "1", checked: false}],
    icon1: "./images/u40.png",
    icon2: "./images/u42.jpg",
    quantity: 0,
    promotionItems: ["./images/u40.png", "./images/u42.jpg"],
    rightArrow: "./images/grey-arrow.png",
    showPromoteDetail: false
  },

  onLoad: function (options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
    this.setData({
      promoteMsg: options.promoteMsg
    })
    // this.categoryId=options.categoryId;
    // this.getCategories(options)
    //this.getProduct(options);

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
    for (let i = 0; i < this.data.product.length; i++){
      if (itemId == this.data.product[i].itemId){
        var item = 'product[' + i + '].checked'
        this.setData({
          [item]: !this.data.product[i].checked
        })
      }
    }
  },
  addToTrolley() {

    utils
      .addToTrolley(this.data.product.itemId, this.data.quantity)
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
  }
})