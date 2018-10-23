import utils from "../../utils/util.js";
import promoteUtil from "../../utils/promotion.js";
export default {
  data: {
    tabs: [true, false],
    selectedNum: [0, 0],
    enableChecked:[true,true]
  },
  methods: {
    toggleKind(e) {
      this.setData({
        tabs: this.data.tabs.map((item, index) => index === e.target.dataset.index)
      })
    },
    setSelectedNum(isPlus = true, quantity = 1) {
      const selectedNum = this.data.selectedNum.map((item, index) => {
        const kindIndex = this.getCurrentTabsIndex()
        if (index === kindIndex) {
          item = isPlus ? (item + quantity) : (item - quantity)
        }
        return item;
      })
      this.setData({
        selectedNum
      })
    },
    enableChecked(offset = 0) {
      const index = this.getCurrentTabsIndex()
      const num = this.data.selectedNum[index]
      return num + 1 + offset <= this.getCurrentKindMin()
    },
    enableAddTrolley(offset = 0) {
      return !this.data.enableChecked.includes(true)
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
      this.setData({
        [`${kind}.itemList[${index}].${prop}`]: data
      })
    },
    getCurrentData(index) {
      return this.getCurrentKind()[index];
    },
    plusMinus(e) {
      const dataset = e.currentTarget.dataset;
      const index = dataset.index,
        type = dataset.type;
      const currentTrolley = this.getCurrentData(index);
      if (!currentTrolley.checked) {
        return
      }
      const currentNum = currentTrolley.quantity || 1;
      const isMinus = (type === 'minus');
      if ((currentNum === 1) && isMinus) {

        return;
      }
      if (!isMinus && !this.enableChecked()) {

        return
      }

      this.setSelectedNum(!isMinus)
      if ((currentNum === 2 && isMinus) || (currentNum === 1)) {
        this.setComposeProducts({
          index,
          prop: 'active',
          data: !isMinus
        })
      }
      const data = isMinus ? (currentNum - 1) : (currentNum + 1);
      const enableChecked = this.enableChecked()
      this.setComposeProducts({
        index,
        prop: 'addUnactive',
        data: !enableChecked
      })
      this.setData({
        enableChecked:this.data.enableChecked.map((item,index)=>{
          const kindIndex = this.getCurrentTabsIndex();
          return kindIndex===index?enableChecked:item
        })
      })
      const trolley = this.getCurrentKind().map((item, ind) => {
        if (ind === index) {
          item.quantity = data;
          //item.suitePrice = this.getSuitePrice(item);
        }
        return item;
      })
      this.setComposeProducts({
        index,
        prop: 'quantity',
        data
      })
      if (currentTrolley.checked) {
        trolley[index].quantity = data
      } else {
        trolley[index].checked = true
        trolley[index].quantity = data
        // this.selectedRadio.push(trolley[index].groupId);
      }
      this.calcPromote(currentTrolley);
    },
    getItemNum(item) {
      return this.data.isKind ? (item.quantity || 1) : item.minQuantity;
    },
    calcPromote(currentTrolley) {
      if (currentTrolley.checked) {
        const selectedProductList = [];
        let totalPrice = 0;
        const kindData=this.getCurrentKind()
        for (let i = 0; i < kindData.length; i++) {
          for (let m = 0; m < kindData.length; m++) {
            if (kindData[m].checked) {
              const selectedItem = kindData[m];
              selectedProductList.push(selectedItem);
              totalPrice += Number(selectedItem.price * this.getItemNum(selectedItem)) + Number(currentTrolley.price * this.getItemNum(currentTrolley))
            }
          }
        }
        this.setData({
          selectedProductList,
          totalPrice: utils.getFixedNum(totalPrice, 2)
        })
        if (!this.enableAddTrolley()) {
          return;
        }
        let itemGroups = []
        let group = {}

        let groupItems = []
        for (let i = 0; i < this.data.selectedProductList.length; i++) {
          let item1 = {}
          const item = this.data.selectedProductList[i];
          item1.itemId = item.itemId
          item1.brandId = ""
          item1.categoryCode = item.itemCategoryCode
          item1.quantity = item.quantity || item.minQuantity
          item1.unitPrice = item.price
          groupItems.push(item1)
        }
        group.groupId = ""
        group.items = groupItems
        group.promotions = [{
          promotionId: this.promoteInfo.promotionId
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
        this.setData({
          selectedProductList: this.data.selectedProductList,
          totalPrice: this.data.selectedProductList[0].price * this.data.selectedProductList[0].minQuantity
        })
      }
    }

  },
}