import promoteUtil from "../../utils/promotion.js";
const app=getApp()
Page({

  /**
   * Page initial data
   */
  data: {
    imgManjian: app.globalData.imgManjian,
    imgManzeng: app.globalData.imgManzeng,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    // todo whether request data or based on passing data
    // this.setData({
    //   promotions: JSON.parse(options.data).data
    // })
    this.calc(JSON.parse(options.data)).then(promotions=>{
      this.setData({
      promotions
    })
    })
  },
  selectGift(e){
    const giftItems = this.data.promotions[e.currentTarget.dataset.index].giftItems.reduce((accumulator, item, index) => {
      const checked = item.inventoryCount > 0 && !accumulator.hasElected
      if (checked) {
        accumulator.hasElected = true
      }
      accumulator.push({
        ...item,
        itemName: item.giftItemName,
        checked,
        itemId: item.giftItemId
      })
      return accumulator
    }, [])
    this.setData({
      isSelectingGift:true,
      giftItems
    })
  },
  radioChange(e) {
    this.setData({
      giftItems: this.data.giftItems.map((item, index) => {
        item.checked = index === +e.detail.value
        return item
      })
    })
  },
  toggleGifts() {
    this.setData({
      isSelectingGift: !this.data.isSelectingGift
    })
  },
  calc(trollyList) {
    return new Promise((resolve, reject) => {
      trollyList = trollyList.filter(item => item.checked && item.putShelvesFlg)
      if (!trollyList.length) {
        return resolve([])
      }
      let promises = []
      let itemGroups = []
      let group = {}

      let groupItems = []
      for (let j = 0; j < trollyList.length; j++) {
        let item = {}
        item.itemId = trollyList[j].items[0].itemId
        item.brandId = trollyList[j].items[0].itemBrandId
        item.seriesCode = trollyList[j].items[0].seriesCode
        item.quantity = trollyList[j].items[0].quantity * (trollyList[j].count ? trollyList[j].count : 1)
        item.unitPrice = +trollyList[j].items[0].price
        groupItems.push(item)
      }

      group.groupId = trollyList[0].groupId
      group.items = groupItems
      itemGroups.push(group)
      promoteUtil.calcPromote({
        itemGroups
      })
        .then(arr => {
          this.setData({
            cartCombinationPromotions: {
              len: arr.length,
              gifts: arr.reduce((accumulator, item) => {
                return accumulator + item.giftItems.length
              }, 0),
              data: arr
            }
          })
          resolve(arr)
        })
        .catch(err => {
          reject()
        })
    })
  },
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {

  }
})