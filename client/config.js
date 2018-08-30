/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
// var host = 'https://ncuhi0ct.qcloud.la';
var host = 'http://localhost:5757';
// var host = 'http://192.168.2.26/jhdmall';
var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `${host}/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/user`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/tunnel`,

        // 上传图片接口
        uploadUrl: `${host}/upload`,

        // 拉取商品列表
        productList: `${host}/product`,

        // 拉取商品详情
        productDetail: `${host}/product/`,

        // 拉取用户信息
        user: `${host}/user`,

        // 创建订单
        addOrder: `${host}/order`,

        // 获取已购买订单列表
        orderList: `${host}/order`,

        // 添加到购物车商品列表
        addTrolley: `${host}/trolley`,

        // 获取购物车商品列表
        trolleyList: `${host}/trolley`,

        // 更新购物车商品列表
        updateTrolley: `${host}/trolley`,

        // 添加评论
        addComment: `${host}/comment`,

        // 获取评论列表
        commentList: `${host}/comment`,

    }
};

module.exports = config;
