const shopsData = require('./shops.js').default;
var utils = require("../../utils/util.js");
var URLs = require("../../utils/envConf.js").Api;
const backendUrlAddress = URLs.backendUrlAddress

export default {
  isDefault: false,
  formSubmit: function(e) {
    // user 
    var user = AV.User.current();
    // detail
    var detail = e.detail.value.detail;
    // realname
    var realname = e.detail.value.realname;
    // mobile
    var mobile = e.detail.value.mobile;
    // 表单验证
    if (this.data.areaSelectedStr == '请选择省市区') {
      wx.showToast({
        title: '请输入区域'
      });
      return;
    }
    if (detail == '') {
      wx.showToast({
        title: '请填写详情地址'
      });
      return;
    }
    if (realname == '') {
      wx.showToast({
        title: '请填写收件人'
      });
      return;
    }
    if (!(/^1[34578]\d{9}$/.test(mobile))) {
      wx.showToast({
        title: '请填写正确手机号码'
      });
      return;
    }
    // save address to leanCloud
    var address = new AV.Object('Address');
    // 如果是编辑地址而不是新增
    if (this.data.address != undefined) {
      address = this.data.address;
    }
    // if isDefault address
    address.set('isDefault', this.isDefault);
    address.set('detail', detail);
    // set province city region
    address.set('province', this.data.province[this.data.provinceIndex]);
    address.set('city', this.data.city[this.data.cityIndex]);
    address.set('region', this.data.region[this.data.regionIndex]);
    address.set('town', this.data.town[this.data.townIndex]);
    address.set('user', user);
    address.set('realname', realname);
    address.set('mobile', mobile);
    var that = this;
    address.save().then(function(address) {
      // that.setData('address', address);
      wx.showToast({
        title: '保存成功',
        duration: 500
      });
      // 等待半秒，toast消失后返回上一页
      setTimeout(function() {
        wx.navigateBack();
      }, 500);
    }, function(error) {
      console.log(error);
    });
  },
  // data: {
  //   current: 0,
  //   province: [],
  //   city: [],
  //   region: [],
  //   town: [],
  //   provinceObjects: [],
  //   cityObjects: [],
  //   regionObjects: [],
  //   townObjects: [],
  //   areaSelectedStr: '请选择省市区',
  //   maskVisual: 'hidden',
  //   provinceName: '请选择'
  // },
  getArea: function(pid, cb) {
    var that = this;
    // query area by pid
    // var query = new AV.Query('Area');
    // query.equalTo('pid', pid);
    this.getProvinceList()
      .then((data) => {
        return new Promise(resolve => resolve(data))
        debugger;
        // return this.requestUserInfoDetail()
        //   .then(() => {
        //     this.setData({
        //       inputMemberName: this.data.memberNameValue,
        //       genderValue: getApp().globalData.userInfo.gender,
        //     })

        //     this.data.genderBKImage.forEach((item, index) => {
        //       if (item.key == getApp().globalData.userInfo.gender) {
        //         this.setData({
        //           genderImgSrc: item.imageSrc
        //         });
        //       }
        //     });
        //   })
        //   .catch(() => {

        //   })
      })
      .then(this.getCityList)
      .then(this.getDistrictList)
      .then(this.getTownList)
      .then(function(area) {
        cb(area);
      }, function(err) {
        debugger;
      })
      .catch(() => {
        debugger;
      });
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
            // province: array,
            provinceObjects: data.result
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
  bindProvinceChange: function(e) {
    this.setData({
      'province.index': e.currentTarget.dataset.index, //e.detail.value,
      'city.index': 0,
      'district.index': 0,
      'town.index': 0
    })

    if (this.data.province.index == 0) {
      return
    }

    this.getCityList(0)
      .then(() => {
        // 确保生成了数组数据再移动swiper
        this.setData({
          current: 1
        });
      })
      .catch((err) => {
        console.log(`Promise err:${err}`)
      })
  },
  bindCityChange: function(e) {
    this.setData({
      'city.index': e.currentTarget.dataset.index,
      'district.index': 0,
      'town.index': 0
    })
    if (this.data.city.index == 0) {
      return
    }

    this.getDistrictList()
      .then(() => {
        this.setData({
          current: 2
        });
      })
      .catch(() => {})
  },
  bindDistrictChange: function(e) {
    this.setData({
      'district.index': e.currentTarget.dataset.index,
      'town.index': 0
    })
    if (this.data.district.index == 0) {
      return
    }

    this.getTownList()
      .then(() => {
        this.setData({
          current: 3
        });
      })
      .catch(() => {})
  },
  bindTownChange: function(e) {
    this.setData({
      'town.index': e.currentTarget.dataset.index
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
  // onLoad: function (options) {
  //   // 实例化API核心类
  //   qqmapsdk = new QQMapWX({
  //     key: 'BJFBZ-ZFTHW-Y2HRO-RL2UZ-M6EC3-GMF4U'
  //   });
  //   var that = this;
  //   // load province
  //   this.getArea(0, function (area) {
  //     // var array = [];
  //     // for (var i = 0; i < area.length; i++) {
  //     //   array[i] = area[i].get('name');
  //     // }
  //     // that.setData({
  //     //   province: array,
  //     //   provinceObjects: area
  //     // });
  //   });
  //   // if isDefault, address is empty
  //   this.setDefault();
  //   // this.cascadePopup();
  //   this.loadAddress(options);
  //   // TODO:load default city...
  // },
  loadAddress: function(options) {
    var that = this;
    if (options.objectId != undefined) {
      // 第一个参数是 className，第二个参数是 objectId
      var address = AV.Object.createWithoutData('Address', options.objectId);
      address.fetch().then(function() {
        that.setData({
          address: address,
          areaSelectedStr: address.get('province') + address.get('city') + address.get('region') + address.get('town')
        });
      }, function(error) {
        // 异常处理
      });
    }
  },
  setDefault: function() {
    var that = this;
    var user = AV.User.current();
    // if user has no address, set the address for default
    var query = new AV.Query('Address');
    query.equalTo('user', user);
    query.count().then(function(count) {
      if (count <= 0) {
        that.isDefault = true;
      }
    });
  },
  catchEvt() {

  },
  cascadePopup: function() {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-in-out',
    });
    this.animation = animation;
    animation.translateY('-100%').step();
    this.setData({
      ishidden: false,
      animationData: this.animation.export(),
      maskVisual: 'show'
    });
  },
  cascadeDismiss: function() {
    if (this.animation) {
      this.animation.translateY(285).step();
      this.setData({
        animationData: this.animation.export(),
        maskVisual: 'hidden'
      });
    }
  },
  provinceTapped: function(e) {
    // 标识当前点击省份，记录其名称与主键id都依赖它
    var index = e.currentTarget.dataset.index;
    // current为1，使得页面向左滑动一页至市级列表
    // provinceIndex是市区数据的标识
    this.setData({
      provinceName: this.data.province[index],
      regionName: '',
      townName: '',
      provinceIndex: index,
      cityIndex: -1,
      regionIndex: -1,
      townIndex: -1,
      region: [],
      town: []
    });
    var that = this;
    //provinceObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
    // getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
    this.getArea(this.data.provinceObjects[index].get('aid'), function(area) {
      var array = [];
      for (var i = 0; i < area.length; i++) {
        array[i] = area[i].get('name');
      }
      // city就是wxml中渲染要用到的城市数据，cityObjects是LeanCloud对象，用于县级标识取值
      that.setData({
        cityName: '请选择',
        city: array,
        cityObjects: area
      });
      // 确保生成了数组数据再移动swiper
      that.setData({
        current: 1
      });
    });
  },
  cityTapped: function(e) {
    // 标识当前点击县级，记录其名称与主键id都依赖它
    var index = e.currentTarget.dataset.index;
    // current为1，使得页面向左滑动一页至市级列表
    // cityIndex是市区数据的标识
    this.setData({
      cityIndex: index,
      regionIndex: -1,
      townIndex: -1,
      cityName: this.data.city[index],
      regionName: '',
      townName: '',
      town: []
    });
    var that = this;
    //cityObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
    // getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
    this.getArea(this.data.cityObjects[index].get('aid'), function(area) {
      var array = [];
      for (var i = 0; i < area.length; i++) {
        array[i] = area[i].get('name');
      }
      // region就是wxml中渲染要用到的城市数据，regionObjects是LeanCloud对象，用于县级标识取值
      that.setData({
        regionName: '请选择',
        region: array,
        regionObjects: area
      });
      // 确保生成了数组数据再移动swiper
      that.setData({
        current: 2
      });
    });
  },
  regionTapped: function(e) {
    // 标识当前点击镇级，记录其名称与主键id都依赖它
    var index = e.currentTarget.dataset.index;
    // current为1，使得页面向左滑动一页至市级列表
    // regionIndex是县级数据的标识
    this.setData({
      regionIndex: index,
      townIndex: -1,
      regionName: this.data.region[index],
      townName: ''
    });
    var that = this;
    //townObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
    // getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
    this.getArea(this.data.regionObjects[index].get('aid'), function(area) {
      // 假如没有镇一级了，关闭悬浮框，并显示地址
      if (area.length == 0) {
        var areaSelectedStr = that.data.provinceName + that.data.cityName + that.data.regionName;
        that.setData({
          areaSelectedStr: areaSelectedStr
        });
        that.cascadeDismiss();
        return;
      }
      var array = [];
      for (var i = 0; i < area.length; i++) {
        array[i] = area[i].get('name');
      }
      // region就是wxml中渲染要用到的县级数据，regionObjects是LeanCloud对象，用于县级标识取值
      that.setData({
        townName: '请选择',
        town: array,
        townObjects: area
      });
      // 确保生成了数组数据再移动swiper
      that.setData({
        current: 3
      });
    });
  },
  townTapped: function(e) {
    this.setData({
      'town.index': e.currentTarget.dataset.index
    })
    var addr = {}
    addr.province = this.data.province.index == 0 ? "" : this.data.province.options.areaName[this.data.province.index]
    addr.city = this.data.city.index == 0 ? "" : this.data.city.options.areaName[this.data.city.index]
    addr.county = this.data.district.index == 0 ? "" : this.data.district.options.areaName[this.data.district.index]
    addr.town = this.data.town.index == 0 ? "" : this.data.town.options.areaName[this.data.town.index]
    // 标识当前点击镇级，记录其名称与主键id都依赖它
    var index = e.currentTarget.dataset.index;
    // townIndex是镇级数据的标识
    this.setData({
      townIndex: index,
      townName: this.data.town.options.areaName[index]
    });
    var areaSelectedStr = addr.province + addr.city + addr.county + addr.town;
    this.setData({
      areaSelectedStr: areaSelectedStr,
      current: 4,
      shop: shopsData
    });

    // todo shop test data
    // wx.request({
    //   url: './address.json', //仅为示例，并非真实的接口地址
    //   data: {
    //     x: '',
    //     y: ''
    //   },
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success: function(res) {
    //     debugger;
    //     console.log(res.data)
    //     this.setData({
    //       areaSelectedStr: areaSelectedStr,
    //       current: 4
    //     });
    //   }
    // })
  },
  shopTapped(e) {
    this.setData({
      'shop.index': e.currentTarget.dataset.index, //e.detail.value,
      // 'city.index': 0,
      // 'district.index': 0,
      // 'town.index': 0
    })
    this.cascadeDismiss();

  },
  currentChanged: function(e) {
    // swiper滚动使得current值被动变化，用于高亮标记
    var current = e.detail.current;
    this.setData({
      current: current
    });
  },
  changeCurrent: function(e) {
    // 记录点击的标题所在的区级级别
    var current = e.currentTarget.dataset.current;
    this.setData({
      current: current
    });
  },
  fetchPOI: function() {
    var that = this;
    // 调用接口
    qqmapsdk.reverseGeocoder({
      poi_options: 'policy=2',
      get_poi: 1,
      success: function(res) {
        console.log(res);
        that.setData({
          areaSelectedStr: res.result.address
        });
      },
      fail: function(res) {
        //         console.log(res);
      },
      complete: function(res) {
        //         console.log(res);
      }
    });
  }
}