import utils from "../../utils/util.js";
const app = getApp();
const globalData = app.globalData;
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem;
Page({
  data: {
    product:[]
  },
  turnPage(e){
    const itemId=e.currentTarget.dataset.itemid;
    wx.navigateTo({
      url: `/pages/detail/detail?categoryId=${this.categoryId}&itemId=${itemId}`,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  getProduct(categoryId) {
    // wx.showLoading({
    //   title: '商品数据加载中...',
    // });
    const locationId = globalData.merchant.locationId;
    utils.getRequest(getProductItem, {
      locationId,
      categoryId,
      itemIds:''
      // itemIds: itemId,
    }).then(data => {
      // wx.hideLoading()
      console.log(data);
      if (data.status === 200) {
        const result = data.result[0];
        this.setData({
          product: result
        })
      } else {

      }
    }).catch(err => {
      wx.hideLoading();
      console.log(err);
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.name,
    });
    this.categoryId=options.categoryId;
    this.getProduct(options.categoryId)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})