const baseUrl = `http://192.168.2.58:8080`;
export const urlObj = {
  test: `/user/jhduser`,
  clientInfo: `/b2b/clientInfo`,
  load:`/b2b/page/load`,
  unload:`/b2b/page/unload`,
  dispose:`/b2b/page/dispose`
};
let statisToken = wx.getStorageSync('statis').token || '';
const getToken = () => new Promise((resolve, reject) => wx.request({
  method: "POST",
  url: `${baseUrl}/main/getToken`,
  data: {
    "loginName": "tom",
    "password": "abc123",
    "longitude": "88.76281"
  },
  header: {
    'Content-Type': 'application/json'
  },
  success: function(result) {
    console.log(`statisToken: ${result.data.jhd_token}`);
    const token = result.data.jhd_token;
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
      sessionId: getApp().globalData.token.accessToken,
      userId,
    };
    console.log(data);
    console.log(`page url is ${data.pageUrl}`)
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
        } else {
          console.log(result.data.status);
        }

      }
    })
  });
}
export const requestStatisLoad=() => requestStatis({
  url: urlObj.load,
  pageUrl: getCurrentPages().slice(-1)[0].route,
  event: 'evn_open_page',
  eventDetail: null,
  time: new Date().getTime(),
  preUrl: getCurrentPages().slice(-2, -1)[0] ? getCurrentPages().slice(-2, -1)[0].route : ''
});
export const requestStatisUnload = ({ nextUrl } = { nextUrl:''}) => requestStatis({
  url: urlObj.unload,
  pageUrl: getCurrentPages().slice(-1)[0].route,
  event: 'evn_open_page',
  eventDetail: null,
  time: new Date().getTime(),
  nextUrl
});
export const requestStatisDispose = () => requestStatis({
  url: urlObj.dispose,
  pageUrl: getCurrentPages().slice(-1)[0].route,
  event: 'evn_open_page',
  eventDetail: null,
  time: new Date().getTime(),
});