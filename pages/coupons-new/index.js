const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupons: [{
      "id": 3,
      "Status": 0,
      "Name": "文具铅笔",
      "CreateTime": "2019-09-10 00:00:00",
      "Num": 3,
      "Color": "#2C9F67",
      "ExpireTime": "2020-01-01 00:00:00"
    }, {
        "id": 1,
        "Status": 1,
        "Name": "精品课程10节",
        "CreateTime": "2019-09-10 00:00:00",
        "Num": 3,
        "Color": "#5885CF",
        "ExpireTime": "2020-01-01 00:00:00"
      }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

  },

  getGift: function() {
    this.contactUs()
  },

   contactUs: function () {
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
})