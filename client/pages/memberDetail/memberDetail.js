import {
  getMerchant,
  errorHander,
  postRequest
} from '../../utils/util.js';
import {
  Api
} from '../../utils/envConf.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar: '',
    name: '',
    address: '',
    profileName: '',
    id: '',
    salesmanName: '',
    salesmanCellPhone: '',
    orderNum: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (!getApp().globalData.registerStatus) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }

  },
  exitLogin: function() {
    getApp().exitLogin();
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.salesmanCellPhone //|| '15698765432'
    })
  },
  toggleTab(evt) {
    const index = Number(evt.target.dataset.type);
    if (isNaN(Number(index))) {
      return;
    }
    wx.navigateTo({
      url: `/pages/transactionList/transactionList?tab=${index}`,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const merchant = getApp().globalData.merchant;
    // getMerchant().then(data => {
    // const merchant = data.result;
    this.setData({
      id: merchant.nsMerchantId,
      name: merchant.merchantStoreName,
      address: getApp().globalData.address,
      profileName: getApp().globalData.authWechat.authMerchantList[getApp().globalData.currentIndex].userName,
      salesmanCellPhone: merchant.salesmanCellPhone ? String(merchant.salesmanCellPhone) : '',
      salesmanName: merchant.salesmanName || ''
    });
    postRequest({
      url: Api.countOrder,
      postData: {
        "merchantId": getApp().getMerchantId(),
        "orderStatus": [
          0, 1, 2, 3, 4, 5
        ]
      }
    }).then(({result}) => {
      debugger;
      this.setData({
        orderNum:result
      });
    }).catch(err => {
      // todo
      // let orderNum = [
      //   {
      //     "orderStatus": 0,
      //     "count": 10
      //   },
      //   {
      //     "orderStatus": 1,
      //     "count": 3
      //   },
      //   {
      //     "orderStatus": 2,
      //     "count": 0
      //   },
      //   {
      //     "orderStatus": 3,
      //     "count": 0
      //   },
      //   {
      //     "orderStatus": 4,
      //     "count": 1
      //   },
      //   {
      //     "orderStatus": 5,
      //     "count": 0
      //   }
      // ];
      // this.setData({orderNum});
    });
    // })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})