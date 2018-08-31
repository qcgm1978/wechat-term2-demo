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

        ctx.state.result = { "jwtToken": { "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXJjaGFudEluZm8iOiJbe1wibWVyY2hhbnRJZFwiOjI3NjAyLFwibWVyY2hhbnRTdG9yZU5hbWVcIjpcIua_rumYs-W4guWPsOWJjeWOv-WQjuaWueS5oeeZvuWnk-i2heW4glwiLFwidXNlck5hbWVcIjpcIuW8oOe6ouS6rlwiLFwiY2VsbFBob25lXCI6MTg2MDI0ODE3ODl9XSIsImV4cCI6MTUzNTcxMTIxMH0.73q3FkX4ImNI8FbqxzgKOmPR7AdTCSyYDNEHqsjis8E", "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXJjaGFudEluZm8iOiJbe1wibWVyY2hhbnRJZFwiOjI3NjAyLFwibWVyY2hhbnRTdG9yZU5hbWVcIjpcIua_rumYs-W4guWPsOWJjeWOv-WQjuaWueS5oeeZvuWnk-i2heW4glwiLFwidXNlck5hbWVcIjpcIuW8oOe6ouS6rlwiLFwiY2VsbFBob25lXCI6MTg2MDI0ODE3ODl9XSIsImV4cCI6MTUzODI5OTYxMH0.tKu_khCQAZmGG9sW6a5od4HfNqauJ6f1ARneN1J0W_E" }, "authMerchantList": [{ "merchantId": 27602, "merchantStoreName": "濮阳市台前县后方乡百姓超市", "userName": "张红亮", "cellPhone": 18602481789 }], "potentialUser": false }
    }
}