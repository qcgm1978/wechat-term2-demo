import utils from "../../utils/util.js";
const app = getApp();
const globalData = app.globalData;
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem,
  getRelated = Api.getRelated;

Page({
  data: {
    currentMoney: 0,
    badge: 0,
    quantity: 1,
    product: {},
    enableBuy: false,
    promotion: false,
    isSelecting: false,
    hasPromotion: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    minAmount: 500,
    top: globalData.systemInfo.windowHeight,
    defImg: globalData.defaultImg,
    buyTxt: '立即购买',
    specificationList: [{
      specification: '',
      num: 1

    }, ],
    icon: '../../images/trolley-full.png',
  },
  showPromotion() {
    this.setData({
      promotion: true
    })
  },
  plusMinus(e) {
    const dataset = e.currentTarget.dataset;
    const index = dataset.index,
      type = dataset.type;
    const currentNum = this.data.quantity;
    const isMinus = (type === 'minus');
    if ((currentNum === 1) && isMinus) {
      return;
    }
    const num = isMinus ? (currentNum - 1) : (currentNum + 1);
    let currentMoney = num * this.data.product.price;
    let remaining = this.data.minAmount - currentMoney;
    remaining = utils.getFixedNum(remaining)
    const enableBuy = remaining <= 0;
    currentMoney = utils.getFixedNum(currentMoney);
    this.setData({
      quantity: num,
      currentMoney,
      buyTxt: enableBuy ? '立即购买' : `还差￥${remaining}可购买`,
      enableBuy
    })
  },
  
  closePopup() {
    this.setData({
      isSelecting: false,
      buyTxt: '立即购买',
      currentMoney: 0,
      enableBuy: false,
      specificationList: this.data.specificationList.map(item => {
        item.num = 0;
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
      .addToTrolley(this.data.product.itemId)
      .then(badge => {
        this.setData({
          badge,
          icon: '../../images/trolley-missing.png'
        })
      })
  },
  getProduct({
    itemId,
    categoryCd
  }) {
    const locationId = globalData.merchant.locationId;
    utils.getRequest(getProductItem, {
      locationId,
      categoryCd: '',
      itemIds: itemId ? itemId : '',
    }).then(data => {
      console.log(data);
      if (data.status === 200) {
        const result = data.result[0];
        // todo
        // result.putShelvesFlg = true;
        result.itemImageAddress = (Array(5).fill('')).reduce((accumulator,item,index)=>{
          const imgAddress = result['itemImageAddress' + (index + 1)];
          imgAddress!== ''&&accumulator.push(imgAddress);
          return accumulator;
        },[]);
        result.itemImageAddress.length === 0 && result.itemImageAddress.push(this.data.defImg)
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
      utils.errorHander(err, ()=>this.getProduct({
        itemId,
        // categoryId
      }))
      console.log(err);
    })
  },
  getRelated({
    itemId,
    categoryId
  }) {
    const locationId = globalData.merchant.locationId;
    utils.getRequest(getRelated, {
      locationId,
      // itemIds: 1064 
      itemIds: itemId ? itemId : '',
    }).then(data => {
      console.log(data);
      if (data.status === 200) {
        const result = data.result;
        this.setData({
          related: result
        })
      } else {
        // todo
        if (data instanceof Array) {
          this.setData({
            related: data
          });
        }
      }
    }).catch(err => {
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
    if (!this.data.isSelecting && this.data.minAmount > this.data.product.price) {
      return this.setData({
        isSelecting: true,
        buyTxt: `还差￥${this.data.minAmount - this.data.product.price}可购买`,
        currentMoney: this.data.product.price * this.data.quantity
      })
    }
    if (!this.data.enableBuy) {
      return;
    }
    this.data.product.quantity = this.data.quantity;
    globalData.items = this.data.product;
    wx.navigateTo({
      url: `../order-confirm/order-confirm?itemId=${this.data.product.itemId}&orderStatus=&total=${this.data.currentMoney}&quantity=${this.data.quantity}`,
    });
  },
  onLoad: function(options) {
    this.getProduct(options);
    this.getRelated(options);
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