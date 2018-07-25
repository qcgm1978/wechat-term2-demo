Page({
  data: {
    customerTel: "400-101-5288",
    contactUs: "联系我们",
    workingTime: "工作时间：周一至周五，上午8:30-12:00 下午1:30-6:00",
    homeLogo: 'images/jhd-pic.png',
    btnBg: './images/button-phone.png',
  },
  makePhonecall: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.customerTel,
      success: res => {},
      fail: res => {},
      complete: res => {},
    })
  }
})