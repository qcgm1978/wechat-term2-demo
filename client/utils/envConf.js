const EVN = {
  "DEV" : 0,
  "STG" : 1,
  "PRO" : 2
}

var env = EVN.STG   //update this value for different env

var baseUrl = ""
var addrUrl = ""
var clientSecret = ""

switch (env) {
  case EVN.DEV:
    clientSecret = "Rn2eJRBN0cDEXSBl"
    baseUrl = "https://dev.jhdmall.com/weapp/member"
    addrUrl = "https://dev.jhdmall.com/weapp/address"
    break
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
  backendUrlLogin: baseUrl + '/v1/auth/wechat',
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
  backendUrlVerifyCode: baseUrl + '/v1/sms/',

  backendUrlAddress: addrUrl + '/v1/address',
  backendUrlQRCode: baseUrl + '/v1/qrCodeUrl/get/',
}


var Api = apiURLs;

module.exports = { Api: Api, env: env, clientSecret: clientSecret}