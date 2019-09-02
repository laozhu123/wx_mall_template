const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('../../wxapi/main')
Page({
	data: {
    balance:0.00,
    coupon:10,
    score:0,
    score_sign_continuous:0
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
    this.getUserAmount();
  },
  aboutUs : function () {
    wx.showModal({
      title: '关于我们',
      content: '欢迎使用本系统，快速搭建商城小程序，请联系我们。微信：qqq2830123',
      showCancel:false
    })
  },
  contactUs: function () {
    wx.showModal({
      title: '联系我们',
      content: '客服电话17764507394',
      confirmText: '拨打',
      success(res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '17764507394'
          })
        } else if (res.cancel) {
        }
      }
      
    })
  },

  // 获取积分、余额、优惠券信息
  getUserAmount: function () {
    var that = this;
    WXAPI.userAmount({}).then(function (res) {
      if (res.code == 0) {
        that.setData({
          coupon: res.data.coupon,
          balance: res.data.balance.toFixed(2),
          score: res.data.score
        });
      }
    })
  },
  // relogin:function(){
  //   app.navigateToLogin = false;
  //   app.goLoginPageTimeOut()
  // },
  goAsset: function () {
    wx.navigateTo({
      url: "/pages/asset/index"
    })
  },
  goCoupon: function () {
    wx.navigateTo({
      url: "/pages/coupon-list/index"
    })
  },
  goScore: function () {
    wx.navigateTo({
      url: "/pages/score/index"
    })
  },
  goOrder: function (e) {
    wx.navigateTo({
      url: "/pages/order-list/index?type=" + e.currentTarget.dataset.type
    })
  }
})