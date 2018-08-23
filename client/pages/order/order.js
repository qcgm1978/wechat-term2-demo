// pages/order/order.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    orderList: [], // 订单列表
  },

  onTapLogin() {
    app.login({
      success: ({
        userInfo
      }) => {
        this.setData({
          userInfo
        })
      }
    })

    this.getOrder()
  },

  getOrder() {
    wx.showLoading({
      title: '刷新订单数据...',
    })

    qcloud.request({
      url: config.service.orderList,
      login: true,
      success: result => {
        wx.hideLoading()

        let data = result.data
        console.log(data)
        if (!data.code) {
          // todo test pick up websocket data
          const orderList = data.result.map(item => {
            item.list.map(item=>{
              item.pickupCode = getApp().globalData.pickUpCode;
              item.state=(item.product_id === getApp().globalData.product_id)? '已提货':'未提货';
              return item;
            });
            return item;
          });
          this.setData({
            orderList
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '刷新订单数据失败',
          })
        }
      },
      fail: () => {
        wx.hideLoading()

        wx.showToast({
          icon: 'none',
          title: '刷新订单数据失败',
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    getApp().globalData.userInfo ? this.getData() : setTimeout(this.getData, 1000)

  },
  getData() {
    app.checkSession({
      success: ({
        userInfo
      }) => {
        this.setData({
          userInfo
        })
        this.getOrder()
      }
    })
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