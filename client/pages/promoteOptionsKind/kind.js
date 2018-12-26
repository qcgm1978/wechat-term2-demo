import utils from "../../utils/util.js";
import promoteUtil from "../../utils/promotion.js";
export default {
  data: {
    scrollHeight:0,
    totalDiscountAmount: 0,
    enableVisible: false,
    tabs: [true, false],
    selectedNum: [0, 0],
    enableChecked: [true, true],
    dataLoading : false,
    isInputing: false
  },
  methods: {
    toggleKind(e) {
      if (this.data.isInputing){
        return
      }
      this.setData({
        tabs: this.data.tabs.map((item, index) => index === e.target.dataset.index)
      })
    },
    setSelectedNum(changed) {
      const selectedNum = this.data.selectedNum.map((item, index) => {
        const kindIndex = this.getCurrentTabsIndex()
        if (index === kindIndex) {
          item += changed
        }
        return item;
      })
      this.setData({
        selectedNum
      })
    },
    enableChecked(offset = 0) {
      if (this.data.isQuantity) {
        const index = this.getCurrentTabsIndex()
        const num = this.data.selectedNum[index]
        return num + 1 + offset <= this.getCurrentKindMin()
      } else {
        const totalPrice = this.getTotalPrice()
        return totalPrice < this.minNum
      }
    },
    enablePlus(offset = 0) {
      if (this.data.isQuantity) {
        const index = this.getCurrentTabsIndex()
        const num = this.data.selectedNum[index]
        //return num + 1 + offset <= this.getCurrentKindMin()
        return true
      } else {
        return true
      }
    },
    enableAddTrolley(offset = 0) {
      return this.data.enableChecked.includes(true)
    },
    getCurrentTabsIndex() {
      return this.data.tabs.indexOf(true);
    },
    getCurrentKindName() {
      const kindIndex = this.getCurrentTabsIndex();
      return kindIndex ? 'composeProducts' : 'items'
    },
    getCurrentKindMin(kindName = this.getCurrentKindName()) {
      return this.data[kindName].categoryMinQuantity
    },
    getCurrentKind() {
      const kindData = this.getCurrentKindName()
      return this.data[kindData].itemList;
    },
    setComposeProducts({
      index,
      prop,
      data
    }) {
      const kindIndex = this.getCurrentTabsIndex();
      const kind = kindIndex ? `composeProducts` : `items`
      const currentItem = `${kind}.itemList[${index}]`
      this.setData({
        [`${currentItem}.${prop}`]: data
      })
      
    },
    getCurrentData(index) {
      return this.getCurrentKind()[index];
    },
    plusMinus(e) {
      const dataset = e.currentTarget.dataset;
      const index = dataset.index
      const type = dataset.type;
      const currentTrolley = this.getCurrentData(index);
      const currentNum = currentTrolley.quantity || 1;
      if (!currentTrolley.checked) {
        if (e.detail.value){
          this.setComposeProducts({
            index,
            prop: 'quantity',
            data: currentNum
          })
        }
        this.setData({
          isInputing: false
        })
        return
      }
      const isMinus = (type === 'minus');
      if ((currentNum === 1) && isMinus) {
        this.setData({
          isInputing: false
        })
        return;
      }
      if (!isMinus && !this.enablePlus()) {
        this.setData({
          isInputing: false
        })
        return
      }
      const isInputChange = e.detail.value !== undefined
      const changed = isInputChange ? (+e.detail.value - currentNum) : (isMinus ?  - 1 :  1)
      this.setSelectedNum(changed)
      if ((currentNum === 2 && isMinus) || (currentNum === 1)) {
        this.setComposeProducts({
          index,
          prop: 'active',
          data: !isMinus
        })
      }
      const enableChecked = this.enableChecked()
      this.setData({
        enableChecked: this.data.enableChecked.map((item, index) => {
          const kindIndex = this.getCurrentTabsIndex();
          return kindIndex === index ? enableChecked : item
        })
      })
      const data=currentNum+changed
      this.setComposeProducts({
        index,
        prop: 'quantity',
        data
      })
      const selectedProductList = this.data.selectedProductList.map(item => {
        if (item.itemId === currentTrolley.itemId) {
          item.quantity = data
        }
        return item
      })
      this.setData({
        selectedProductList
      })
      this.calcPromote(currentTrolley);
    },
    getItemNum(item) {
      return this.data.isKind ? (item.quantity || 1) : item.minQuantity;
    },
    getTotalPrice(){
      const seletedItems = this.data.items.itemList.concat(this.data.composeProducts.itemList || []).filter(item => item.checked)
      return seletedItems.reduce((accumulator, item) => Number(accumulator) + Number(item.price * (item.quantity || 1)), 0)
    },
    setPrice(currentTrolley) {
        const totalPrice=this.getTotalPrice()
        this.setData({
          totalPrice: utils.getFixedNum(totalPrice, 2),
          enableVisible: true
        })
    },
    calcPromote(currentTrolley) {
      if (this.data.dataLoading) {
        this.setData({
          isInputing: false
        })
        return
      }
      this.setData({
        dataLoading: true
      })
      wx.showLoading({
        title: '请等待',
      })
      if (this.data.isQuantity ? this.enableAddTrolley():this.enableChecked()) {
        const selectedProductList = this.data.selectedProductList.filter(item => {
          wx.hideLoading()
          this.setData({
            dataLoading: false,
            isInputing: false
          })
          return !item.isGift
        })
        this.setData({
          enableVisible: false,
          selectedProductList
        })
        wx.hideLoading()
        this.setData({
          dataLoading: false,
          isInputing: false
        })
        return;
      }
      this.setPrice(currentTrolley)
      let itemGroups = []
      let group = {}

      let groupItems = []
      if (this.data.selectedProductList.length>1){
        for (let i = 0; i < this.data.selectedProductList.length; i++) {
          if (!this.data.selectedProductList[i].isGift){
            let item1 = {}
            const item = this.data.selectedProductList[i];
            item1.itemId = item.itemId
            item1.brandId = ""
            item1.categoryCode = item.categoryCode
            item1.quantity = item.quantity || item.minQuantity
            item1.unitPrice = item.price
            groupItems.push(item1)
          }
        }
        group.promotions = [{
          promotionId: this.promoteInfo.promotionId
        }]
      }else{
        for (let i = 0; i < this.data.selectedProductList.length; i++) {
          if (!this.data.selectedProductList[i].isGift) {
            let item1 = {}
            const item = this.data.selectedProductList[i];
            item1.itemId = item.itemId
            item1.brandId = ""
            item1.categoryCode = item.categoryCode
            item1.quantity = item.quantity || item.minQuantity
            item1.unitPrice = item.price
            item1.itemPromotions = [{
              itemPromotionId: this.promoteInfo.promotionId
            }]
            groupItems.push(item1)
          }
        }
      }
      group.groupId = ""
      group.items = groupItems
      // group.promotions = [{
      //   promotionId: this.promoteInfo.promotionId
      // }]
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
            let productListWithoutGift = this.data.selectedProductList.filter(item => {
              return !item.isGift
            })
            const selectedProductList = [...productListWithoutGift, promoteResult.giftItems[0]]
            this.setData({
              selectedProductList,
              totalDiscountAmount: promoteResult.totalDiscountAmount || 0
            })

          } else if (promoteResult.discountAmount > 0) { //满减
            this.setData({
              totalDiscountAmount: utils.getFixedNum(promoteResult.discountAmount,2),
            })
          }
          wx.hideLoading()
          this.setData({
            dataLoading: false,
            isInputing:false
          })
        })
        .catch(() => {
          this.setData({
            dataLoading: false,
            isInputing: false
          })
          wx.hideLoading()
        })

    }

  },
}