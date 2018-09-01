// component/goods-list/goods-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    productTarget: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal) {
          this.setData({
            target: 'product'
          })
      }
    },
    orderProperty: { // 属性名
      type: Object, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: {}, // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function(newVal, oldVal) {
        if (Object.keys(newVal).length) {
          this.setData({
            items: newVal.orderId ? newVal.orderItem : newVal.items,
          });
        }
        if (this.data.enableTap) {
          if (this.data.target==='product') {
            this.setData({
              url: `../detail/detail?itemId=${newVal.item_id}`
            })
          } else if (newVal.item_id) {
            this.setData({
              url: `../transactionDetail/transactionDetail?orderId=${newVal.orderId}`
            });
          }
        }
      } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    },
    enableTap: {
      type: Boolean,
      value: true,
      observer(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.setData({
            enableTap: newVal
          })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    url: ''
  },
  ready: function() {
    // debugger;
  },
  /**
   * 组件的方法列表
   */
  methods: {

  }
})