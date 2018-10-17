import utils from "../../utils/util.js";
const app = getApp();
const globalData = app.globalData;
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem;
Page({
  categoryId:"",
  data: {
    imgManjian: "../../images/manjian.png",
    imgManzeng: "../../images/manzeng.png",
    defImg: getApp().globalData.defaultImg,
    product: []
  },
  turnPage(e) {
    const itemId = e.currentTarget.dataset.itemid;
    wx.navigateTo({
      url: `/pages/detail/detail?categoryId=${this.categoryId ? this.categoryId:""}&itemId=${itemId}`,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  onLoad: function(options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
    wx.setNavigationBarTitle({
      title: options.name,
    });
    this.categoryId=options.categoryCd;
    // this.getCategories(options)
    this.getProduct(options);

  },
  getProduct({
    itemId,
    categoryCd
  }) {
    const locationId = getApp().globalData.merchant.locationId;
    // todo
    // const getProductItem = 'http://192.168.2.26:10092/v1/items?locationId=55&categoryCd=1401001';
    // console.log(JSON.stringify({
    //   locationId,
    //   categoryCd,
    //   itemIds: '',
    // }))
    utils.getRequest(getProductItem, {
      locationId,
      categoryCd,
      itemIds: '',
    }).then(data => {
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
  getCategories(options) {
    utils.getRequest(Api.getCategories, {
      locationId: getApp().globalData.merchant.locationId,
      categoryId: options.categoryId,
      categoryDeep: 3
    }).then(({
      result
    }) => {
      this.setData({
        data: result
      });
    }).catch(err => {
      utils.errorHander(err, () => this.getCategories(options))
      console.log(err);
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
  onUnload() {
    utils.requestStatisUnload();
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

  }
})