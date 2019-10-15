const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('../../wxapi/main')
Page({
  data: {
    occupation: "资深宇航员",
    index: 1,
    id: 0,
  },
  onLoad() {

  },
  onShow() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      app.goLoginPageTimeOut()
    } else {
      that.setData({
        userInfo: userInfo,
      })
    }
    this.getUserInfo();
  },
  
  goCoupons: function(){
    wx.navigateTo({
      url: '/pages/coupons-new/index',
    })
  },

  aboutUs: function() {
    wx.showModal({
      title: '关于我们',
      content: '欢迎使用本系统，快速搭建商城小程序，请联系我们。微信：qqq2830123',
      showCancel: false
    })
  },
  contactUs: function() {
    var bossName = wx.getStorageSync("bossName")
    var tel = wx.getStorageSync("mallTel")
    wx.showModal({
      title: '联系我们',
      content: '客服电话：' + tel,
      confirmText: '拨打',
      success(res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: tel
          })
        } else if (res.cancel) { }
      }
    })
  },

  getUserInfo: function(){
    var that = this;
    WXAPI.getUserInfo({}).then(function(res){
      if (res.code == 0) {
        that.setData({
          id: res.data.id
        })
      }
    })
  },

})