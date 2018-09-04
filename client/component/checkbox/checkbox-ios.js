// component/checkbox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    checked:true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changechecked(){
      this.setData({
        checked:!this.data.checked
      });
      var myEventDetail = { checked: this.data.checked} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('changechecked', myEventDetail, myEventOption)
    }
  }
})
