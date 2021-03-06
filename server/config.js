const CONF = {
    port: '5757',
    rootPathname: 'store',

    // 微信小程序 App ID
    appId: 'wx00d1d53802723dab',

    // 微信小程序 App Secret
    appSecret: '0054c524615772331ef1f2b5a027bc36',

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
        db: 'store',
        pass: 'china.com',
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
