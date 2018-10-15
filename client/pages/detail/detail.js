import utils from "../../utils/util.js";
const app = getApp();
const globalData = app.globalData;
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem,
  getRelated = Api.getRelated,
  calcPromote = Api.calcPromote,
  getPromoteInfo = Api.getPromoteInfo;

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
    unionPromotion: false,
    promoteInfo:{
      // promotionType: promoteType["1"],
      // combinationFlag: "0",
      // mainQuantity: 1,
      // promotionDescription: "2箱七喜1箱中普啤酒送1桶惠百真油",
      // promotionName: "test刘双立",
      // endTime: "Thu Oct 31 00:00:00 CST 2019",
      // startTime:"Wed Sep 26 00:00:00 CST 2018",
      // promotionId:"15812"
    },

    autoplay: true,
    interval: 3000,
    duration: 1000,
    minAmount: 500,
    top: 0,
    defImg: getApp().globalData.defaultImg,
    buyTxt: '立即购买',
    specificationList: [{
      specification: '',
      num: 1

    }, ],
    icon: '../../images/trolley-full.png',
    imgManjian: "../../images/manjian.png",
    imgManzeng: "../../images/manzeng.png",
  },
  relatedChange(e){
    //debugger;
  },
  showPromotion() {
    if (this.data.promoteInfo.combinationFlag !== "1" || !this.data.product.putShelvesFlg) return
    let tmpProduct = {}
    tmpProduct.itemImageAddress1 = this.data.product.itemImageAddress1
    tmpProduct.itemName = this.data.product.itemName
    tmpProduct.itemSpecification = this.data.product.itemSpecification
    tmpProduct.quantity = this.data.promoteInfo.mainQuantity
    tmpProduct.price = this.data.product.price
    tmpProduct.itemId = this.data.product.itemId
    tmpProduct.categoryId = this.data.product.itemCategoryCode

    wx.navigateTo({
      url: '/pages/promoteOptions/promoteOptions?promoteInfo=' + JSON.stringify(this.data.promoteInfo) + "&product=" + JSON.stringify(tmpProduct),
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
      quantity:1,
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
    const arr = [{
      itemId: this.data.product.itemId,
      quantity: this.data.quantity,
      categoryCode: this.data.product.itemCategoryCode
    }]
    let para = {
      addGroupList: [{
        count: this.data.quantity,
        addItemList: arr,
        promotions: [{
          promotionId: this.data.promoteInfo.promotionId
        }]
      }]
    }

    utils
      .addToTrolleyByGroup(para)
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
    const locationId = getApp().globalData.merchant.locationId;
    return utils.getRequest(getProductItem, {
      locationId,
      categoryCd: '',
      itemIds: itemId ? itemId : '',
    }).then(data => {
      //console.log(data);
      if (data.status === 200) {
        const result = data.result[0];
        // todo
        // result.putShelvesFlg = true;
        result.itemImageAddress = (Array(5).fill('')).reduce((accumulator,item,index)=>{
          const imgAddress = result['itemImageAddress' + (index + 1)];
          imgAddress !== '' && accumulator.push(`${imgAddress}?x-oss-process=style/750w`);
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
    const locationId = getApp().globalData.merchant.locationId;
    utils.getRequest(getRelated, {
      locationId,
      // itemIds: 1064 
      itemIds: itemId ? itemId : '',
    }).then(data => {
      if (data.status === 200) {
        let result = []
        for (let i = 0; i < data.result.length; i++){
          if (data.result[i].itemId != itemId){
            result.push(data.result[i])
          }
        }
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
      urls: this.data.product.itemImageAddress // 需要预览的图片http链接列表
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

    // let randomNumber = Math.random() * 10000000000
    // group.groupId = "153" + Math.floor(randomNumber)
    let groups = []
    let group = {}
    // group.groupId = "153" + Math.floor(randomNumber)
    group.groupId = ""
    group.count = 1
    group.combinationFlag = false
    group.checked = true
    group.cartCombinationPromotions  = []
    group.items = [this.data.product]
    group.promotions = null
    group.putShelvesFlg = this.data.product.putShelvesFlg
    group.suitePrice = this.data.product.price

    groups.push(group)

    getApp().globalData.items = groups;
    getApp().globalData.items.orderItemSource=0;
    wx.navigateTo({
      url: `../order-confirm/order-confirm?itemId=${this.data.product.itemId}&orderStatus=&total=${this.data.currentMoney}&quantity=${this.data.quantity}`,
    });
  },
  preventTouchMove: function (e) {
    //debugger;
  },
  onLoad: function(options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
    this.getProduct(options)
    .then(data=>{
      this.setData({
        top: getApp().globalData.systemInfo.windowHeight-750
      })
      this.getPromoteInfo(options)
    });
    this.getRelated(options);
    if (getApp().globalData.badge > 0) {
      this.setData({
        badge: getApp().globalData.badge,
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

  },
  gotoTrolley: function () {
    wx.switchTab({
      url: '/pages/trolley/trolley'
    })
  },

  getPromoteInfo: function ({
    itemId,
    categoryId
  }) {
    utils.postRequest({
      url: getPromoteInfo,
      data: {
        merchantId: getApp().getMerchantId(),
        locationId: getApp().globalData.merchant.locationId,
        items: [
          {
            categoryCode: categoryId,
            itemId: itemId
          }
        ],
      }
    })
      .then((data) => {
        if (data.result[0].promotionItems.length > 0){
          this.setData({
            promoteInfo: data.result[0].promotionItems[0],
            hasPromotion: true
          })
          if (data.result[0].promotionItems[0].combinationFlag == "0"){

          } else if (data.result[0].promotionItems[0].combinationFlag == "1"){

          }
        }else{
          this.setData({
            hasPromotion: false
          })
        }
      })
      .catch (errorCode => {
          console.log(errorCode)
          utils.errorHander(errorCode, this.getPromoteInfo, this.emptyFunc, {itemId,categoryId})
            .then(() => {
              
            })
            .catch(() => {
              
            })
      })
  },

  emptyFunc: function () { },
})
