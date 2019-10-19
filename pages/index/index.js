// pages/index/index.js
const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('../../wxapi/main')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_head: "../../images/default_head.png",
    index: 0,
    powerImage: "../../images/power_on.png",
    user: undefined,
    openShare: false, // 展示邀请好友

    // 展示求助者信息
    help_img: "../../images/default_head.png",
    help_nick: "阿姆士特朗",
    help_index: "1",
    help_occupation: "资深航天员",
    show_help: false,
    hasHelpUser: false,

    // 显示加速动图
    show_speed_up: false,
    motion_img: "../../images/speed_rocket.gif",

    // 抽奖显示
    show_choujiang: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this
    wx.login({
      success: function (res) {
        WXAPI.login(res.code).then(function (res) {
          if (res.code != 0) {
            // 登录错误
            wx.showModal({
              title: '提示',
              content: '无法登录，请重试',
              showCancel: false
            })
            return;
          }else{
            wx.setStorageSync('token', res.data.token)
          }
        })
      }
    })

    if (e && e.userId) {
      console.log(e.userId,e.shopId)
      WXAPI.getUserInfoById({userId : e.userId}).then(function(res){
        if (res.code != 0) {
          
          // 登录错误
        } else {
          console.log('show_help')
          that.setData({
            help_img: res.data.Icon,
            help_nick:res.data.Nick,
            show_help: true,
            hasHelpUser: true,
          })
        }
      })
    }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //隐藏由share所产生的loading
    wx.hideLoading()
    var that = this
    
    let userInfo = wx.getStorageSync('userInfo')
    console.log(userInfo)
    if (userInfo){
      let userHead = that.data.user_head
      if (userInfo.avatarUrl != ""){
        userHead = userInfo.avatarUrl
      }
      that.setData({
        user_head: userHead,
      })
    }
    that.setData({
      openShare: false
    })
    this.getUserInfo()
    
    
  },

  goMyPage: function (e) {
    wx.navigateTo({
      url: "/pages/my/index"
    })
  },

  getUserInfo: function () {
    var that = this;
    WXAPI.getUserInfo({}).then(function (res) {
      if (res.code == 0) {
        console.log(res)
        that.setData({
          user: res.data,
          index: res.data.id
        })
      }
    })
  },

  showShareDiv: function () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      app.goLoginPageTimeOut()
    }else{
      that.setData({
        openShare: true
        // show_help: true
        // show_choujiang: true
      })
    }
  },

  closeShareDiv: function () {
    this.setData({
      openShare: false
    })
  },
  zhuli_cancel: function () {
    this.setData({
      show_help: false,
    })
  },
  zhuli: function () {
    var that = this
    //网络请求
    wx.showToast({
      title: '助力成功！',
      icon: '',
      image: '',
      duration: 1000,
      mask: true,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })

    // 展示升空gif动图
    this.setData({
      show_help: false,
      show_speed_up: true
    })
    
    setTimeout(function(){
      that.setData({
        show_choujiang: true,
        show_speed_up: false,
      })
    },2000)
    
  },

  choujiang: function(){
    //抽奖网络请求
    wx.showToast({
      title: '中奖啦',
      icon: '',
      image: '',
      duration: 1000,
      mask: true,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
    this.setData({
      show_choujiang: false
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    wx.showLoading({
      title: '加载中...',
    })
    return {
      title: '助力登月50周年', //自定义转发标题
      path: '/pages/index/index?userId='+this.data.user.id.toString()+'&shopId=1', //分享页面路径
    }
  }
})