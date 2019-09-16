const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('../../wxapi/main')
Page({
  data: {
    balance: 0.00,
    coupon: 10,
    score: 0,
    score_sign_continuous: 0
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
        version: CONFIG.version
      })
    }
    this.getUserInfo();
    this.getUserAmount();
  },
  // userInfoHandler: function(res) {
  //   let that = this;
  //   // 可以将 res 发送给后台解码出 unionId
  //   app.globalData.userInfo = res.detail.userInfo
  //   wx.setStorageSync('userInfo', res.detail.userInfo)
  //   that.setData({
  //     userInfo: res.detail.userInfo
  //   })
  // },
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

  // 获取积分、余额、优惠券信息
  getUserAmount: function() {
    var that = this;
    WXAPI.userAmount({}).then(function(res) {
      if (res.code == 0) {
        that.setData({
          coupon: res.data.coupon,
          balance: (res.data.balance/100).toFixed(2),
          score: res.data.score
        });
      }
    })
  },

  getUserInfo: function(){
    var that = this;
    WXAPI.getUserInfo({}).then(function(res){
      if (res.code == 0) {
        that.setData({
          tel: res.data.Tel.slice(0, 3) + '****' + res.data.Tel.slice(7,11)
        })
      }
    })
  },

  // relogin:function(){
  //   app.navigateToLogin = false;
  //   app.goLoginPageTimeOut()
  // },
  goAsset: function() {
    wx.navigateTo({
      url: "/pages/asset/index"
    })
  },
  goCoupon: function() {
    wx.navigateTo({
      url: "/pages/coupons/index"
    })
  },
  goScore: function() {
    wx.navigateTo({
      url: "/pages/score/index"
    })
  },
  goToUserInfo: function () {
    wx.navigateTo({
      url: "/pages/user-info/index"
    })
  },
  
  goOrder: function(e) {
    wx.navigateTo({
      url: "/pages/order-list/index?type=" + e.currentTarget.dataset.type
    })
  },

  goAddress: function (e) {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  goPinOrder: function (e) {
    wx.navigateTo({
      url: "/pages/ping-order-list/index"
    })
  },
  
})