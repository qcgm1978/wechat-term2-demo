const map=require('./map.js').default;
var URLs = require("../../utils/envConf.js").Api;
var refreshAccessToken = require("../../utils/refreshToken.js").refreshAccessToken;
var ERROR_CODE = require("../../utils/index.js").config.errorCode;
var utils = require("../../utils/util.js");
var memeberStatus = require("../../utils/index.js")
var idCardValid = require("../../utils/idCardValidation.js").idCardValid
var addressObj = require('./address-carousel.js').default;
const ACCESS_TOCKEN_EXPIRED = ERROR_CODE.ACCESS_TOCKEN_EXPIRED
const DATA_NOT_FOUND = ERROR_CODE.DATA_NOT_FOUND
const HTTP_SUCCSESS = ERROR_CODE.HTTP_SUCCSESS
const CONNECTION_TIMEOUT = ERROR_CODE.CONNECTION_TIMEOUT
const INVALID_USER_STATUS = ERROR_CODE.INVALID_USER_STATUS

const backendUrlUserInfo = URLs.backendUrlUserInfo
const backendUrlAddress = URLs.backendUrlAddress
const promptTitleMsg = "提示"
const networkErrorMsg = "网络链接失败！"
const memberNameLable = "会员姓名"
const mobileLable = "手机号"
const genderLable = "性别"
const male = "男"
const female = "女"
const birthdayLable = "生日"
const registerDateLable = "注册日期"
const idNumberLable = "身份证号"
const familyNumberLable = "家庭人数"
const educationDegreeLable = "教育程度"
const professionLable = "行业"
const annualIncomeLable = "年收入"
const familyAddressLable = "门店地址"

const date = new Date()
const years = []
const months = []
const days = []
const startYear = 1920

for (let i = startYear; i <= date.getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  days.push(i)
}

