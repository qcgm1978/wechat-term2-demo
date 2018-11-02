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
    const offset=4
    this.setData({
      scrollHeight: wx.getSystemInfoSync().windowHeight * 2 - 42 * 2 - 16 - 68 * 2 - 50 * 2-offset,
      promoteMsg: promoteInfo.promotionName,
      items: product,
      // 'selectedProductList[0]': product,
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
    const kind = this.getCurrentKindName()
    const composeProducts = this.getCurrentKind();
    const toSelected = !composeProducts[itemIndex].checked
    const quantity = composeProducts[itemIndex].quantity
    if (!toSelected) {
      this.setData({
        [`${kind}.itemList[${itemIndex}].quantity`]: 1,
      })
    }
    if (toSelected && !this.enableChecked()) {
      this.setData({
        [`${kind}.itemList[${itemIndex}].checked`]: false,
      })
      return;
    }
    this.setSelectedNum(toSelected, toSelected ? 1 : quantity)
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
          if (composeProducts[i].checked) {
            if (!this.data.isKind) {
              var item = `${kind}.itemList[` + i + '].checked'
              this.setData({
                [item]: false
              })
            }
          }
          var item = `${kind}.itemList[` + i + '].checked'
          this.setData({
            [item]: !composeProducts[i].checked
          })
          this.setComposeProducts({
            index: i,
            prop: 'categoryCode',
            data: this.data[kind].categoryCode
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
    if (arr.length == 1){
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
    promoteInfo
  }) {
    let tmpData = {
      merchantId: getApp().getMerchantId(),
      locationId: getApp().globalData.merchant.locationId,
      promotionId: promoteInfo.promotionId,
      item: {
        categoryCode: categoryId,
        itemId: itemId
      },
    }

    utils.postRequest({
        url: this.data.isKind ? selectGoodsKind : selectGoods,
        data: {
          merchantId: getApp().getMerchantId(),
          locationId: getApp().globalData.merchant.locationId,
          promotionId: promoteInfo.promotionId,
          item: {
            categoryCode: categoryId,
            itemId: itemId
          },
        }
      })
      .then(data => {
        if (data.status === 200) {
          const composeProducts = data.result.combinationItems || []
          const items = data.result.items || data.result.item
          let obj = {}
          if (this.data.isKind) {
            obj = items.itemList.reduce((accumulator, item, index) => {
              if (item.itemId === this.product.itemId) {
                accumulator = {
                  price: item.price,
                  index
                };
              }
              return accumulator
            }, {});
          }
          this.setData({
            composeProducts,
            items,
            isQuantity: data.result.promotionBase===1
          })
          if (Object.keys(obj).length) {
            this.setComposeProducts({
              index: obj.index,
              prop: 'checked',
              data: true
            });
            this.setComposeProducts({
              index: obj.index,
              prop: 'categoryCode',
              data: items.categoryCode
            });
            this.setData({
              selectedNum: [1, 0],
              totalPrice: utils.getFixedNum(obj.price, 2),
              selectedProductList: [this.data.items.itemList[obj.index]]
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
            enableChecked
          })
          this.minNum = data.result.minNumber
          if(!this.enableChecked()){
            const currentItem = this.getCurrentData(obj.index)
            this.calcPromote(currentItem);
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
})