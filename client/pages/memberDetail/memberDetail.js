Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar: '',
    name: '',
    address: '',
    profileName: '',
    id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const merchant = getApp().globalData.merchant;
    this.setData({
      id: merchant.nsMerchantNo,
      name:merchant.merchantStoreName,
      address: (merchant.province+merchant.city+merchant.county+merchant.town+' '+merchant.address).replace(/undefined/g,'').replace(/null/g,''),
      profileName: getApp().globalData.authWechat.authMerchantList[0].userName
    })
    // if (Object.keys(getApp().globalData.userInfo).length) {
    //   const userInfo = getApp().globalData.userInfo;
    //   this.setData({
    //     avatar: userInfo.avatarUrl,
    //     nickName: userInfo.nickName
    //   })
    //   wx.showTabBar();
    // } else {
      // wx.navigateTo({
      //   url: '../login/login',
      // })
    // }
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
    if (!this.data.avatarUrl && Object.keys(getApp().globalData.userInfo).length) {
      const userInfo = getApp().globalData.userInfo;
      this.setData({
        avatar: userInfo.avatarUrl,
        nickName: userInfo.nickName
      })
      wx.showTabBar();
    }
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