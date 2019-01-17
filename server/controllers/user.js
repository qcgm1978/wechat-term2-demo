module.exports = async (ctx, next) => {
    // 通过 Koa 中间件进行登录态校验之后
    // 登录信息会被存储到 ctx.state.$wxInfo
    // 具体查看：
    // if (ctx.state.$wxInfo.loginState === 1) {
    //     // loginState 为 1，登录态校验成功
    //     ctx.state.data = ctx.state.$wxInfo.userinfo
    // } else {
    //     ctx.state.code = -1
    // }
    if (ctx.params.id) {
        ctx.state.data = {

            "merchantInfoId": "56c39fe0aa9511e8a2ea71edecd087c3",
            "nsMerchantId": 27602,
            "nsMerchantNo": "CUS23753",
            "merchantStoreName": "濮阳市台前县后方乡百姓超市",
            "locationId": 128,
            "province": "河南省",
            "city": "新乡市",
            "county": "卫辉县",
            "town": null,
            "address": null,
            "loginMallFlg": 1,
            "activeFlg": 1,
            "pointBalance": 5000,
            availablePoint: 693002,
            availablePointDrop: 2000
        }
    }
}
