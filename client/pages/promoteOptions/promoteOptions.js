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
    product: [{ itemName: "惠百真豆油", itemSpecification: "2ML*8", price: "299.90", itemId: "1", checked: false}]
  },

  onLoad: function (options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }

    // this.categoryId=options.categoryId;
    // this.getCategories(options)
    //this.getProduct(options);

  },
  getProduct({
    itemId,
    categoryCd
  }) {
    const locationId = getApp().globalData.merchant.locationId;
    // todo
    // const getProductItem = 'http://192.168.2.26:10092/v1/items?locationId=55&categoryCd=1401001';
    utils.getRequest(getProductItem, {
      locationId,
      categoryCd,
      itemIds: '',
    }).then(data => {
      console.log(data);
      if (data.status === 200) {
        let result = data.result;
        // todo
        // result.putShelvesFlg = true;
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
})