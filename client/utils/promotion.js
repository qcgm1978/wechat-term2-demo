import utils from "util.js";
import {
  Api
} from 'envConf.js'
const calcPromote = Api.calcPromote
const getPromoteInfo = Api.getPromoteInfo

exports.calcPromote = function () {
  return new Promise((resolve, reject) => {
  let promotionResult = {
    }
  utils.postRequest({
    url: calcPromote,
    data: {
    }
  })
    .then(data => {
      if (data.status === 200) {
        let calcPromoteInfo = data.result[0]
        //满赠
        if (calcPromoteInfo.promotionActives[0].giftitems.length > 0) {
          let tempGift = calcPromoteInfo.promotionActives[0].giftitems[0]
          let freeGift = {}
          freeGift.itemId = tempGift.giftItemId
          freeGift.itemImageAddress1 = tempGift.itemImageAddress1 ? tempGift.itemImageAddress1 : getApp().globalData.defaultImg
          freeGift.itemName = tempGift.giftItemName
          freeGift.price= 0
          freeGift.itemSpecification = tempGift.itemUnit
          freeGift.minQuantity = tempGift.quantity
          freeGift.isfree= true
          // freeGift.itemCategoryCode = "1201001"
          promotionResult.freeGift = freeGift
        } else if (calcPromoteInfo.promotionActives[0].discountAmount > 0) { //满减
          console.log("afasdfsadfsdf满减满减满减满减")
          promotionResult.discountAmount = calcPromoteInfo.promotionActives[0].discountAmount
        }
        resolve(promotionResult)
      } else {
        reject()
      }
    }).catch(err => {
      console.log(err);
      reject()
    })
  })
}

exports.getPromoteInfo = function (
  itemId,
  categoryId
) {
  return new Promise((resolve, reject) => {
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
        resolve(data.result[0].promotionItems[0])
      })
      .catch(errorCode => {
        reject()
      })
  })
}
