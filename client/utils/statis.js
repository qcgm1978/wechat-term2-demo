import {
  Api
} from './envConf.js'
const baseUrl = Api.statistics
export const urlObj = {
  test: `/user/jhduser`,
  getToken: `/b2b/getToken`,
  clientInfo: `/b2b/clientInfo`,
  load: `/b2b/page/load`,
  unload: `/b2b/page/unload`,
  dispose: `/b2b/page/dispose`,

  loginWechat: `/b2b/login/wxlogin`,
  loginPhone:`/b2b/login/phonelogin`,
  enterHome:`/b2b/livesite`,
  callEnterPhone:`/b2b/call`,
  exitHomeLogin:`/b2b/loginout`
};
let statisToken = wx.getStorageSync('statis').token || '';
let sessionId = '';
const getToken = () => new Promise((resolve, reject) => wx.request({
  method: "POST",
  url: `${baseUrl}${urlObj.getToken}`,
  data: {
    sessionId
  },
  header: {
    'Content-Type': 'application/json'
  },
  success: function(result) {

    const token = result.data.jhd_token;
    if (token === undefined) {
      return reject(result)
    }
    statisToken = token;
    wx.setStorage({
      key: 'statis',
      data: {
        token
      },
      success() {
        resolve(token)
      }
    })
  }
}));
export const requestStatis = (postData = {}) => {
  const setToken = statisToken ? () => Promise.resolve(statisToken) : getToken;
  setToken().then(statisToken => {
    //使用access_token,获取java后台数据
    const userId = getApp().getMerchantId() || '';
    const data = {
      ...postData,
      sessionId,
      userId,
      pageUrl: getCurrentPages().slice(-1)[0].route,
      eventDetail: '',
      time: new Date().getTime(),
      preUrl: getCurrentPages().slice(-2, -1)[0] ? getCurrentPages().slice(-2, -1)[0].route : '' //getCurrentPages().slice(-1)[0].route
    };
    wx.request({
      method: "POST",
      url: `${baseUrl}${postData.url}?access_token=${statisToken}`,
      data,
      header: {
        'Content-Type': 'application/json'
      },
      success: function(result) {
        if (result.statusCode === 401 && result.data.error === 'invalid_token') {
          getToken().then(() => requestStatis(data))
        } else {}

      }
    })
  }).catch(e => {
    console.log(e.data.error)
  });
}
export const requestStatisEnter = (systemInfo) => {
  let longitude = '',
    latitude = '';
  wx.getLocation({
    success(data) {
      longitude = data.longitude;
      latitude = data.latitude;
    },
    fail() {
      //debugger;
    },
    complete() {
      // const systemInfo = getApp().globalData.systemInfo;
      requestStatis({
        url: urlObj.clientInfo,
        miniappVer: systemInfo.SDKVersion,
        phoneBrand: systemInfo.brand,
        phoneModel: systemInfo.model,
        screenWidth: systemInfo.screenWidth / 2,
        screenHeight: systemInfo.screenHeight / 2,
        longitude: longitude,
        latitude: latitude,
        // wx.getUserInfo(Object object): 调用前需要 用户授权 scope.userInfo
        province: '',
        city: '',
        genders: '',
        // no interface
        ages: ''
      });
    }
  });
}
export const requestStatisLoad = () => requestStatis({
  url: urlObj.load,
  event: 'evn_open_page',
});
export const requestStatisUnload = ({
  nextUrl
} = {
  nextUrl: ''
}) => requestStatis({
  url: urlObj.unload,
  pageUrl: getCurrentPages().slice(-1)[0].route,
  event: 'evn_quit_page',
  eventDetail: '',
  time: new Date().getTime(),
  nextUrl
});
export const requestStatisDispose = () => requestStatis({
  url: urlObj.dispose,
  event: 'evn_hide_app',
});
export const requestWechatLogin = () => requestStatis({
  url: urlObj.loginWechat,
  event: 'evn_wechat_login',
})
export const requestPhoneLogin = () => requestStatis({
  url: urlObj.loginPhone,
  event: 'evn_phone_login',
})
export const requestEnter = () => requestStatis({
  url: urlObj.enterHome,
  event: 'evn_register',
})
export const requestEnterCall = () => requestStatis({
  url: urlObj.callEnterPhone,
  event: 'evn_call',
})
export const requestHomeExit = () => requestStatis({
  url: urlObj.exitHomeLogin,
  event: 'evn_logout',
})
export const updateSessionId = () => {
  sessionId = generateGuid();
}
const generateGuid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  const PRE = 's_';
  return PRE + s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}