Page({
  data: {
    ishidden: true,
    years: years,
    year: date.getFullYear(),
    months: months,
    month: 1,
    days: days,
    day: 1,
    value: [9999, 0, 0],

    idCardNumberValue: "",
    optionalShow: false,
    familyNumber: {
      options: ['请选择', '1-3人', '4-6人', '7-9人', '10人及以上'],
      index: 0
    },
    eduDegree: {
      options: ['请选择', '小学', '初中', '高中', '大学', '硕士及以上'],
      index: 0
    },
    profession: {
      options: ['请选择',
        '种植业', '家畜养殖业', '农业机械操作', '技术维修', "建筑施工",
        '交通运输', '酒店餐饮', '矿业 采石业', '家具制造', "零售批发",
        '通讯运营 增值服务', '室内设计 装修装潢', '休闲 旅游 娱乐', '文员 行政', "服装纺织",
        '医疗 医药', '教育培训', '文具印刷 办公用品', '邮政储蓄业', "政府机关 公共事业",
        '警察 安保', '美容保健', '银行金融', '保险 中介服务', "其他"
      ],
      index: 0
    },
    annualIncome: {
      options: ['请选择', '10000元以下', '10000-29999元', '30000-49999元', '50000-79999元', '80000元及以上'],
      index: 0
    },
    //address
    province: {
      options: {
        areaId: [0],
        areaName: ["请选择"]
      },
      index: 0
    },
    city: {
      options: {
        areaId: [0],
        areaName: ["请选择"]
      },
      index: 0
    },
    district: {
      options: {
        areaId: [0],
        areaName: ["请选择"]
      },
      index: 0
    },
    town: {
      options: {
        areaId: [0],
        areaName: ["请选择"]
      },
      index: 0
    },
    shop: {
      options: {
        areaId: [0],
        areaName: ["请选择"]
      },
      index: 0
    },
    // region: ['请选择省份', '请选择城市', '请选择区/县', '请选择乡镇'],
    // customItem: '全部',

    detailedAddress: "",
    memberNameLable: memberNameLable,
    mobileLable: mobileLable,
    genderLable: genderLable,
    male: male,
    female: female,
    birthdayLable: birthdayLable,
    registerDateLable: registerDateLable,

    idNumberLable: idNumberLable,
    familyNumberLable: familyNumberLable,
    educationDegreeLable: educationDegreeLable,
    professionLable: professionLable,
    annualIncomeLable: annualIncomeLable,
    familyAddressLable: familyAddressLable,


  },
  toggleOptional() {
    this.setData({
      optionalShow: !this.data.optionalShow
    })
  },

  //Name dialog
  showNameDialog: function() {
    this.setData({
      showNameModal: true
    })
  },

  preventTouchMove: function() {

  },

  hideNameModal: function() {
    this.setData({
      showNameModal: false
    });
  },

  onNameCancel: function() {
    this.hideNameModal();
    this.setData({
      inputMemberName: getApp().globalData.userInfo.memberName
    });
  },

  onNameConfirm: function() {
    if (!this.data.inputMemberName || this.data.inputMemberName.trim() == "") {
      wx.showToast({
        icon: 'none',
        title: '姓名不能为空',
      })
      return
    }
    this.hideNameModal()
    this.confirmEditName()
  },

  //Birthday dialog
  showBirthdayDialog: function() {
    this.setData({
      showBirthdayModal: true
    })
  },

  hideBirthdayModal: function() {
    this.setData({
      showBirthdayModal: false
    });
  },

  onBirthdayCancel: function() {
    this.hideBirthdayModal();
  },


  validateDate: function(byear, bmonth, bday) {
    var formatBmonth = (bmonth + "").length == 1 ? "0" + bmonth : "" + bmonth
    var formatBday = (bday + "").length == 1 ? "0" + bday : "" + bday
    var birthday = byear + formatBmonth + formatBday

    var formatTmonth = ((date.getMonth() + 1) + "").length == 1 ? "0" + (date.getMonth() + 1) : "" + (date.getMonth() + 1)
    var formatTday = (date.getDate() + "").length == 1 ? "0" + date.getDate() : "" + date.getDate()
    var today = date.getFullYear() + formatTmonth + formatTday

    if (birthday > today) {
      return false
    } else {
      return true
    }

  },

  onBirthdayConfirm: function() {
    if (new Date(this.data.year, this.data.month - 1, this.data.day).getMonth() + 1 !== parseInt(this.data.month)) {
      return wx.showToast({
        icon: 'none',
        title: '该日期无效',
      })
    }
    if (this.validateDate(this.data.year, this.data.month, this.data.day)) {
      this.hideBirthdayModal();
      this.confirmEditBirthday()
    } else {
      wx.showToast({
        icon: 'none',
        title: '不能选择大于今天的日期',
      })
    }

  },

  bindChange: function(e) {
    const val = e.detail.value
    this.setData({
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]]
    })
  },

  bindMemberNameInput: function(e) {
    this.setData({
      inputMemberName: e.detail.value
    })
  },

  exitLogin: function() {
    getApp().globalData.userInfo.registerStatus = false
    wx.setStorage({
      key: "registerStatus",
      data: getApp().globalData.userInfo.registerStatus
    })
    wx.reLaunch({
      url: '../member/member'
    })
  },

  editName: function() {
    this.showNameDialog()
  },

  cancelEditBirthday: function() {
    this.setData({
      editBirthdayHidden: true
    });
  },

  confirmEditBirthday: function() {
    debugger;

    var birthday = this.data.year + "-" + (this.data.month.toString().length == 1 ? ("0" + this.data.month.toString()) : this.data.month) + "-" + (this.data.day.toString().length == 1 ? ("0" + this.data.day.toString()) : this.data.day)

    this.setData({
      editBirthdayHidden: true,
      birthdayValue: birthday
    });


  },

  confirmEditName: function() {
    this.setData({
      editNameHidden: true,
      memberNameValue: this.data.inputMemberName,
    });

  },

  editMobile: function() {},

  editGenderFemale: function() {
    this.setData({
      genderValue: "F"
    });
    this.data.genderBKImage.forEach((item, index) => {
      if (item.key === this.data.genderValue) {
        this.setData({
          genderImgSrc: item.imageSrc
        });
      }
    });


  },

  editGenderMale: function() {
    this.setData({
      genderValue: "M",
    });
    this.data.genderBKImage.forEach((item, index) => {
      if (item.key === this.data.genderValue) {
        this.setData({
          genderImgSrc: item.imageSrc
        });
      }
    });

  },

  editBirthday: function() {
    if (this.data.birthdayValue) {
      var birthDate = this.data.birthdayValue.split("-")
      this.setData({
        year: birthDate[0],
        month: birthDate[1],
        day: birthDate[2],
        value: [parseInt(birthDate[0]) - startYear, parseInt(birthDate[1]) - 1, parseInt(birthDate[2]) - 1],
      })
    }
    this.showBirthdayDialog()
  },

  onLoad: function(options) {
    this.getProvinceList.tokenRefreshed = false
    this.getCityList.tokenRefreshed = false
    this.getDistrictList.tokenRefreshed = false
    this.getTownList.tokenRefreshed = false

    this.requestUserInfoDetail.tokenRefreshed = false
    this.updateAllMemberInfo.tokenRefreshed = false


  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    utils.checkNetwork()
      .then(() => {

        //get province list
        return this.getProvinceList()
          .then(() => {
            return this.requestUserInfoDetail()
              .then(() => {
                this.setData({
                  inputMemberName: this.data.memberNameValue,
                  genderValue: getApp().globalData.userInfo.gender,
                })

                this.data.genderBKImage.forEach((item, index) => {
                  if (item.key == getApp().globalData.userInfo.gender) {
                    this.setData({
                      genderImgSrc: item.imageSrc
                    });
                  }
                });
              })
            // .catch(() => {
            //   debugger
            // })
          })
          .then(this.getCityList)
          .then(this.getDistrictList)
          .then(this.getTownList)
          .then(this.getShopList)
        // .catch((err) => {
        //   debugger;
        // })


      })
    // .catch((err) => {
    //   debugger;
    // })
    this.getPos()
  },

  getShopList(){
    debugger;
  },
  requestUserInfoDetail: function() {
    return new Promise((resolve, reject) => {
      utils.getRequest(backendUrlUserInfo + (getApp().globalData.userInfo ? getApp().globalData.userInfo.memberId : 1529899320134611))
        .then(data => {
          var memberDataUpdated = this.data.memberData
          var cellPhone = data.result.cellPhone + ""
          getApp().globalData.userInfo.mobile = data.result.cellPhone
          getApp().globalData.userInfo.gender = data.result.gender
          getApp().globalData.userInfo.memberName = data.result.memberName
          getApp().globalData.userInfo.birthday = data.result.birthday
          getApp().globalData.userInfo.registerDate = data.result.registerDate
          if (data.result.activeStatus == memeberStatus.FROZEN) {
            reject(memeberStatus.FROZEN)
          } else {

            for (let i = 0; i < this.data.familyNumber.options.length; i++) {
              if (this.data.familyNumber.options[i] == data.result.familySize) {
                this.data.familyNumber.index = i
              }
            }

            for (let i = 0; i < this.data.annualIncome.options.length; i++) {
              if (this.data.annualIncome.options[i] == data.result.familyIncome) {
                this.data.annualIncome.index = i
              }
            }

            for (let i = 0; i < this.data.eduDegree.options.length; i++) {
              if (this.data.eduDegree.options[i] == data.result.education) {
                this.data.eduDegree.index = i
              }
            }

            for (let i = 0; i < this.data.profession.options.length; i++) {
              if (this.data.profession.options[i] == data.result.occupation) {
                this.data.profession.index = i
              }
            }
            var provinceTmp = {
              index: 0
            }
            if (data.result.address.province) {
              for (let i = 0; i < this.data.province.options.areaName.length; i++) {
                if (data.result.address.province == this.data.province.options.areaName[i]) {
                  provinceTmp.index = i;
                }
              }
            }

            var cityTmp = {
              options: {
                areaId: [0],
                areaName: ["请选择"],
                disabled: !provinceTmp.index
              },
              index: 0
            }
            if (data.result.address.city && data.result.address.city != "请选择") {
              cityTmp.options.areaName.push(data.result.address.city)
              cityTmp.options.areaId.push(data.result.address.cityId)
              cityTmp.index = 1;
            }

            var districtTmp = {
              options: {
                areaId: [0],
                areaName: ["请选择"],
                disabled: !cityTmp.index
              },
              index: 0
            }

            if (data.result.address.county && data.result.address.county != "请选择") {
              districtTmp.options.areaName.push(data.result.address.county)
              districtTmp.options.areaId.push(data.result.address.countyId)
              districtTmp.index = 1;
            }

            var townTmp = {
              options: {
                areaId: [0],
                areaName: ["请选择"],
                disabled: !districtTmp.index
              },
              index: 0
            }
            if (data.result.address.town && data.result.address.town != "请选择") {
              townTmp.options.areaName.push(data.result.address.town)
              townTmp.options.areaId.push(data.result.address.townId)
              townTmp.index = 1;
            }

            this.setData({
              gender: getApp().globalData.userInfo.gender,
              memberNameValue: getApp().globalData.userInfo.memberName,
              mobileValue: getApp().globalData.userInfo.mobile,
              birthdayValue: getApp().globalData.userInfo.birthday ? getApp().globalData.userInfo.birthday : "",
              registerDateValue: getApp().globalData.userInfo.registerDate ? getApp().globalData.userInfo.registerDate.split(" ")[0] : "",
              'familyNumber.index': this.data.familyNumber.index,
              'annualIncome.index': this.data.annualIncome.index,
              'eduDegree.index': this.data.eduDegree.index,
              'profession.index': this.data.profession.index,

              idCardNumberValue: data.result.identityNumber,

              'province.index': provinceTmp.index,
              city: cityTmp,
              district: districtTmp,
              town: townTmp,
              detailedAddress: data.result.address.detail

            })
            resolve()
          }
        })
        .catch(errorCode => {
          console.log(errorCode)
          utils.errorHander(errorCode, this.requestUserInfoDetail)
            .then(() => {
              resolve()
            })
            .catch(() => {
              reject()
            })
        })
    })
  },

  //bind functions
  bindFamilyNumberChange: function(e) {
    this.setData({
      'familyNumber.index': e.detail.value
    })
  },
  bindEduDegreeChange: function(e) {
    this.setData({
      'eduDegree.index': e.detail.value
    })
  },
  bindProfessionChange: function(e) {
    this.setData({
      'profession.index': e.detail.value
    })
  },
  bindAnnualIncomeChange: function(e) {
    this.setData({
      'annualIncome.index': e.detail.value
    })
  },
  // bindFamilyAddressChange: function(e) {
  //   this.setData({
  //     region: e.detail.value
  //   })
  // },

  bindProvinceChange: function(e) {
    this.setData({
      'province.index': e.detail.value,
      'city.index': 0,
      'district.index': 0,
      'town.index': 0
    })

    if (this.data.province.index == 0) {
      return
    }

    this.getCityList(0)
      .then(() => {

      })
      .catch((err) => {
        console.log(`Promise err:${err}`)
      })
  },

  bindCityChange: function(e) {
    this.setData({
      'city.index': Number(e.detail.value),
      'district.index': 0,
      'town.index': 0
    })
    if (this.data.city.index == 0) {
      return
    }

    this.getDistrictList()
      .then(() => {})
      .catch(() => {})
  },

  bindDistrictChange: function(e) {
    this.setData({
      'district.index': e.detail.value,
      'town.index': 0
    })
    if (this.data.district.index == 0) {
      return
    }

    this.getTownList()
      .then(() => {})
      .catch(() => {})
  },
  bindTownChange: function(e) {
    this.setData({
      'town.index': e.detail.value
    })
  },

  bindDetailAddressInput: function(e) {
    this.setData({
      detailedAddress: e.detail.value
    })
  },

  bindIDCardNumberInput: function(e) {
    this.setData({
      idCardNumberValue: e.detail.value
    })
  },

  submitChanges: function() {
    if (this.data.idCardNumberValue) {
      if (!idCardValid(this.data.idCardNumberValue)) {
        wx.showToast({
          icon: 'none',
          title: '请输入正确的身份证号码',
        })
        return
      }
    }

    this.updateAllMemberInfo()
      .then((data) => {
        getApp().globalData.userInfo.memberName = this.data.memberNameValue
        getApp().globalData.userInfo.birthday = this.data.birthdayValue
        getApp().globalData.userInfo.gender = this.data.genderValue
      })
      .catch((res) => {})

  },

  //this function is disabled, use updateAllMemberInfo instead
  updateMemberInfo: function() {},

  updateAllMemberInfo: function() {
    return new Promise((resolve, reject) => {
      var addr = {}
      addr.province = this.data.province.index == 0 ? "" : this.data.province.options.areaName[this.data.province.index]
      addr.city = this.data.city.index == 0 ? "" : this.data.city.options.areaName[this.data.city.index]
      addr.county = this.data.district.index == 0 ? "" : this.data.district.options.areaName[this.data.district.index]
      addr.town = this.data.town.index == 0 ? "" : this.data.town.options.areaName[this.data.town.index]

      addr.provinceId = this.data.province.index == 0 ? "" : this.data.province.options.areaId[this.data.province.index]
      addr.cityId = this.data.city.index == 0 ? "" : this.data.city.options.areaId[this.data.city.index]
      addr.countyId = this.data.district.index == 0 ? "" : this.data.district.options.areaId[this.data.district.index]
      addr.townId = this.data.town.index == 0 ? "" : this.data.town.options.areaId[this.data.town.index]

      addr.detail = this.data.detailedAddress
      var postData = {
        memberId: getApp().globalData.userInfo.memberId,
        memberName: this.data.memberNameValue,
        gender: this.data.genderValue,
        birthday: this.data.birthdayValue,
        // optional items
        identityNumber: this.data.idCardNumberValue,
        familySize: this.data.familyNumber.index == 0 ? "" : this.data.familyNumber.options[this.data.familyNumber.index],
        education: this.data.eduDegree.index == 0 ? "" : this.data.eduDegree.options[this.data.eduDegree.index],
        occupation: this.data.profession.index == 0 ? "" : this.data.profession.options[this.data.profession.index],
        familyIncome: this.data.annualIncome.index == 0 ? "" : this.data.annualIncome.options[this.data.annualIncome.index],
        address: addr
      }
      utils.putRequest(backendUrlUserInfo, postData)
        .then(() => {
          //更新主页的姓名信息
          var pages = getCurrentPages();
          if (pages.length > 1) {
            var prePage = pages[pages.length - 2];
            prePage.updateNameData(this.data.memberNameValue)
            prePage.requestDegreeInfo()
          }
          wx.showToast({
            icon: 'success',
            title: '保存成功',
          })
          resolve()
        })
        .catch((errorCode) => {
          utils.errorHander(errorCode, this.updateAllMemberInfo)
            .then(() => {
              resolve()
            })
            .catch(() => {
              reject()
            })
        })
    })
  },

  //address
  getProvinceList: function() {
    return new Promise((resolve, reject) => {
      var postData = {
        areaId: 1,
        regional: "province"
      }
      utils.postRequest(backendUrlAddress, postData)
        .then((data) => {
          var areaIdTmp = [0]
          var areaNameTmp = ["请选择"]
          for (let i = 0; i < data.result.length; i++) {
            areaIdTmp.push(data.result[i].areaId)
            areaNameTmp.push(data.result[i].areaName)
          }
          this.setData({
            'province.options.areaId': areaIdTmp,
            'province.options.areaName': areaNameTmp,
            'province.index': 0,
            'city.index': 0,
            'district.index': 0,
            'town.index': 0,
          })
          resolve()
        })
        .catch((errorCode) => {
          console.log(errorCode)
          utils.errorHander(errorCode, this.getProvinceList)
            .then(() => {
              resolve()
            })
            .catch(() => {
              reject()
            })
        })
    })
  },

  getCityList: function(cityIndex = null) {
    return new Promise((resolve, reject) => {
      var index = this.data.province.index;
      if (index === 0) {
        return resolve()
      }
      var postData = {
        areaId: this.data.province.options.areaId[index],
        regional: "city"
      }
      utils.postRequest(backendUrlAddress, postData)
        .then((data) => {
          var areaIdTmp = [0]
          var areaNameTmp = ["请选择"]
          for (let i = 0; i < data.result.length; i++) {
            areaIdTmp.push(data.result[i].areaId)
            areaNameTmp.push(data.result[i].areaName)
          }
          this.setData({
            'city.options.areaId': areaIdTmp,
            'city.options.areaName': areaNameTmp,
            'city.index': (cityIndex !== null) ? cityIndex : (this.data.city.index ? this.data.city.index : 0),
            'district.index': this.data.district.index ? this.data.district.index : 0,
            'town.index': this.data.town.index ? this.data.town.index : 0,
          })
          resolve()
        })
        .catch((errorCode) => {
          utils.errorHander(errorCode, this.getProvinceList)
            .then(() => {
              resolve()
            })
            .catch(() => {
              reject()
            })
        })
    })
  },

  getDistrictList: function() {
    return new Promise((resolve, reject) => {
      const index = this.data.city.index;
      if (index === 0) {
        return resolve();
      }
      var postData = {
        areaId: this.data.city.options.areaId[index],
        regional: "county"
      }
      utils.postRequest(backendUrlAddress, postData)
        .then((data) => {
          var areaIdTmp = [0]
          var areaNameTmp = ["请选择"]
          for (let i = 0; i < data.result.length; i++) {
            areaIdTmp.push(data.result[i].areaId)
            areaNameTmp.push(data.result[i].areaName)
          }
          this.setData({
            'district.options.areaId': areaIdTmp,
            'district.options.areaName': areaNameTmp,
            'district.index': this.data.district.index ? this.data.district.index : 0,
            'town.index': this.data.town.index ? this.data.town.index : 0,
          })
          resolve()
        })
        .catch((errorCode) => {
          utils.errorHander(errorCode, this.getDistrictList)
            .then(() => {
              resolve()
            })
            .catch(() => {
              reject()
            })
        })
    })
  },
  getTownList: function() {
    return new Promise((resolve, reject) => {
      var index = this.data.district.index;
      if (index === 0) {
        return resolve()
      }
      var postData = {
        areaId: this.data.district.options.areaId[index],
        regional: "town"
      }
      utils.postRequest(backendUrlAddress, postData)
        .then((data) => {
          var areaIdTmp = [0]
          var areaNameTmp = ["请选择"]
          for (let i = 0; i < data.result.length; i++) {
            areaIdTmp.push(data.result[i].areaId)
            areaNameTmp.push(data.result[i].areaName)
          }
          this.setData({
            'town.options.areaId': areaIdTmp,
            'town.options.areaName': areaNameTmp,
            'town.index': this.data.town.index ? this.data.town.index : 0,
          })
          resolve()
        })
        .catch((errorCode) => {
          utils.errorHander(errorCode, this.getTownList)
            .then(() => {
              resolve()
            })
            .catch(() => {
              reject()
            })
        })
    })
  },
  ...addressObj,
  ...map
})