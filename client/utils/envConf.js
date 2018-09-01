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
    clientSecret = "OzoStRYlQVA85pjp"
    baseUrl = devBaseUrl;
    addrUrl = "http://dev.jhdmall.com/weapp/merchant-mall/v1"
    break;
  case EVN.LOCAL:
    {
      baseUrl = 'http://localhost:5757/v1';
      baseUrl = 'http://10.3.0.98:5757/v1';
      baseUrl ='http://192.168.16.71:5757/v1';
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
  getHot: `${baseUrl}/mall/items/hot?locationId={locationId}&start={start}&limit={limit}`,
  getProductItem: `${baseUrl}/mall/items?&locationId={locationId}&itemId={itemId}`,
  getOrder: `${baseUrl}/order/{merchantId}/{orderId}`,
  getOrderList: `${baseUrl}/order/list`,
  createOrder: `${baseUrl}/order/create`,
  cancelOrder: `${baseUrl}/order/cancel`,
  getProduct: `${baseUrl}/product/{merchantId}/{itemId}`,
  getMerchant: `${baseUrl}/merchant/{merchantId}`,
  addTrolley: `${baseUrl}/trolley/list`,
  backendUrlLogin: `${baseUrl}/auth/wechat`,
  backendUrlRefreshToken: `${baseUrl}/auth/refresh`,
  backendUrlVerifyCode: baseUrl + '/auth/sms/',
  backendUrlPhoneLogin: baseUrl + '/auth/sms',

  getProductList: `${baseUrl}/product`,

  backendUrlUserInfo: baseUrl + '/v1/members/',
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