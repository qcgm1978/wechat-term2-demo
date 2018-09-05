const EVN = {
  LOCAL: -1,
  "DEV": 0,
  "STG": 1,
  "PRO": 2
}

var env = EVN.DEV; //update this value for different env

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
      // baseUrl ='http://192.168.16.71:5757/v1';
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
  getCategories: `${baseUrl}/mall/category?locationId={locationId}&categoryId={categoryId}&categoryDeep={categoryDeep}`,
  getProductItem: `${baseUrl}/mall/items?locationId={locationId}&categoryCd={categoryCd}&itemIds={itemIds}`,
  getRelated: `${baseUrl}/mall/items/{itemIds}/related?locationId={locationId}`,

  addTrolley: `${baseUrl}/mall/cart/add/{merchantId}`,//添加商品到购物车
  getCart: `${baseUrl}/mall/cart/{merchantId}/{locationId}`,//取得购物车商品列表
  removeCart: `${baseUrl}/mall/cart/remove/{merchantId}`,//删除购物车中的商品
  getCartCount:`${baseUrl}/mall/cart/count/{merchantId}`,//统计购物车商品数量

  getOrder: `${baseUrl}/order/{merchantId}/{orderId}`,
  getOrderList: `${baseUrl}/order/list`,
  createOrder: `${baseUrl}/order/create`,
  cancelOrder: `${baseUrl}/order/cancel`,
  getProduct: `${baseUrl}/product/{merchantId}/{itemId}`,
  getMerchant: `${baseUrl}/merchant/{merchantId}`,
  backendUrlLogin: `${baseUrl}/auth/wechat`,
  backendUrlRefreshToken: `${baseUrl}/auth/refresh`,
  backendUrlVerifyCode: baseUrl + '/auth/sms/',
  backendUrlPhoneLogin: baseUrl + '/auth/sms',
}


var Api = apiURLs;

module.exports = {
  Api: Api,
  env: env,
  clientSecret: clientSecret
}