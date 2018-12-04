import utils from "util.js";
import {
  Api
} from 'envConf.js'
const calcPromote = Api.calcPromote
const getPromoteInfo = Api.getPromoteInfo
let calcPromoteFunc = null
exports.calcPromote = calcPromoteFunc = function (postData) {
  if (!postData.locationId) {
    postData.locationId = getApp().globalData.merchant.locationId
  }
  if (!postData.merchantId) {
    postData.merchantId = getApp().getMerchantId()
  }
  return new Promise((resolve, reject) => {
    let promotionResult = {}
    utils.postRequest({
      url: calcPromote,
      data: postData
    })
      .then(data => {
        if (data.status === 200) {
          // console.log(JSON.stringify(data))
          let calcPromoteInfo = data.result[0]
          let ret = null
          if (postData.itemGroups[0].promotions && postData.itemGroups[0].promotions.length > 0 && postData.itemGroups[0].promotions[0] && postData.itemGroups[0].promotions[0].promotionId) {
            ret = calcPromoteInfo.promotionActives.find(item => item.promotionId === postData.itemGroups[0].promotions[0].promotionId)
          } else {
            ret = calcPromoteInfo.promotionActives && calcPromoteInfo.promotionActives.length > 0 ? calcPromoteInfo.promotionActives[0] : null
          }
          resolve(calcPromoteInfo.promotionActives ? ret : calcPromoteInfo.promotionActives[0])
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

