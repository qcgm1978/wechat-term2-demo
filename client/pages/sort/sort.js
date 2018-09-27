import {
  Api
} from '../../utils/envConf.js'
var utils = require("../../utils/util.js");
Page({
  data: {
    defImg: getApp().globalData.defaultImg,
    data: [],
    currentIndex:0,
  },
  turnPage(e){
    const dataset=e.currentTarget.dataset;
    const itemCategoryCode=dataset.categorycode,name=dataset.name;
    wx.navigateTo({
      url: `/pages/sort-list/sort-list?categoryCd=${itemCategoryCode}&name=${name}`,
    })
  },
  isCurrent(index){
    return index===this.data.currentIndex;
  },
  onLoad: function() {
    
  },
  getCategories(){
    return utils.getRequest(Api.getCategories, {
      locationId: getApp().globalData.merchant.locationId,
      categoryId: '',
      categoryDeep: 3
    }).then(({
      result
    }) => {
      this.setData({
        data: result
      });
    }).catch(err => {
      utils.errorHander(err, () => this.getCategories())
      console.log(err);
    })
  },
  toggleFirst(e){
    const index=e.currentTarget.dataset.index;
    this.setData({
      currentIndex:index
    })
  },
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
    this.getCategories();
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {

  }
})