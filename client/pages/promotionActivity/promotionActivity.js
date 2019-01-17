import promoteUtil from "../../utils/promotion.js";
const app = getApp()
Page({
  data: {
    imgManjian: app.globalData.imgManjian,
    imgManzeng: app.globalData.imgManzeng,
  },
  onLoad: function(options) {
    // todo whether request data or based on passing data
    // this.setData({
    //   promotions: JSON.parse(options.data).data
    // })
    this.calc(JSON.parse(options.data)).then((promotions) => {
      this.setData({
        promotions: promotions.map(item => ({
          ...item,
          visibleGifts: item.giftItems && item.giftItems.filter(it => it.inventoryCount !== '0')
        }))
      })
    })
  },
  selectGift(e) {
    this.index = e.currentTarget.dataset.index
    const giftItems = this.data.promotions[this.index].giftItems.reduce((accumulator, item, index) => {
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
      isSelectingGift: true,
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
      isSelectingGift: !this.data.isSelectingGift,
      [`promotions[${this.index}].giftItems`]: this.data.giftItems
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
        .then(data => {
          const arr = data.promotions
          this.setData({
            cartCombinationPromotions: {
              len: arr.length,
              // gifts: arr.reduce((accumulator, item) => {
              //   return accumulator + item.giftItems.length
              // }, 0),
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
    // console.log(getCurrentPages().slice(-2, -1)[0] ? getCurrentPages().slice(-2, -1)[0].route : '' )
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
    // save gifts selection state for generating order
    getApp().globalData.activityItems = this.data.promotions
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
  onShareAppMessage(res) {
    // if (res.from === 'button') {
    //   // 来自页面内转发按钮
    //   console.log(res.target)
    // }
    // return {
    //   title: '自定义转发标题',
    //   path: '/page/user?id=123'
    // }
  },
})