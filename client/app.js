import Touches from './utils/Touches.js'
import appUtil from './app-util.js';
const getUserInfo = require('./pages/home/getUserInfo').default;
const websocket = require('./pages/home/ws').default;

let userInfo

App({
  ...getUserInfo,
  ...websocket,
  globalData: {
    merchantId: 0,
    badge: 0,
    systemInfo: {},
    token: {},
    userInfo: {},
    payStyle: {
      "UNPAY": '待支付',
      "WAIT_SHIPMENT": '待发货',
      CANCELED: '订单取消',
      "WAIT_RECEIVE": '待收货',
      RECEIVED: '已收货',
      "RETURN_FULL": '全部退货',
      "RETURN_PART": '部分退货'
    },
  },
  getGlobalVal(str) {
    let result = null;
    try {
      result = str.replace('.').reduce((accumulator, item) => {
        return accumulator[item]
      }, this.globalData);
    } catch (e) {

    }
  },
  failRequest(info = '商户') {
    wx.showToast({
      title: `获取${info}失败`,
      icon: 'none',
      duration: 2000
    })
  },
  getSystemInfo() {
    wx.getSystemInfo({
      success: res => {
        this.globalData.systemInfo.windowHeight = res.windowHeight*2
        this.globalData.systemInfo.windowWidth = res.windowWidth*2
        this.globalData.systemInfo.screenWidth = res.screenWidth*2
        this.globalData.systemInfo.screenHeight = res.screenHeight*2
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

  },
  onLaunch: function(options) {
    wx.setEnableDebug({
      enableDebug: true
    });
    this.getSystemInfo();
    // qcloud.setLoginUrl(config.service.loginUrl);
    if (!this.globalData.merchantId) {
      this.globalData = {
        ...this.globalData,
        ...wx.getStorageSync('globalData'),
        // todo test data
        // merchantId:'123456',
      };
    } 
  },
  
  saveGlobalData(result){
    if (!result.authMerchantList){
      return;
    }
    this.globalData.authWechat = result;
    this.globalData.merchantId = result.authMerchantList[0].merchantId;
    this.globalData.token = result.jwtToken;
    this.globalData.address = result.authMerchantList[0].merchantStoreName;
    wx.setStorage({
      key: "authWechat",
      data: result
    });
    wx.setStorage({
      key: "merchantId",
      data: this.globalData.merchantId
    });
    wx.setStorage({
      key: "token",
      data: result.jwtToken
    });
    // for development
    wx.setStorage({
      key: "globalData",
      data: this.globalData
    });
  },
  onShow() {
    this.checkProgramUpdate();
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
  login({
    success,
    error
  } = {
    success(data) {
      getApp().globalData.userInfo = data.userInfo;
      // debugger;
    },
    error(err) {
      debugger;
    }
  }) {
    wx.getSetting({
      success: res => {
        // if (res.authSetting['scope.userInfo'] === false) {
        // 已拒绝授权
        wx.getUserInfo({
          success: res => {
            getApp().globalData.userInfo = res.userInfo;
            success(res)

          },
          fail(err) {
            debugger;
          }
        });

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
  },
  Touches: new Touches()
})