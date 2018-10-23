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
    this.setData({
      promoteMsg: promoteInfo.promotionName,
      items: product,
      'selectedProductList[0]': product,
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
      //console.log(data);
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
      // isSelected&&this.setSelectedNum(false)
      this.setData({
        [`${kind}.itemList[${itemIndex}].checked`]: false,
      })
      return;
    }
    this.setSelectedNum(toSelected, toSelected?1: quantity)
    loop1:
      for (let i = 0; i < composeProducts.length; i++) {
        if (itemId == composeProducts[i].itemId) {
          if (composeProducts[i].checked) {
            // if (this.data.selectedProductList.length == 3) {
            // this.data.selectedProductList.splice(2, 1);
            // this.setData({
            //   selectedProductList: this.data.selectedProductList
            // })
            // }
            if (!this.data.isKind) {
              var item = `${kind}.itemList[` + i + '].checked'
              this.setData({
                [item]: false
              })
            }
            // break loop1;
          }
          var item = `${kind}.itemList[` + i + '].checked'
          this.setData({
            [item]: !composeProducts[i].checked
          })
          if (composeProducts[i].checked) {
            const selectedProductList = [];
            let totalPrice = 0;
            // const arr = this.data.items.itemList.concat(this.data.composeProducts.itemList)
            let itemsChecked = 0,
              combinationItemsChecked = 0;
            // for (let i = 0; i < arr.length; i++) {
            // if (arr[i].checked && composeProducts[i]) {
            let selectedItem = composeProducts[i];
            // if(i<this.data.items.length){
            selectedItem.categoryCode = composeProducts.categoryCode;

            selectedProductList.push(selectedItem);
            totalPrice += Number(selectedItem.price * this.getItemNum(selectedItem)) + Number(composeProducts[i].price * this.getItemNum(composeProducts[i]))
            // }
            // }
            this.setData({
              selectedProductList,
              totalPrice: utils.getFixedNum(totalPrice, 2),
            })

            let itemGroups = []
            let group = {}

            let groupItems = []
            for (let i = 0; i < this.data.selectedProductList.length; i++) {
              let item1 = {}
              item1.itemId = this.data.selectedProductList[i].itemId
              item1.brandId = ""
              item1.categoryCode = this.data.selectedProductList[i].categoryCode
              item1.quantity = this.getItemNum(selectedProductList[i])
              item1.unitPrice = this.data.selectedProductList[i].price
              groupItems.push(item1)
            }
            group.groupId = ""
            group.items = groupItems
            group.promotions = [{
              promotionId: promoteInfo.promotionId
            }]
            itemGroups.push(group)

            promoteUtil.calcPromote({
                itemGroups
              })
              .then((promoteResult) => {
                //满赠

                if (promoteResult.giftItems && promoteResult.giftItems.length > 0) {
                  promoteResult.giftItems[0].minQuantity = promoteResult.giftItems[0].quantity
                  promoteResult.giftItems[0].itemName = promoteResult.giftItems[0].giftItemName
                  promoteResult.giftItems[0].price = 0
                  promoteResult.giftItems[0].isGift = true
                  this.setData({
                    'selectedProductList[2]': promoteResult.giftItems[0]
                  })

                } else if (promoteResult.discountAmount > 0) { //满减

                }
              })
              .catch(() => {

              })
          } else {
            this.data.selectedProductList.splice(1, 2);
            const selectedProductList = this.data.selectedProductList
            if (selectedProductList.length) {
              this.setData({
                selectedProductList,
                totalPrice: selectedProductList[0].price * this.getItemNum(selectedProductList[0])
              })
            }
          }
          // todo temp highlight all radio clicked 
          // this.setData({
          //   gray: "#EE711F"
          // })
          break;
        }
      }
  },
  addToTrolley() {
    if (this.data.selectedProductList.length == 1) {
      wx.showToast({
        title: '请选择促销商品',
        icon: 'none',
        duration: 2500
      })
      return
    }

    let orderItem = []
    orderItem.push(this.data.selectedProductList[0])
    orderItem.push(this.data.selectedProductList[1])
    const arr = orderItem.map(item => ({
      itemId: item.itemId,
      quantity: Number(this.getItemNum(item)),
      categoryCode: item.itemCategoryCode
    }));

    let para = {
      addGroupList: [{
        count: 1,
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
          const composeProducts = data.result.conbinationItems
          let index = undefined
          if (this.data.isKind) {
            [index] = composeProducts.itemList.reduce((accumulator, item, index) => {
              if (item.itemId === this.product.itemId) {
                accumulator.push(index);
              }
              return accumulator
            }, []);
          }
          const items = data.result.items || data.result.item
          this.setData({
            composeProducts,
            items,
            'selectedProductList[0]': data.result.items.itemList[0] || data.result.item,
            dataForLoop: items.itemList.concat(composeProducts.itemList)
          })
          if (index !== undefined) {
            this.setComposeProducts({
              index,
              prop: 'checked',
              data: true
            });
          }
          this.minNum = data.result.minNumber
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