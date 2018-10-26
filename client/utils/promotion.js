import utils from "util.js";
import {
  Api
} from 'envConf.js'
const calcPromote = Api.calcPromote
const getPromoteInfo = Api.getPromoteInfo

exports.calcPromote = function (postData) {
  if (!postData.locationId){
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
        let calcPromoteInfo = data.result[0]
        resolve(calcPromoteInfo.promotionActives.find(item => item.promotionId === postData.itemGroups[0].promotions[0].promotionId))
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
