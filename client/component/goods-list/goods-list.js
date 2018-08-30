// component/goods-list/goods-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    disableProperty: { // 属性名
      type: Boolean, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) {
        if(newVal!==oldVal){
          this.setData({
            disable:newVal
          })
        }
       } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    },
    orderProperty: { // 属性名
      type: Object, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: {}, // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) { 
        if(newVal.orderItem){
          this.setData({
            order:newVal
          })
        }
      } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },
  ready: function () {
    debugger;
  },
  /**
   * 组件的方法列表
   */
  methods: {

  }
})
