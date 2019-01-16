import utils from "../../utils/util.js";
import promoteUtil from "../../utils/promotion.js";
import Kind from './kind.js'
const app = getApp();
const globalData = app.globalData;
import {
  Api
} from '../../utils/envConf.js'
const getProductItem = Api.getProductItem,
  selectGoods = Api.selectGoods,
  selectGoodsKind = Api.selectGoodsKind;
let promoteInfo = {}
let calcPromoteInfo = {}
Page({
  ...Kind.methods,
  data: {
    ...Kind.data,
    top: getApp().globalData.systemInfo.deviceWindowHeight - 270,
    badge: 0,
    defImg: getApp().globalData.defaultImg,
    imgTrolly: "../../images/trolley-full.png",
    promoteMsg: "",
    composeProducts: [],
    items: {},
    selectedProductList: [],
    totalPrice: 0,
    rightArrow: "./images/grey-arrow.png",
    gray: "#D1D1D2",
    showPromoteDetail: false
  },

  setScrollHeight: function() {

    const query = wx.createSelectorQuery()
    query.select('#promotion-msg-id').boundingClientRect((res) => {
      this.setData({
        scrollHeight: getApp().globalData.systemInfo.deviceWindowHeight - (res.height + 8 + 42 + 85 + 53) * 2
      })
    })
    query.exec()
  },

  onLoad: function(options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }

    let product = JSON.parse(options.product)
    promoteInfo = JSON.parse(options.promoteInfo)
    this.promoteInfo = promoteInfo;
    this.product = product
    const offset = 4

    setTimeout(this.setScrollHeight, 1000);

    this.setData({
      scrollHeight: getApp().globalData.systemInfo.deviceWindowHeight - (42 + 8 + 42 + 85 + 53) * 2 - offset,
      promoteMsg: promoteInfo.promotionName,
      items: product,
      totalPrice: 0,
      isKind: product.isKind,
      kind: options.kind
    })

    if (getApp().globalData.badge > 0) {
      this.setData({
        badge: getApp().globalData.badge,
        icon: '../../images/trolley-missing.png'
      });
    }

    promoteInfo = promoteInfo
    let paraData = {
      itemId: product.itemId,
      categoryId: product.categoryId,
      seriesCode: product.seriesCode,
      promoteInfo
    }
    this.getComposeProducts(paraData)
  },
  getProduct({
    itemId,
    categoryCd
  }) {
    const locationId = getApp().globalData.merchant.locationId;
    utils.getRequest(getProductItem, {
      locationId,
      categoryCd,
      itemIds: '',
    }).then(data => {
      if (data.status === 200) {
        let result = data.result;
        result = result.map(item => {
          item.itemImageAddress1 = (item.itemImageAddress1 && !item.itemImageAddress1.endsWith("gif")) ? item.itemImageAddress1 : this.data.defImg;
          return item;
        })
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
      utils.errorHander(err, () => this.getProduct({
        itemId,
        categoryId
      }))
      console.log(err);
    })
  },

  radioClick(e) {
    const itemId = e.currentTarget.dataset.itemid;
    const itemIndex = e.currentTarget.dataset.index;
    const kind = this.getCurrentKindStr()
    const composeProducts = this.getCurrentKind();
    const currentTrolley = composeProducts[itemIndex]
    const toSelected = !currentTrolley.checked
    const quantity = currentTrolley.quantity
    if (!toSelected) {
      console.log(false)
      this.setData({
        [`${kind}.itemList[${itemIndex}].quantity`]: currentTrolley.minQuantity,
      })
    } else {
      console.log(true)
      // this.setData({
      //   [`${kind}.itemList[${itemIndex}].quantity`]: 1,
      // })
    }
    this.setSelectedNum(toSelected ? 1 : -quantity)
    const enableChecked = this.enableChecked()
    this.setData({
      enableChecked: this.data.enableChecked.map((item, index) => {
        const kindIndex = this.getCurrentTabsIndex();
        return kindIndex === index ? enableChecked : item
      }),
      [`${kind}.itemList[${itemIndex}].active`]: false,
      [`${kind}.itemList[${itemIndex}].addUnactive`]: false,
    })
    for (let i = 0; i < composeProducts.length; i++) {
      if (itemId == composeProducts[i].itemId) {
        
        var item = `${kind}.itemList[` + i + '].checked'
        this.setData({
          [item]: !composeProducts[i].checked
        })
        this.setComposeProducts({
          index: i,
          prop: 'categoryCode',
          data: this.getCurrentKindData().categoryCode
        })
        let selectedProductList = []
        if (composeProducts[i].checked) {
          selectedProductList = [...this.data.selectedProductList, composeProducts[i]]
        } else {
          selectedProductList = this.data.selectedProductList.filter(item => {
            return (item.itemId !== composeProducts[i].itemId) && !item.isGift
          })
        }
        this.setData({
          selectedProductList,
        })
        this.calcPromote(composeProducts[i]);
        break;
      }
    }
  },
  addToTrolley() {
    if (this.enableChecked()) {
      wx.showToast({
        title: '请选择促销商品',
        icon: 'none',
        duration: 2500
      })
      return
    }

    let orderItem = []
    // orderItem.push(this.data.selectedProductList[0])
    // orderItem.push(this.data.selectedProductList[1])
    orderItem = this.data.selectedProductList.filter(item => !item.isGift)
    const arr = orderItem.map(item => ({
      itemId: item.itemId,
      quantity: Number(this.getItemNum(item)),
      categoryCode: item.categoryCode
    }));
    let count = 1
    if (arr.length == 1) {
      count = arr[0].quantity
      arr[0].quantity = 1
    }
    let para = {
      addGroupList: [{
        count,
        addItemList: arr,
        promotions: [{
          promotionId: promoteInfo.promotionId
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

  togglePromoteDetail() {
    if (this.data.showPromoteDetail) {
      this.setData({
        top: getApp().globalData.systemInfo.deviceWindowHeight - 270,
        showPromoteDetail: false
      })
    } else {
      this.setData({
        top: getApp().globalData.systemInfo.deviceWindowHeight - 420,
        showPromoteDetail: true
      })
    }
  },

  getComposeProducts: function({
    itemId,
    categoryId,
    seriesCode,
    promoteInfo
  }) {

    utils.postRequest({
        url: this.data.isKind ? selectGoodsKind : selectGoods,
        data: {
          promotionId: promoteInfo.promotionId,
          item: {
            categoryCode: categoryId,
            itemId,
            seriesCode
          },
        }
      })
      .then(data => {
        if (data.status === 200) {
          if (!this.data.isKind) {
            data = this.convertKindData(data)
          }
          const promotionBase = data.result.promotionBase //扣减依据 - 数量/金额 （1: 数量,  2:金额）
          const isQuantity = promotionBase === 1
          this.setData({
            isQuantity
          })
          const composeProducts = (data.result.combinationItems || []).map(item => ({
            ...item,
            required: item.requireFlag && (promotionBase === 1 ? (item.seriesMinQuantity || item.brandMinQuantity) : (item.seriesMinAmount || item.brandMinAmount)),
            itemList: item.itemList.map(it => ({
              ...it,
              quantity: this.getMinCount(it),
              minQuantity:this.getMinCount(it),
              // quantity: it.requireFlag ? ((isQuantity ? it.minQuantity : Math.ceil(it.minAmount / it.itemPrice)) || 1) : 1,
              checked: it.requireFlag,
            }))
          }))
          const resultItems = data.result.items || data.result.item
          // isBrand is global effective
          const type = (!!resultItems.brandName) ? '品牌' : '系列'
          const items = {
            ...resultItems,
            itemList: resultItems.itemList.map(it => ({
              ...it,
              quantity: this.getMinCount(it),
              minQuantity: this.getMinCount(it),
              // quantity: it.requireFlag ? ((isQuantity ? it.minQuantity : Math.ceil(it.minAmount / it.itemPrice)) || 1) : 1,
              checked: it.requireFlag || it.itemId === this.product.itemId
            }))
          }
          this.setData({
            type,
            promotionBase,
            composeProducts,
            items,
            isQuantity,
            tabs: Array(composeProducts.length + 1).fill('').map((_, index) => !index)
          })
          let enablePromotion = true
          let arr = []
          arr = this.getAllItemLists().map((item, index) => {
            if (item.filter(it => it.requireFlag && (it.inventoryCount===0)).length){
              enablePromotion=false
            }
            return item.filter(it => it.checked || it.itemId === this.product.itemId)
          })
          if (arr.length) {
            const selectedProductList = arr.reduce((accumulator, item) => accumulator.concat(item), [])
            const totalPrice = selectedProductList.reduce((accumulator, item) => accumulator + item.price * item.quantity, 0)
            this.setData({
              selectedNum: arr.map(item => item.length),
              totalPrice: utils.getFixedNum(totalPrice, 2),
              // enableVisible: true,
              selectedProductList: (this.data.isKind ? [] :[this.product]).concat(selectedProductList)
            })
          }
          const enableChecked = [...this.data.enableChecked]
          if (!composeProducts.itemList) {
            enableChecked.pop()
          }
          if (items.categoryMinQuantity === 1) {
            enableChecked[0] = false
          }
          this.setData({
            enableChecked,
            enablePromotion
          })
          this.minNum = data.result.minNumber
          if (!this.enableChecked() && this.data.enablePromotion) {
            // const currentItem = this.getCurrentData(obj.index)
            this.calcPromote(arr);
          }
        } else {}
      }).catch(err => {
        console.log(err);
      })
  },
  gotoTrolley: function() {
    wx.switchTab({
      url: '/pages/trolley/trolley'
    })
  },
  bindfocus() {
    this.setData({
      isInputing: true
    })
  },
  bindblur(e) {
    this.plusMinus(e)
    this.setData({
      isInputing: false
    })
  },
  bindinput() {}
})