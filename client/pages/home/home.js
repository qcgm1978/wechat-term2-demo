const getUserInfo = require('./getUserInfo').default;
var currentEnv = require("../../utils/envConf.js").env;
import {
  Api
} from '../../utils/envConf.js';
import {
  getRequest,
  addToTrolleyByGroup,
  getMerchant,
  errorHander,
  updateTrolleyNum,
  requestStatisLoad,
  requestStatisUnload,
  promptFreezing,
  addcart
} from '../../utils/util.js';
const getProductList = Api.getProductList,
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
    defImgUrls: [{
      "imageUrl": "https://stg-statics.jihuiduo.cn/miniapp_banners/merchant_home1.jpeg",
      "pageUrl": ""
    },
    {
      "imageUrl": "https://stg-statics.jihuiduo.cn/miniapp_banners/merchant_home2.jpeg",
      "pageUrl": ""
    },
    ],
    defImg: getApp().globalData.defaultImg,
    imgManjian: "img/manjian.png",
    imgManzeng: "img/manzeng.png",
  },
  start: 0,
  limit: 20,
  enableRequest: true,
  bindPickerChange(e) {
    getApp().globalData.currentIndex = Number(e.detail.value);
    getApp().globalData.merchant = getApp().globalData.authMerchantList[getApp().globalData.currentIndex];
    if (this.data.index !== Number(e.detail.value)) {
      getApp().globalData.toggleMerchant = true;
      getApp().globalData.checkedTrolley = [];
    }
    this.setData({
      index: Number(e.detail.value)
    });
    getMerchant()
      .then(data => {
        const merchant = data.result;
        for (let i = 0; i < getApp().globalData.authMerchantList.length; i++) {
          if (getApp().globalData.authMerchantList[i].merchantId == merchant.nsMerchantId) {
            this.setData({
              index: i
            })
          }
        }

        return (merchant.locationId);
      })
      .then(locationId => {
        getApp().globalData.merchant.locationId = locationId;
        this.start = 0;
        this.setData({
          productList: []
        })
        this.getProductList(locationId)
        return locationId
      })
      .then(locationId=>{
        this.getBanners()
        return locationId
      })
      .then(updateTrolleyNum)
      .then(data => {
        if (data.status === 200) {
          const count = data.result.count;
          getApp().globalData.badge = count;
          count && wx.setTabBarBadge({
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
        wx.showModal({
          title: '提示',
          content: '获取商家信息失败',
          showCancel: false,
          success: res => {
            // wx.reLaunch({
            //   url: '/pages/login/login',
            // })
          }
        })
      });
  },
  errorFunction(e) {
    const productList = getApp().errorFunction(e, this.data.productList);
    this.setData({
      productList
    })
  },
  getProductList(locationId) {
    return new Promise((resolve, reject) => {

      locationId = locationId ? locationId : getApp().globalData.merchant ? getApp().globalData.merchant.locationId : "";
      getRequest(getHot, {
        locationId,
        start: this.start,
        limit: this.limit,
        merchantId: getApp().getMerchantId()
      }).then(result => {
        let data = result.result;
        if (result.status === 200) {
          if (data.length) {
            this.setData({
              productList: this.data.productList.concat(data)
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
      }).catch(errorCode => {
        errorHander(errorCode, () => {
          this.getProductList(locationId);
        });
      });
    });
  },
  addToTrolley(event) {
    if (!event.currentTarget.dataset.putshelvesflg && (event.currentTarget.dataset.inventoryCount!==0)) return
    return new Promise((resolve, reject) => {
      const dataset = event.currentTarget.dataset
      const itemId = dataset.itemid;
      const categoryCode = dataset.categorycode
      const arr = [{
        itemId: itemId,
        quantity: 1,
        categoryCode: categoryCode
      }]
      let para = {
        addGroupList: [{
          count: 1,
          addItemList: arr
        }]
      }
      addToTrolleyByGroup(para)
        .then(data => {
          const related = this.data.productList[dataset.index]
          addcart({
            itemId: related.itemId,
            itemPro: related.promotionTypes || '',
            itemName: related.itemName,
            price: related.price
          })
          return data
        })
        .catch(errorCode => {
          // getApp().failRequest();
          return errorHander(errorCode, () => {
            addToTrolleyByGroup(event);
          });
        })
        .catch((errorCode) => {
          console.log(errorCode)
          if (errorCode !== 406) {
            wx.showToast({
              icon: 'none',
              title: '添加到购物车失败',
            })
          }
        });
    })
  },
  setStores(merchant) {
    if (!merchant) return ""
    for (let i = 0; i < getApp().globalData.authMerchantList.length; i++) {
      if (getApp().globalData.authMerchantList[i].merchantId == merchant.nsMerchantId) {
        this.setData({
          index: i
        });
        getApp().globalData.currentIndex = i;
      }
    }
    getApp().globalData.address = (merchant.province + merchant.city + merchant.county + merchant.town + ' ' + merchant.address).replace(/undefined/g, '').replace(/null/g, '');
    return merchant.locationId;
  },
  onLoad: function(options) {
    var navigationBarTitle = "首页"
    switch (currentEnv) {
      case 0:
        navigationBarTitle = navigationBarTitle + "(DEV)"
        break
      case 1:
        navigationBarTitle = navigationBarTitle + "(STG)"
        break
      default:
        break
    }
    wx.setNavigationBarTitle({
      title: navigationBarTitle
    });

    const merchant = getApp().globalData.merchant;
    const hasLocationId = merchant ? Promise.resolve({
      result: merchant
    }) : getMerchant();
    hasLocationId
      .then(this.getBanners)
      .then(data => {
        if (data.result) {
          const merchant = data.result;
          getApp().globalData.merchant = merchant;
        }
        return getApp().globalData.merchant;
      })
      .then(this.setStores)
      .then(data => {
        wx.setStorage({
          key: 'globalData',
          data: getApp().globalData,
        });
        wx.hideLoading();
      })
      .then(this.getProductList)
      .then(() => {
        return updateTrolleyNum()
      })
      .then(data => {
        if (data.status === 200) {
          const count = data.result.count;
          getApp().globalData.badge = count;
          count && wx.setTabBarBadge({
            index: 2,
            text: count + ''
          });
        }
      })
      
      .catch(err => {
        console.log(err)
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '获取商家信息失败',
          showCancel: false,
          success: res => {
            // wx.reLaunch({
            //   url: '/pages/login/login',
            // })
          }
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
    if (!getApp().globalData.registerStatus) {
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/login/login',
        })
        return
      }, 1000)
    }
    getApp().setBadge();
    requestStatisLoad();
    promptFreezing()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    requestStatisUnload()
  },
  onPullDownRefresh: function() {
    if (this.enableRequest) {
      this.enableRequest = false;
      this.start = 0;
      this.setData({
        productList: []
      })
      this.getProductList(getApp().globalData.merchant.locationId)
        .then(data => {
          wx.stopPullDownRefresh();
          this.enableRequest = true;
        })
        .catch(err => {
          wx.stopPullDownRefresh();
          this.enableRequest = true;
        });
    }
  },
  onReachBottom: function() {
    if (this.enableRequest) {
      this.enableRequest = false;
      this.start += this.limit;
      this.getProductList(getApp().globalData.merchant.locationId).then(data => {
        this.enableRequest = true;
      }).catch(err => {
        this.enableRequest = true;
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  bannerClick: function(e) {
    if (e.target.dataset.postid) {
      wx.navigateTo({
        // url: '../webView/webView?targetUrl=' + e.target.dataset.postid
        url: e.target.dataset.postid
      })
    }
  },
  getBanners(data) {
    new Promise((resolve, reject) => {
      getRequest(getBanners, {
          category: "merchant_home",
        locationId: getApp().globalData.merchant.locationId
        }).then(data => {
          if (data && data.result) {
            this.setData({
              imgUrls: data.result
            })
          }
          resolve()
        })
        .catch(err => {
          this.setData({
            imgUrls: this.data.defImgUrls
          })
        })
    })
    return Promise.resolve(data)
  },
})