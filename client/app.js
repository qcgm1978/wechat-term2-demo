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

  login({
    success,
    error
  }={
    success(data){
      getApp().globalData.userInfo=data.userInfo;
      // debugger;
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