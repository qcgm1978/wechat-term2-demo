import utils from "../../utils/util.js";
import promoteUtil from "../../utils/promotion.js";
export default {
  data: {
    tabs: [true, false],

  },
  methods: {
    toggleKind(e) {
      this.setData({
        tabs: this.data.tabs.map((item, index) => index === e.target.dataset.index)
      })
    },
    getCurrentTabsIndex() {
      return this.data.tabs.indexOf(true);
    },
    getCurrentKind() {
      const kindIndex = this.getCurrentTabsIndex();
      return this.data.composeProducts[kindIndex].itemList;
    },
    setComposeProducts({
      index,
      prop,
      data
    }) {
      this.setData({
        [`composeProducts[${this.getCurrentTabsIndex()}].itemList[${index}].${prop}`]: data
      })
    },
    getCurrentData(index) {
      return this.getCurrentKind()[index];
    },
    plusMinus(e) {
      const dataset = e.currentTarget.dataset;
      if (!dataset.enabled) {
        return;
      }
      const index = dataset.index,
        type = dataset.type;
      const currentTrolley = this.getCurrentData(index);
      const currentNum = currentTrolley.quantity || currentTrolley.minQuantity;
      const isMinus = (type === 'minus');
      if ((currentNum === 1) && isMinus) {
        return;
      }
      const data = isMinus ? (currentNum - 1) : (currentNum + 1);

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
      //调用计算接口
      // this.callPromotionCacl(trolley, index)
      //   .then((data) => {
      //     trolley[index] = data
      //     var singleGroup = 'trolley[' + index + ']'
      // this.setData({
      //   [singleGroup]: trolley[index]
      // });
      //     this.setMoneyData(this.selectedRadio);
      //   })
      // for (let i = 0; i < trolley[index].items.length; i++) {
      //   trolley[index].items[i].categoryCode = trolley[index].items[i].itemCategoryCode
      // }

      // let para = {
      //   addGroupList: [{
      //     quantity: isMinus ? -1 : 1,
      //     addItemList: trolley[index].items,
      //   }]
      // }

      // utils
      //   .addToTrolleyByGroup(para)
      //   .then(badge => {
      //     utils.updateTrolleyNum();
      //   })
    },
    calcPromote(currentTrolley) {
      if (currentTrolley.checked) {
        const selectedProductList = [];
        let totalPrice = 0;
        for (let i = 0; i < this.data.composeProducts.length; i++) {
          for (let m = 0; m < this.data.composeProducts[i].itemList.length; m++) {
            if (this.data.composeProducts[i].itemList[m].checked) {
              const selectedItem = this.data.composeProducts[i].itemList[m];
              selectedProductList.push(selectedItem);
              totalPrice += Number(selectedItem.price * selectedItem.minQuantity) + Number(currentTrolley.price * currentTrolley.minQuantity)
            }
          }
        }
        this.setData({
          selectedProductList,
          totalPrice: utils.getFixedNum(totalPrice, 2)
        })

        let itemGroups = []
        let group = {}

        let groupItems = []
        for (let i = 0; i < this.data.selectedProductList.length; i++) {
          let item1 = {}
          const item = this.data.selectedProductList[i];
          item1.itemId = item.itemId
          item1.brandId = ""
          item1.categoryCode = item.itemCategoryCode
          item1.quantity = item.quantity||item.minQuantity
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