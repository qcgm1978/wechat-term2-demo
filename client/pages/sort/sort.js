import {
  Api
} from '../../utils/envConf.js'
var utils = require("../../utils/util.js");
Page({

  /**
   * Page initial data
   */
  data: {
    data: [],
    currentIndex:0,
  },
  isCurrent(index){
    return index===this.data.currentIndex;
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    utils.getRequest(Api.getCategories, {
      locationId: getApp().globalData.merchant.locationId,
      categoryId: '',
      categoryDeep: 3
    }).then(({
      result
    }) => {
      this.setData( {
        data: result
      });
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