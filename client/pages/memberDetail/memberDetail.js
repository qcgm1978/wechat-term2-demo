// pages/memberDetail/memberDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '濮阳市梁村乡翱翔乐购吴家庄家乐福超市',
    address: '濮阳市南乐县梁村乡宋庄村燕润烟酒副食店',
    profileName: '闫瑞',
    id: 'CUS03927'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (Object.keys(getApp().globalData.userInfo).length) {

      wx.showTabBar();
    } else {
      wx.navigateTo({
        url: '../login/login',
      })
    }
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

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