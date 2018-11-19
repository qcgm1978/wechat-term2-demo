import {
  Api
} from '../../utils/envConf.js';
import {
  getRequest,
  requestStatisLoad,
  requestStatisUnload,
  checkNetwork
} from '../../utils/util.js';
const getBanners = Api.getBanners;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    productList: [], // 商品列表
    imgUrls: [{
      "imageUrl": "https://stg-statics.jihuiduo.cn/miniapp_banners/merchant_home1.jpeg",
      "pageUrl": ""
    },
    {
      "imageUrl": "https://stg-statics.jihuiduo.cn/miniapp_banners/merchant_home2.jpeg",
      "pageUrl": ""
    },
    ],
  },
  callPhone(evt) {
    wx.makePhoneCall({
      phoneNumber: '400-101-5288', //仅为示例，并非真实的电话号码
      success(data){
        debugger
      }
    })
  },
  exitLogin() {
    getApp().exitLogin();
  },
  getProductList() {
    wx.showLoading({
      title: '商品数据加载中...',
    })

    qcloud.request({
      url: config.service.productList,
      success: result => {
        wx.hideLoading()

        let data = result.data
        if (data.status === 200) {
          this.setData({
            productList: data.result
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '商品数据加载错误',
          })
        }
      },

      fail: () => {
        wx.hideLoading()

        wx.showToast({
          icon: 'none',
          title: '商品数据加载错误',
        })
      }
    })
  },

  addToTrolley(event) {
    let productId = event.currentTarget.dataset.id
    let productList = this.data.productList
    let product

    for (let i = 0, len = productList.length; i < len; i++) {
      if (productList[i].id === productId) {
        product = productList[i]
        break
      }
    }

    if (product) {
      qcloud.request({
        url: config.service.addTrolley,
        login: true,
        method: 'PUT',
        data: product,
        success: result => {
          let data = result.data

          if (!data.code) {
            wx.showToast({
              title: '已添加到购物车',
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '添加到购物车失败',
            })
          }
        },
        fail: () => {
          wx.showToast({
            icon: 'none',
            title: '添加到购物车失败',
          })
        }
      })

    }


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getProductList();
    // this.onLaunch()
    // wx.hideTabBar();
    this.getBanners()
    .then(()=>{})
    .catch(() => { })
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
    if (!getApp().globalData.registerStatus) {
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/login/login',
        })
        return
      }, 1000)
    }
    checkNetwork().then(requestStatisLoad);
  },
  onUnload() {
    requestStatisUnload();
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    requestStatisUnload();
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

  },
  bannerClick: function (e) {
    if (e.target.dataset.postid) {
      wx.navigateTo({
        url: '../webView/webView?targetUrl=' + e.target.dataset.postid
      })
    }
  },
  getBanners: function () {
    return new Promise((resolve, reject) => {
      getRequest(getBanners, {
        category: "merchant_home"
      }).then(data => {
        console.log(data.result)
        this.setData({
          imgUrls: data.result
        })
        resolve()
      })
        .catch(errorCode => {
          reject()
        });
    })
  },
})