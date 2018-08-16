//app.js
import appUtil from './app-util.js'
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')
const getUserInfo = require('./pages/home/getUserInfo').default;
const websocket = require('./pages/home/ws').default;

let userInfo

App({
  
  ...getUserInfo,
  ...websocket,
  // globalData: {
  //   userInfo: null,
    
  // },
  globalData: {
    systemInfo: {},
    // getApp().globalData.systemInfo.windowHeight
    // getApp().globalData.systemInfo.windowWidth
    token: {},
    userInfo: {}
  },
  onLaunch: function (options) {
    // wx.setEnableDebug({
    //   enableDebug: true
    // });
    appUtil.onLaunch(options)
    qcloud.setLoginUrl(config.service.loginUrl);
    this.login();
    // this.runWebSocket()  // 加载websocket操作    
  },
  onShow(){
    this.checkProgramUpdate();
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
  login({
    success,
    error
  }={
    success(data){
      getApp().globalData.userInfo=data.userInfo;
      // debugger;
    },
    error(err){
      debugger;
    }
  }) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo'] === false) {
          // 已拒绝授权
          wx.showModal({
            title: '提示',
            content: '请授权我们获取您的用户信息',
            showCancel: false,
            success: () => {
              wx.openSetting({
                success: res => {
                  if (res.authSetting['scope.userInfo'] === true) {
                    this.doQcloudLogin({
                      success,
                      error
                    })
                  }
                }
              })
            }
          })
        } else {
          this.doQcloudLogin({
            success,
            error
          })
        }
      }
    })
  },

  doQcloudLogin({
    success,
    error
  }) {
    // 调用 qcloud 登陆接口
    qcloud.login({
      success: result => {
        if (result) {
          userInfo = result

          success && success({
            userInfo
          })
        } else {
          // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
          this.getUserInfo({
            success,
            error
          })
        }
      },
      fail: (error) => {
        if (error) {
          // throw error;
        }
      }
    })
  },

  getUserInfo({
    success,
    error
  }) {
    if (userInfo) return userInfo
    qcloud.request({
      url: config.service.user,
      login: true,
      success: result => {
        let data = result.data

        if (!data.code) {
          userInfo = data.data

          success && success({
            userInfo
          })
        } else {
          error && error()
        }
      },
      fail: (err) => {
        error && error();
        if (err instanceof Error) {
          throw err;
        }
      }
    })
  },

  checkSession({
    success,
    error
  }) {
    const userInfo = this.globalData.userInfo;
    if (userInfo) {
      return success && success({
        userInfo
      })
    }

    wx.checkSession({
      success: () => {
        // 注意：此接口有调整，使用该接口将不再出现授权弹窗，请使用 <button open-type="getUserInfo"></button> 引导用户主动进行授权操作
        // this.getUserInfo({
        //   success: res => {
        //     userInfo = res.userInfo

        //     success && success({
        //       userInfo
        //     })
        //   },
        //   fail: () => {
        //     error && error()
        //   }
        // })
      },
      fail: () => {
        error && error()
      }
    })
  }

})