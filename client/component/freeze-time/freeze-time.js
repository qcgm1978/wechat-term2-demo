// component/freeze-time/freeze-time.js
import { verifyClientFreezing} from '../../utils/freezing.js'
Component({
  /**
   * Component properties
   */
  properties: {
    isToOpen: { // 属性名
      type: Boolean, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: true, // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function(newVal, oldVal, changedPath) {
        if (newVal !== oldVal) {
          if (this.data.init) {
            verifyClientFreezing()
          } else {
            this.setData({
              isToOpen: newVal
            })
          }
        } else {

        }
        // debugger;
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
      }
    },
  },
  /**
   * Component initial data
   */
  data: {
    isFreezing: true,
    toOpen: true,
    height: getApp().globalData.systemInfo.windowHeight,
    init: true,
  },
  /**
   * Component methods
   */
  methods: {
    disableScroll() {
      // debugger
    },
    close() {
      this.setData({
        isToOpen: false
      })
    }
  }
})