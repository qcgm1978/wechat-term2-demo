//app.js
export default {
  onLaunch: function (options) {
    wx.getSystemInfo({
      success: res => {
        this.globalData.systemInfo.windowHeight = res.windowHeight
        this.globalData.systemInfo.windowWidth = res.windowWidth
      },
      fail: res => {
        console.log("getSystemInfo failed")
        wx.showToast({
          title: '获取设备信息失败',
          icon: 'info',
          duration: 2000
        })
      },
      
    })

    try {
      this.globalData.scene = options.scene;
      this.globalData.token.jscode = wx.getStorageSync('jscode')
      this.globalData.token.accessToken = wx.getStorageSync('accessToken')
      this.globalData.token.refreshToken = wx.getStorageSync('refreshToken')
      this.globalData.token.payCodeToken = wx.getStorageSync('payCodeToken')
      this.globalData.userInfo.memberId = wx.getStorageSync('memberId')
      this.globalData.userInfo.mobile = wx.getStorageSync('mobile')
      
      this.globalData.userInfo.registerStatus = wx.getStorageSync('registerStatus')
      this.globalData.userInfo.savedInDBStatus = wx.getStorageSync('savedInDBStatus')
      this.globalData.userInfo.gender = wx.getStorageSync('gender')
    } catch (e) {
      console.log(e)
    }

  },
  onShow(options) {
    // debugger;
    // if (options.scene == 1034) {
    //   return wx.navigateTo({
    //     url: '/pages/member/member',

    //   })
    // }
    // this.checkProgramUpdate();
  },
  failConsole(res = '', callback = () => { }) {
    console.log('拉取用户openid失败，将无法正常使用开放接口等服务', res);
    callback(res);
  },
  // lazy loading openid
  
  loginCaller() {
    this.login()

  },
  checkProgramUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        // console.log(res.hasUpdate);
        if (res.hasUpdate) {
          wx.showLoading({
            title: '正在下载新版本'
          })
        }
      })
      updateManager.onUpdateReady(function () {
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
      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
      });
    }
  },
  //function should be called when member in logout state
  getJsCode: function () {
    if (this.globalData.token.jscode) {
      wx.checkSession({
        success: () => {
          //session_key未过期，并且在本生命周期一直有效
          this.loginCaller()
        },
        fail: () => {
          //session_key已过期，需要重新执行登录流程
          this.loginCaller()
        }
      })
    } else {
      this.loginCaller()
    }
  },

  login: function () {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          if (res.code) {
            this.globalData.token.jscode = res.code

            try {
              wx.setStorageSync('jscode', res.code)
            } catch (e) { }
            resolve()
          } else {
            reject()
          }

        },
        fail: res => {
          reject()
          wx.showModal({
            title: '提示',
            content: '微信登录失败！',
            showCancel: false,
            success: res => { }
          })
        },
        complete() {
          wx.hideLoading();

        }
      })
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