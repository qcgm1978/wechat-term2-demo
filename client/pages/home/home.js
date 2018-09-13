import utils from "../../utils/util.js";
// const io = require('/socket.io/socket.io.js')
const getUserInfo = require('./getUserInfo').default;
import {
  Api
} from '../../utils/envConf.js';
import {
  getRequest
} from '../../utils/util.js';
const getMerchant = Api.getMerchant,
  getProductList = Api.getProductList,
  getBanners = Api.getBanners,
  getHot = Api.getHot;
const app = getApp()
let globalData = app.globalData;

Page({
  data: {
    index: 0,
    stores: [],
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
    defImg: globalData.defaultImg,
  },
  start: 0,
  limit: 20,
  enablePullDownRefresh: false,
  bindPickerChange(e) {
    getApp().globalData.currentIndex = Number(e.detail.value);
    getApp().globalData.merchant = getApp().globalData.authMerchantList[getApp().globalData.currentIndex]
    this.setData({
      index: Number(e.detail.value)
    })
    this.getMerchant()
      .then(locationId => {
        getApp().globalData.merchant.locationId = locationId
        this.getProductList(locationId)
      })
      .then(() => {
        return getRequest(Api.getCartCount, {
          merchantId: app.getMerchantId(),
          // accessToken: this.globalData.token.accessToken
        })
      })
      .then(data => {
        if (data.status === 200) {
          const count = data.result.count;
          globalData.badge = count;
          wx.setTabBarBadge({
            index: 2,
            text: count + ''
          });
        }
      })
      .then(data => {
        wx.setStorage({
          key: 'globalData',
          data: getApp().globalData,
        })
      })
      .catch(err => {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      });
  },
  errorFunction(e) {
    const productList = getApp().errorFunction(e, this.data.productList);
    this.setData({
      productList
    })
  },
  getMerchant() {
    return new Promise((resolve, reject) => {
      getRequest(Api.getMerchant, {
          merchantId: app.getMerchantId()
        })
        .then((data) => {
          const merchant = data.result;
          // // todo 
          // merchant.locationId = 55;
          getApp().globalData.merchant = merchant;
          getApp().globalData.address = (merchant.province + merchant.city + merchant.county + merchant.town + ' ' + merchant.address).replace(/undefined/g, '').replace(/null/g, '');
          resolve(merchant.locationId)
        })
        .catch(errorCode => {
          // getApp().failRequest();
          utils.errorHander(errorCode, this.getMerchant)
            .then(() => {
              resolve()
            })
            .catch(() => {
              reject()
            })
        })
    });
  },
  getProductList(locationId) {
    return new Promise((resolve, reject) => {
      locationId = locationId ? locationId : getApp().globalData.merchant.locationId; 
      getRequest(getHot, {
        locationId,
        start: this.start,
        limit: this.limit
      }).then(result => {
        let data = result.result;
        if (result.status === 200) {
          if (data.length) {
            this.setData({
              productList: data
            });
          }
          resolve(data)
        } else {
          wx.showToast({
            icon: 'none',
            title: '商品数据加载错误',
          });
          reject(result.status)
        }
      }).catch(err => {
        wx.showToast({
          icon: 'none',
          title: '商品数据加载错误',
        });
        reject(err)
      });
    });
  },
  addToTrolley(event) {
    return new Promise((resolve, reject) => {
      const itemId = event.currentTarget.dataset.itemid;
      utils.addToTrolley(itemId).catch(errorCode => {
        // getApp().failRequest();
        utils.errorHander(errorCode, this.getMerchant)
          .then(() => {
            resolve()
          })
          .catch(() => {
            reject()
          })
      }).catch((errorCode) => {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '添加到购物车失败',
        })
      });
    })
  },
  onLoad: function(options) {
    this.getBanners()
      .then(data => {})
      .catch(err => {})
    this.getMerchant()
      .then(locationId => this.getProductList(locationId))
      .then(() => {
        return getRequest(Api.getCartCount, {
          merchantId: app.getMerchantId(),
          // accessToken: this.globalData.token.accessToken
        })
      })
      .then(data => {
        if (data.status === 200) {
          const count = data.result.count;
          globalData.badge = count;
          wx.setTabBarBadge({
            index: 2,
            text: count + ''
          });
        }
      })
      .then(data => {
        wx.setStorage({
          key: 'globalData',
          data: getApp().globalData,
        })
      })
      .catch(err => {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      });
    this.setData({
      stores: getApp().globalData.authWechat.authMerchantList,
    });
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
    getApp().setBadge()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },
  onPullDownRefresh: function() {
    // if (this.enablePullDownRefresh) {
    this.start = 0;
    this.getProductList(globalData.merchant.locationId).then(data => wx.stopPullDownRefresh());
    // }
  },
  onReachBottom: function() {
    this.start += this.limit;
    this.getProductList(getApp().globalData.merchant.locationId);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  bannerClick: function(e) {
    if (e.target.dataset.postid) {
      wx.navigateTo({
        url: '../webView/webView?targetUrl=' + e.target.dataset.postid
      })
    }
  },
  getBanners: function() {
    return new Promise((resolve, reject) => {
      getRequest(getBanners, {
          category: "merchant_home"
        }).then(data => {
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