const WXAPI = require('wxapi/main')

//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
              wx.setStorageSync('userInfo', res.userInfo)
              WXAPI.updateUserInfo({ nick: res.userInfo.nickName, sex: res.userInfo.gender, icon: res.userInfo.avatarUrl })
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    //  获取商城名称
    WXAPI.getAppDetail().then(function (res) {
      if (res.code == 0) {
        wx.setStorageSync("mallName", res.data.Name);
        wx.setStorageSync("ALLOW_SELF_COLLECTION", res.data.ZiTi);
        wx.setStorageSync("mallTel", res.data.Tel)
        wx.setStorageSync("bossName", res.data.BossName)
      }
    })

  },
  globalData: {
    userInfo: null
  },
  goLoginPageTimeOut: function () {
    if (this.navigateToLogin) {
      return
    }
    wx.removeStorageSync('token')
    this.navigateToLogin = true
    setTimeout(function () {
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
    }, 1000)
  },
})