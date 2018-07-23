var utils = require("util.js");
var URLs = require("envConf.js").Api;
var sha1 = require("sha1.js").hex_sha1

const backendUrlPayCodeToken = URLs.backendUrlPayCodeToken
/**
 * 时间间隔/秒
 */
const CLOCK_STEP = 60

/**
 * 前两位的标示
 */
const SIGN = "JH"

/**
 * bacode 长度 = 2 + 4 + MAX_CODE_LENGTH
 */
const MAX_CODE_LENGTH = 12


/**
 * 获取时间
 */
function getTime() {
  return ((new Date().getTime()) / 1000 / CLOCK_STEP).toFixed(0)
}


/**
 * 加密
 */
var genBarCode = function (token) {
  var time = getTime()
  var combine = token + time
  var opt = getOpt(combine)
  //var result = parseInt(token) * parseInt(opt) + ""
  var result = getSecondCode(token, opt)
  for (let i = 0; i < MAX_CODE_LENGTH - result.length; i++) {
    opt += "0";
  }
  return SIGN + opt + result
}
function makeToLen( value,  toLen) {
  while (value.length < toLen) {
    value = "0" + value;
  }
  return value;
}
/**
 * 计算barCode第二部分生成的值
 */
function getSecondCode(token,  opt) {
  var first = (parseInt(token.substring(0, 4)) + parseInt(opt)).toString()+"" ;
  var second = (parseInt(token.substring(4, 8)) + parseInt(opt))+"";
  var third = (parseInt(token.substring(8, 10)) + parseInt(opt.substring(3, 4)))+"";
  return makeToLen(first, 5) + makeToLen(second, 5) + makeToLen(third, 2);
}

/**
 * 获取otp
 */
function getOpt(combine) {
  // var sha = sha1(combine)
  // var string16 = sha + ''
  // var arr = string16.split("");
  // var charres = ""
  // for (let i = 0; i < string16.length; i++) {
  //   charres += string16[i].charCodeAt()
  // }
  // return charres.substring(charres.length - 4, charres.length);
  return combine.substring(combine.length - 4);
}
/**
 * 获取bar code token
 */
function getPayCodeToken() {
  return new Promise((resolve, reject) => {
    utils.getRequest(backendUrlPayCodeToken + getApp().globalData.userInfo.memberId)
      .then(data => {
        getApp().globalData.token.payCodeToken = data.result
        wx.setStorage({
          key: "payCodeToken",
          data: getApp().globalData.token.payCodeToken
        })
        resolve(data.result)
      })
      .catch(errorCode => {
        reject(errorCode)
      });
  })
}
module.exports = {
  genBarCode: genBarCode,
  getPayCodeToken: getPayCodeToken
}