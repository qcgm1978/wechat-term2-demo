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
    getCurrentTabsIndex(){
      return this.data.tabs.indexOf(true);
    },
    getCurrentKind() {
      const kindIndex = this.getCurrentTabsIndex();
      return this.data.composeProducts[kindIndex].itemList;
    },
    setComposeProducts({index,prop,data}){
      this.setData({
        [`composeProducts[${this.getCurrentTabsIndex()}].itemList[${index}].${prop}`]:data
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
      this.setComposeProducts({index,prop:'quantity',data})
      if (currentTrolley.checked) {
        trolley[index].quantity = data
      } else {
        trolley[index].checked = true
        trolley[index].quantity = data
        // this.selectedRadio.push(trolley[index].groupId);
      }

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
  },
}