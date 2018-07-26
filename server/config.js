const CONF = {
    port: '5757',
    rootPathname: 'store',

    // 微信小程序 App ID
    appId: 'wxcb754b6f12773e5c',

    // 微信小程序 App Secret
    appSecret: '6d72e9f5eec0df485f2e88c9ef5f2608',

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
        db: 'cAuth',
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
