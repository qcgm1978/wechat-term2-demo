const EVN = {
  LOCAL: -1,
  "DEV": 0,
  "STG": 1,
  "PRO": 2
}

var env = EVN.STG; //update this value for different env

var baseUrl = ""
var addrUrl = ""
var clientSecret = ""
let statistics = ''
// let localNodejs = 'http://10.3.0.98:5757/v1';
// localNodejs = 'http://192.168.16.71:5757/v1';
let localNodejs = 'http://localhost:5757/v1';
localNodejs = ''
switch (env) {
  case EVN.DEV:
    clientSecret = "OzoStRYlQVA85pjp"
    baseUrl = "http://dev.jhdmall.com/weapp/merchant-mall/v1"
    addrUrl = "http://dev.jhdmall.com/weapp/merchant-mall/v1"
    baseUrl ='http://192.168.2.56:17000/merchant-mall/v1'
    statistics = 'https://sitecatalyst.jihuiduo.cn'
    break;
  case EVN.LOCAL:
    {
      baseUrl = localNodejs;
      statistics = 'https://sitecatalyst.jihuiduo.cn'
      break;
    }
  case EVN.STG:
    clientSecret = "OzoStRYlQVA85pjp"
    baseUrl = "https://stg-api.jihuiduo.cn/bmall/merchant-mall/v1"
    addrUrl = "https://stg-api.jihuiduo.cn/bmall/merchant-mall/v1"
    statistics = 'https://sitecatalyst.jihuiduo.cn'
    break
  case EVN.PRO:
    clientSecret = "9sxyZhzgKIjSVuQQ"
    baseUrl = "https://api.jihuiduo.cn/bmall/merchant-mall/v1"
    addrUrl = "https://api.jihuiduo.cn/bmall/merchant-mall/v1"
    statistics = 'https://sitecatalyst.jihuiduo.cn'
    break
  default:
    clientSecret = "Rn2eJRBN0cDEXSBl"
    baseUrl = "https://dev.jhdmall.com/weapp/member"
    addrUrl = "https://dev.jhdmall.com/weapp/address"
    statistics = 'https://sitecatalyst.jihuiduo.cn'
    break
}
const apiURLs = {
  baseUrl: baseUrl,
  getHot: `${baseUrl}/mall/items/hot?locationId={locationId}&start={start}&limit={limit}`,
  getCategories: `${baseUrl}/mall/category?locationId={locationId}&categoryId={categoryId}&categoryDeep={categoryDeep}`,
  getProductItem: `${baseUrl}/mall/items?locationId={locationId}&categoryCd={categoryCd}&itemIds={itemIds}`,
  getRelated: `${baseUrl}/mall/items/{itemIds}/related?locationId={locationId}`,

  addTrolley: `${baseUrl}/mall/cart/add/{merchantId}/{locationId}`, //添加商品到购物车
  getCart: `${baseUrl}/mall/cart/{merchantId}/{locationId}?start={start}&limit={limit}`, //取得购物车商品列表
  removeCart: `${baseUrl}/mall/cart/remove/{merchantId}`, //删除购物车中的商品
  getCartCount: `${baseUrl}/mall/cart/count/{merchantId}/{locationId}`, //统计购物车商品数量

  getOrder: `${localNodejs || baseUrl}/mall/order/{merchantId}/{orderId}`,
  getOrderList: `${localNodejs || baseUrl}/mall/order/list`,
  createOrder: `${baseUrl}/mall/order/create`,
  cancelOrder: `${baseUrl}/mall/order/cancel`,
  countOrder: `${localNodejs || baseUrl}/mall/order/count`,
  backendUrlRequestment: `${localNodejs || baseUrl}/mall/order/onlinePayment`,

  getProduct: `${baseUrl}/product/{merchantId}/{itemId}`,
  getMerchant: `${baseUrl}/merchant/{merchantId}`,
  backendUrlLogin: `${baseUrl}/auth/wechat`,
  backendUrlRefreshToken: `${baseUrl}/auth/refresh`,
  backendUrlVerifyCode: baseUrl + '/auth/sms/',
  backendUrlPhoneLogin: baseUrl + '/auth/sms',

  getBanners: `${baseUrl}/mall/banners/{category}`,
  getPromoteInfo: `${baseUrl}/mall/promotions/item`,
  getCombinationList: `${baseUrl}/mall/promotions/combinationList`,
  calcPromote: `${baseUrl}/mall/promotions/calc`,
  selectGoods: `${localNodejs || baseUrl}/mall/promotions/selectGoods`,
  selectGoodsKind: `${localNodejs || baseUrl}/mall/promotions/selectCombGoods`,

  statistics: statistics
}

var Api = apiURLs;

module.exports = {
  Api: Api,
  env: env,
  clientSecret: clientSecret
}