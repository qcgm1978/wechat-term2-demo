// 登录授权接口
module.exports = {
    login: async (ctx, next) => {
        // 通过 Koa 中间件进行登录之后
        // 登录信息会被存储到 ctx.state.$wxInfo
        // 具体查看：
        console.log('login interfaceaaaaaaaaaaaaaaaaaa');
        // ctx.state.data = { mock: true }
        if (ctx.state.$wxInfo.loginState) {
            ctx.state.data = ctx.state.$wxInfo.userinfo
            ctx.state.data['time'] = Math.floor(Date.now() / 1000)
        } else {
            // ctx.state.data = { mock: true }
        }
    },
    wechat(ctx) {

        ctx.state.result = { "jwtToken": { "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXJjaGFudEluZm8iOiJbe1wibWVyY2hhbnRJZFwiOjI3NjAyLFwibWVyY2hhbnRTdG9yZU5hbWVcIjpcIua_rumYs-W4guWPsOWJjeWOv-WQjuaWueS5oeeZvuWnk-i2heW4glwifV0iLCJleHAiOjE1MzUwODY1OTl9.7jNe8CI1esN6Dz7YZkswoq0TTlYejN_kvJV0KIEUwCE", "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXJjaGFudEluZm8iOiJbe1wibWVyY2hhbnRJZFwiOjI3NjAyLFwibWVyY2hhbnRTdG9yZU5hbWVcIjpcIua_rumYs-W4guWPsOWJjeWOv-WQjuaWueS5oeeZvuWnk-i2heW4glwifV0iLCJleHAiOjE1Mzc2NzQ5OTl9.XLoLib-R8D69OOG7MAz1UpNXZ75kkYuR4yPo-r5yV-4" }, "authMerchantList": [{ "merchantId": 27602, "merchantStoreName": "濮阳市台前县后方乡百姓超市" }] }
    }
}