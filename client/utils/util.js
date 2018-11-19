import * as Statics from './statis.js';
const util = require('./util-jhd')
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}


// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
})

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})

// 显示失败提示
var showModal = (title, showCancel = true) => {
    return new Promise((resolve, reject) => {
        wx.hideToast();
        wx.showModal({
            title:"提示",
            content: title,
            showCancel,
            // confirmColor: '#EE711F',
            // cancelColor: '#EE711F',
            success(res) {
                if (res.confirm) {
                    resolve()
                }
            }
        })
    })
}

module.exports = {
  formatTime, showBusy, showSuccess, showModal, ...Statics,...util }
