export default {

  onShow(options) {
    // debugger;
    // if (options.scene == 1034) {
    //   return wx.navigateTo({
    //     url: '/pages/member/member',

    //   })
    // }
    // this.checkProgramUpdate();
  },
  failConsole(res = '', callback = () => {}) {
    console.log('拉取用户openid失败，将无法正常使用开放接口等服务', res);
    callback(res);
  },
  checkProgramUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function(res) {
        // 请求完新版本信息的回调
        // console.log(res.hasUpdate);
        if (res.hasUpdate) {
          wx.showLoading({
            title: '正在下载新版本'
          })
        }
      })
      updateManager.onUpdateReady(function() {
        updateManager.applyUpdate()
        // wx.showModal({
        //   title: '更新提示',
        //   content: '新版本已经准备好，是否重启应用？',
        //   success: function (res) {
        //     if (res.confirm) {
        //       // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        //       updateManager.applyUpdate()
        //     }
        //   }
        // });
      })
      updateManager.onUpdateFailed(function() {
        // 新的版本下载失败
      });
    }
  },
  //function should be called when member in logout state
  getJsCode() {
    this.login()
  },

  login() {
    wx.login({
      success: res => {
        if (res.code) {
          getApp().globalData.token.jscode = res.code
          try {
            wx.setStorageSync('jscode', res.code)
          } catch (e) {}
        } else {
        }
      },
      fail: res => {
        wx.showModal({
          title: '提示',
          content: '微信登录失败！',
          showCancel: false,
          success: res => {}
        })
      }
    })
  },

  globalData: {
    systemInfo: {},
    // getApp().globalData.systemInfo.windowHeight
    // getApp().globalData.systemInfo.windowWidth
    token: {},
    userInfo: {}
  }
}