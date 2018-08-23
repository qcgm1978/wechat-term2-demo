const CONF = {
    port: '5757',
    rootPathname: 'store',

    // 微信小程序 App ID
    appId: 'wx44aeb10d0359834d',

    // 微信小程序 App Secret
    appSecret: 'c7b1b90cb7d31d3e24687558d88a40e8',

    // 是否使用腾讯云代理登录小程序
    useQcloudLogin: false,

    /**
     * MySQL 配置，用来存储 session 和用户信息
     * 若使用了腾讯云微信小程序解决方案
     * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
     */
    mysql: {
        host: 'localhost',
        port: 3306,
        user: 'root',

        db: 'o2o',
        pass: 'test@2018',
        char: 'utf8mb4'
    },

    cos: {
        /**
         * 地区简称
         * @查看 https://cloud.tencent.com/document/product/436/6224
         */
        region: 'ap-guangzhou',
        // Bucket 名称
        fileBucket: 'qcloudtest',
        // 文件夹
        uploadFolder: ''
    },

    // 微信登录态有效期
    wxLoginExpires: 7200,
    wxMessageToken: 'abcdefgh',
    serverHost: '',
    tunnelServerUrl: '',
    tunnelSignatureKey: '',
    qcloudAppId: '',
    qcloudSecretId: '',
    qcloudSecretKey: ''
}

module.exports = CONF
