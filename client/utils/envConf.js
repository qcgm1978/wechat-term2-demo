const EVN = {
  "DEV" : 0,
  "STG" : 1,
  "PRO" : 2
}

var env = EVN.DEV   //update this value for different env

var baseUrl = ""
var addrUrl = ""
var clientSecret = ""

switch (env) {
  case EVN.DEV:
    clientSecret = "Rn2eJRBN0cDEXSBl"
    baseUrl = "http://dev.jhdmall.com/weapp/merchant-mall"
    addrUrl = "http://dev.jhdmall.com/weapp/merchant-mall"
    break;
  case EVN.LOCAL:{
    baseUrl ='http://localhost:5757';
    break;
  }
  case EVN.STG:
    clientSecret = "Rn2eJRBN0cDEXSBl"
    baseUrl = "https://stg-app.jihuiduo.cn/member"
    addrUrl = "https://stg-app.jihuiduo.cn/address"
    break
  case EVN.PRO:
    clientSecret = "9sxyZhzgKIjSVuQQ"
    baseUrl = "https://app.jihuiduo.cn/member"
    addrUrl = "https://app.jihuiduo.cn/address"
    break
  default:
    clientSecret = "Rn2eJRBN0cDEXSBl"
    baseUrl = "https://dev.jhdmall.com/weapp/member"
    addrUrl = "https://dev.jhdmall.com/weapp/address"
    break
}
const apiURLs = {
  getOrder: `${baseUrl}/v1/order/{merchantId}/{orderId}`,
  getOrderList: `${baseUrl}/v1/order/list`,
  getMerchant: `${baseUrl}/merchant/{merchantId}`,

  backendUrlLogin: baseUrl + '/auth/wechat',
  backendUrlUserInfo: baseUrl + '/v1/members/',
  backendUrlRefreshToken: baseUrl + '/v1/auth/refresh',
  backendUrlRegister: baseUrl + '/v1/members/',
  backendUrlBanners: baseUrl + '/v1/banners/member',
  backendUrlDegree: baseUrl + '/v1/members/',
  backendUrlTransCount: baseUrl + '/v1/members/',
  backendUrlTrans: baseUrl + '/v1/members/',
  backendUrlPointBalance: baseUrl + '/v1/members/',
  backendUrlPayCodeToken: baseUrl + '/v1/barcode/',

  backendUrlPhoneLogin: baseUrl + '/v1/sms/login',
  backendUrlVerifyCode: baseUrl + '/auth/sms/',

  backendUrlAddress: addrUrl + '/v1/address',
  backendUrlQRCode: baseUrl + '/v1/qrCodeUrl/get/',
}


var Api = apiURLs;

module.exports = { Api: Api, env: env, clientSecret: clientSecret}