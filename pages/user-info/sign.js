// pages/user-info/sign.js
const WXAPI = require('../../wxapi/main')
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    content: "",
    num: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      content: options.desc,
      num: options.desc.length
    })
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

  save: function (e) {
    WXAPI.updateUserInfo({
     desc: this.data.content
    }).then(function (res) {
      if (res.code === 0) {
        wx.navigateBack({})
        return
      } else {
        wx.showModal({
          title: '提示',
          content: '保存失败',
          showCancel: false
        })
      }
    })
  },

  inputChange: function(e){
    this.setData({
      num: e.detail.value.length,
      content: e.detail.value
    })
  }
})