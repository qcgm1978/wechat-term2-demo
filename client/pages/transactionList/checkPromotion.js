
import {
  Api
} from '../../utils/envConf.js';
var promoteUtil = require("../../utils/promotion.js");
const getProductItem = Api.getProductItem;
const getPromoteInfo = Api.getPromoteInfo
const selectGoodsKind = Api.selectGoodsKind
const selectGoods = Api.selectGoods

var util = require("../../utils/util.js");
export default {
  methods: {
    getProduct(itemId, categoryCd) {
      const locationId = getApp().globalData.merchant.locationId;
      return util.getRequest(getProductItem + "&start=0&limit=1000", {
        locationId,
        categoryCd: categoryCd ? categoryCd : '',
        itemIds: itemId ? itemId : '',
      }).then(data => {
        if (data.status === 200) {
          let inStock = []
          for (let i = 0; i < data.result.length; i++) {
            if (itemId == data.result[i].itemId) {
              inStock.push(data.result[i]);
            }
          }
          if (inStock.length == 0) {
            let item = {}
            item.putShelvesFlg = false
            inStock.push(item)
          }
          return inStock;
        } else {
        }
      }).catch(err => {
        console.log(err);
      })
    },

    getPutShelfFlag(orderGroups) {
      var promise = new Promise((resolve, reject) => {
        let promisesArr = []
        for (let i = 0; i < orderGroups.length; i++) {
          for (let j = 0; j < orderGroups[i].items.length; j++) {
            promisesArr.push(this.getProduct(orderGroups[i].items[j].itemId, orderGroups[i].items[j].categoryId))
          }
        }
        Promise.all(promisesArr)
          .then(arr => {
            let soldOutNumber = 0
            for (let i = 0; i < arr.length; i++) {
              if (!arr[i][0].putShelvesFlg) {
                soldOutNumber++
              }
            }

            let flag = 0
            if (soldOutNumber == 0) {
            } else if (soldOutNumber != arr.length) {
              flag = 1
            } else if (soldOutNumber == arr.length) {
              flag = 2
            }
            let items = arr
            resolve({ flag, items })
          })
          .catch(e => { })
      })
      return promise
    },


    buyOrderGroupsAgain (orderGroups) {
      this.getPutShelfFlag(orderGroups)
        .then((data) => {
          if (data.flag == 0) {
            //在售
            let para = {
              addGroupList: []
            }
            let promises = []
            for (let i = 0; i < orderGroups.length; i++) {
              promises.push(this.isValidPromotion(orderGroups[i]))
            }

            Promise.all(promises)
              .then((arr) => {
                for (let i = 0; i < arr.length; i++) {
                  if (arr[i].flag) {
                    orderGroups[i].count = 1
                    orderGroups[i].addItemList = []
                    let items = orderGroups[i].items
                    if (items.length == 1) {
                      orderGroups[i].count = items[0].quantity
                      items[0].quantity = 1
                    }else{
                      if (items.length == arr[i].itemsResult.length){
                        for (let j = 0; j < items.length; j++) {
                          items[j].quantity = arr[i].itemsResult[j].minQuantity
                        }
                      }
                    }
                    for (let j = 0; j < items.length; j++) {
                      items[j].categoryCode = items[j].categoryId
                      if (!items[j].gift) {
                        orderGroups[i].addItemList.push(items[j])
                      }
                    }
                    let promotions = []
                    let promotion = {}
                    promotion.promotionId = orderGroups[i].promotionId
                    promotions.push(promotion)
                    orderGroups[i].promotions = promotions
                    orderGroups[i].groupId = null
                    if (orderGroups[i].items && orderGroups[i].items.length > 0) {
                      para.addGroupList.push(orderGroups[i])
                    }
                  } else {
                    for (let j = 0; j < orderGroups[i].items.length; j++) {
                      if (orderGroups[i].items[j].gift) {
                        continue
                      }
                      orderGroups[i].count = 1
                      orderGroups[i].addItemList = []
                      orderGroups[i].items[j].categoryCode = orderGroups[i].items[j].categoryId

                      orderGroups[i].addItemList.push(orderGroups[i].items[j])
                      if (orderGroups[i].items.length == 1) {
                        orderGroups[i].count = orderGroups[i].items[0].quantity
                        orderGroups[i].items[0].quantity = 1
                      }
                      // let promotions = []
                      // let promotion = {}
                      // promotion.promotionId = orderGroups[i].promotionId
                      // promotions.push(promotion)
                      // orderGroups[i].promotions = promotions
                      orderGroups[i].groupId = null
                      orderGroups[i].promotions = null
                      orderGroups[i].promotionId = null
                      let temp = { ...orderGroups[i] }
                      para.addGroupList.push(temp)
                    }
                  }
                }
                util.addToTrolleyByGroup(para, 1, false)
                  .then(badge => {
                    wx.switchTab({
                      url: `/pages/trolley/trolley`,
                    })
                  })
              })
              .catch(() => {
              })
          } else if (data.flag == 1) {
            //部分售完

            util.showModal(`订单中的部分商品卖光了,您是否继续购买其余商品?`).then(() => {
              let para = {
                addGroupList: []
              }
              let promises = []
              for (let i = 0; i < orderGroups.length; i++) {
                let onShelfNumber = 0
                let origItemsLength = 0
                for (let j = 0; j < orderGroups[i].items.length; j++){
                  if (!orderGroups[i].items[j].gift){
                    origItemsLength++
                  }
                }
                orderGroups[i].items = orderGroups[i].items.reduce((accumulator, item) => {
                  item.categoryCode = item.categoryId
                  let isOnShelf = false
                  for (let k = 0; k < data.items.length; k++) {
                    if (data.items[k][0].itemId && item.itemId == data.items[k][0].itemId && !item.gift) {
                      isOnShelf = true
                      onShelfNumber++
                    }
                  }
                  if (isOnShelf) {
                    accumulator.push(item);
                  }
                  return accumulator;
                }, []);

                if (onShelfNumber == origItemsLength) {
                  orderGroups[i].isAllOnShelf = true
                } else {
                  orderGroups[i].isAllOnShelf = false
                }
                if (orderGroups[i].isAllOnShelf) {
                  orderGroups[i].count = 1
                  if (orderGroups[i].items.length == 1) {
                    orderGroups[i].count = orderGroups[i].items[0].quantity
                    orderGroups[i].items[0].quantity = 1
                  }
                  orderGroups[i].addItemList = orderGroups[i].items
                  let promotions = []
                  let promotion = {}
                  promotion.promotionId = orderGroups[i].promotionId
                  promotions.push(promotion)
                  orderGroups[i].promotions = promotions
                  orderGroups[i].groupId = null
                  if (orderGroups[i].items && orderGroups[i].items.length > 0) {
                    let tempOrderGroups = { ...orderGroups[i] }
                    para.addGroupList.push(tempOrderGroups)
                  }
                } else {
                  for (let m = 0; m < orderGroups[i].items.length; m++) {
                    orderGroups[i].count = 1
                    if (orderGroups[i].items.length == 1) {
                      orderGroups[i].count = orderGroups[i].items[0].quantity
                      orderGroups[i].items[0].quantity = 1
                    }
                    let tempItem = {...orderGroups[i].items[m]}
                    orderGroups[i].addItemList = [tempItem]

                    // let promotions = []
                    // let promotion = {}
                    // promotion.promotionId = orderGroups[i].promotionId
                    // promotions.push(promotion)
                    // orderGroups[i].promotions = promotions
                    orderGroups[i].groupId = null
                    orderGroups[i].promotions = null
                    orderGroups[i].promotionId = null
                    let tempOrderGroups = { ...orderGroups[i]}
                    para.addGroupList.push(tempOrderGroups)
                  }
                }

              }
              util.addToTrolleyByGroup(para, 1, false)
                .then(badge => {
                  wx.switchTab({
                    url: `/pages/trolley/trolley`,
                  })
                })
            })
          } else if (data.flag == 2) {
            //全部售完
            util.showModal(`您想购买的商品已下架，无法再次购买`, false);
          }
        })

    },

    getPromoteItemsNumber(items, promotionKind, promotionId, flag) {
      return new Promise((resolve, reject) => {
        if (items.length < 2 || !flag || !promotionId) {
          resolve({flag, count:1})
        }
        let count  = 1
        util.postRequest({
          url: promotionKind == "2" ? selectGoodsKind : selectGoods,
          data: {
            merchantId: getApp().getMerchantId(),
            locationId: getApp().globalData.merchant.locationId,
            promotionId: promotionId,
            item:
              {
                categoryCode: items[0].categoryId,
                itemId: items[0].itemId
              },
          }
          })
          .then(data => {
            if (data.status === 200) {
              let itemsResult = []
              if (promotionKind == "2"){
                for (let i = 0; i < data.result.items.itemList.length; i++) {
                  if (data.result.items.itemList[i].itemId == items[0].itemId) {
                    let tempItem = {}
                    tempItem.itemId = data.result.items.itemList[i].itemId
                    tempItem.minQuantity = data.result.items.itemList[i].minQuantity
                    itemsResult.push(tempItem)
                  }
                }
                if (data.result.combinationItems && data.result.combinationItems.itemList && data.result.combinationItems.itemList.length > 0) {
                  for (let i = 1; i < items.length; i++) {
                    for (let j = 0; j < data.result.combinationItems.itemList.length; j++) {
                      if (data.result.combinationItems.itemList[j].itemId == items[i].itemId) {
                        let tempItem = {}
                        tempItem.itemId = data.result.combinationItems.itemList[j].itemId
                        tempItem.minQuantity = data.result.combinationItems.itemList[j].minQuantity
                        itemsResult.push(tempItem)
                      }
                    }
                  }
                }
              }else{
                let tempItem = {}
                tempItem.itemId = data.result.item.itemId
                tempItem.minQuantity = data.result.item.minQuantity
                itemsResult.push(tempItem)

                if (data.result.conbinationItems && data.result.conbinationItems.length > 0) {
                  for (let i = 1; i < items.length; i++) {
                    for (let j = 0; j < data.result.conbinationItems.length; j++) {
                      if (data.result.conbinationItems[j].itemId == items[i].itemId) {
                        let tempItem = {}
                        tempItem.itemId = data.result.conbinationItems[j].itemId
                        tempItem.minQuantity = data.result.conbinationItems[j].minQuantity
                        itemsResult.push(tempItem)
                      }
                    }
                  }
                }
              }


                // if (itemsResult.length == items.length) {
                //   flag = true
                // } else {
                //   flag = false
                // }
              resolve({ flag, itemsResult} )
            }
          })
          .catch((e) =>{
            reject(e)
          })
      })
    },

    getPromoteInfoFunc(items) {
      return new Promise((resolve, reject) => {
        util.postRequest({
          url: getPromoteInfo,
          data: {
            merchantId: getApp().getMerchantId(),
            locationId: getApp().globalData.merchant.locationId,
            items,
          }
        })
          .then((data) => {
            let promotionFound = 0
            let promotionKind = null
            let promotionId = null
            for (let i = 0; i < items.length; i++){
              if (data.result[i] && data.result[i].promotionItems && data.result[i].promotionItems.length){
                for (let j = 0; j < data.result[i].promotionItems.length; j++) {
                  if (items[i].promotionId == data.result[i].promotionItems[j].promotionId) {
                    promotionKind = data.result[i].promotionItems[j].promotionKind
                    promotionId = data.result[i].promotionItems[j].promotionId
                    promotionFound++
                  }
                }
              }
            }
            if (items.length == promotionFound){
              resolve({ flag: true, promotionKind: promotionKind, promotionId: promotionId, items: items})
            }else{
              resolve({ flag: false, promotionKind: promotionKind, promotionId: promotionId, items: items})
            }
            
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    isValidPromotion (orderGroup) {
      return new Promise((resolve, reject) => {
        let items = []
        for (let j = 0; j < orderGroup.items.length; j++) {
          if (!orderGroup.items.gift) {
            let item = {}
            item.itemId = orderGroup.items[j].itemId
            item.brandId = ""
            item.categoryCode = orderGroup.items[j].categoryId
            item.categoryId = orderGroup.items[j].categoryId
            item.promotionId = orderGroup.items[j].promotionId ? orderGroup.items[j].promotionId : orderGroup.promotionId
            item.quantity = orderGroup.items[j].quantity
            item.unitPrice = orderGroup.items[j].unitPrice
            item.locationId = orderGroup.items[j].locationId
            items.push(item)
          }
        }
      this.getPromoteInfoFunc(items)
        .then((data) => {
          return this.getPromoteItemsNumber(data.items, data.promotionKind, data.promotionId, data.flag)
        })
        .then((data) => {
          resolve(data)  //flag and count
        })
        .catch((e)=>{
          console.log(e)
        })
      })
    }
  }
}