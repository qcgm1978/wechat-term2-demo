const EVN = {
  LOCAL: -1,
  "DEV": 0,
  "STG": 1,
  "PRO": 2
}

var env = EVN.LOCAL; //update this value for different env

var baseUrl = ""
var addrUrl = ""
var clientSecret = ""
const devBaseUrl = "http://dev.jhdmall.com/weapp/merchant-mall/v1";

switch (env) {
  case EVN.DEV:
    clientSecret = "Rn2eJRBN0cDEXSBl"
    baseUrl = devBaseUrl;
    addrUrl = "http://dev.jhdmall.com/weapp/merchant-mall/v1"
    break;
  case EVN.LOCAL:
    {
      baseUrl = 'http://localhost:5757/v1';
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
  getOrder: `${baseUrl}/order/{merchantId}/{orderId}`,
  getOrderList: `${baseUrl}/order/list`,
  cancelOrder: `${baseUrl}/order/cancel`,
  getProduct: `${baseUrl}/product/{merchantId}/{orderId}`,
  getMerchant: `${devBaseUrl}/merchant/{merchantId}`,
  addTrolley: `${baseUrl}/trolley/list`,
  backendUrlLogin: `${baseUrl}/auth/wechat`,
  backendUrlVerifyCode: baseUrl + '/auth/sms/',
  backendUrlPhoneLogin: baseUrl + '/auth/sms',
  

  backendUrlUserInfo: baseUrl + '/v1/members/',
  backendUrlRefreshToken: baseUrl + '/v1/auth/refresh',
  backendUrlRegister: baseUrl + '/v1/members/',
  backendUrlBanners: baseUrl + '/v1/banners/member',
  backendUrlDegree: baseUrl + '/v1/members/',
  backendUrlTransCount: baseUrl + '/v1/members/',
  backendUrlTrans: baseUrl + '/v1/members/',
  backendUrlPointBalance: baseUrl + '/v1/members/',
  backendUrlPayCodeToken: baseUrl + '/v1/barcode/',


  backendUrlAddress: addrUrl + '/v1/address',
  backendUrlQRCode: baseUrl + '/v1/qrCodeUrl/get/',
}


var Api = apiURLs;

module.exports = {
  Api: Api,
  env: env,
  clientSecret: clientSecret
}