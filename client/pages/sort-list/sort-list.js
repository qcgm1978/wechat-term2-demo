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
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.name,
    });
    // this.categoryId=options.categoryId;
    // this.getCategories(options)
    this.getProduct(options);
    
  },
  getProduct({
    itemId,
    categoryCd
  }) {
    const locationId = globalData.merchant.locationId;
    // todo
    // const getProductItem = 'http://192.168.2.26:10092/v1/items?locationId=55&categoryCd=1401001';
    utils.getRequest(getProductItem, {
      locationId,
      categoryCd,
      itemIds: '',
    }).then(data => {
      console.log(data);
      if (data.status === 200) {
        const result = data.result[0];
        // todo
        result.putShelvesFlg = true;
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