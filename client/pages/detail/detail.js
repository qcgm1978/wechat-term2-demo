const _ = require('../../utils/util');

import utils from "../../utils/util.js";
const app = getApp();
const globalData = app.globalData;
import {
  Api
} from '../../utils/envConf.js'
const getProduct = Api.getProduct, getProductItem = Api.getProductItem;

Page({
  data: {
    currentMoney: 0,
    badge: 0,
    quantity:1,
    product: {},
    enableBuy:false,
    promotion: false,
    isSelecting: false,
    hasPromotion: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    minAmount: 500,
    top: globalData.systemInfo.windowHeight,
    buyTxt: '立即购买',
    specificationList: [{
      specification: '1*12*450ML',
      num: 0

    },],
    icon: '../../images/trolley-full.png',
    info: '保质期(125天)；场地：中国，杭州；品牌：七喜',
    imgUrls: [{
      img: 'https://i01picsos.sogoucdn.com/f29ddb031dfa74e8',
      title: '多种口味听装芬达500ml',
      money: '2.5',
      item_id: 123456
    },
    {
      img: 'http://www.kfzimg.com/G05/M00/3E/63/p4YBAFg-yCCAIXT_AABMUEgSsqU474_n.jpg',
      title: '多种口味听装芬达500ml',
      money: '2.5',
      item_id: 123456
    },
    {
      img: 'https://i03picsos.sogoucdn.com/2a4cac7380108f44',
      title: '多种口味听装芬达500ml',
      money: '2.5',
      type: '满减',
      item_id: 123456
    },
    {
      img: 'https://i03picsos.sogoucdn.com/c6fe007b19eb29b1',
      title: '多种口味听装芬达500ml',
      money: '2.5',
      type: '满减',
      item_id: 123456
    }
    ]
  },
  showPromotion() {
    this.setData({
      promotion: true
    })
  },
  plusMinus(e) {
    const dataset = e.currentTarget.dataset;
    const index = dataset.index,type=dataset.type;
    const currentNum = this.data.quantity;
    const isMinus = (type === 'minus');
    if((currentNum===1)&&isMinus){
      return;
    }
    const num = isMinus?(currentNum-1):(currentNum + 1);
    const remaining = this.data.minAmount - num * this.data.product.price;
    const enableBuy = remaining <= 0;
    this.setData({
      quantity: num,
      currentMoney:num * this.data.product.price,
      buyTxt: enableBuy?'立即购买':`还差￥${remaining}可购买`,
      enableBuy
    })
  },
  
  closePopup() {
    this.setData({
      isSelecting: false,
      buyTxt:'立即购买',
      currentMoney:0,
      enableBuy:false,
      specificationList: this.data.specificationList.map(item=>{
        item.num=0;
        return item;
      }),
    })
  },
  closePopupPromotion() {
    this.setData({
      promotion: false
    });
  },
  addToTrolley() {
    if (!this.data.isSelecting) {
      return this.setData({
        isSelecting: true,
        buyTxt: `还差￥${this.data.minAmount}可购买`,
        currentMoney: this.data.product.price * this.data.quantity
      })
    }
    utils
      .addToTrolley(this.data.product.item_id)
      .then(badge => {
        this.setData({
          badge,
          icon: '../../images/trolley-missing.png'
        })
      })
  },
  getProduct(itemId, categoryId) {
    wx.showLoading({
      title: '商品数据加载中...',
    });
    const locationId = globalData.merchant.locationId;
    utils.getRequest(getProductItem, {
      locationId,
      categoryId,
      itemId,
      merchantId: globalData.merchantId
    }).then(data => {
      wx.hideLoading()
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
  preview(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: this.data.product.item_image_address // 需要预览的图片http链接列表
    });
  },

  buy() {
    if (!this.data.isSelecting) {
      return this.setData({
        isSelecting: true,
        buyTxt: `还差￥${this.data.minAmount}可购买`,
        currentMoney: this.data.product.price*this.data.quantity
      })
    }
    if (!this.data.enableBuy) {
      return;
    }
    this.data.product.items[0].quantity = this.data.quantity;
    globalData.items = this.data.product;
    wx.navigateTo({
      url: `../order-confirm/order-confirm?itemId=${this.data.product.item_id}&orderStatus=&total=${this.data.currentMoney}&quantity=${this.data.quantity}`,
    });
  },
  onLoad: function (options) {
    this.getProduct(options.itemId, options.categoryId);
    if (globalData.badge > 0) {
      this.setData({
        badge: globalData.badge,
        icon: '../../images/trolley-missing.png'
      });
    }
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