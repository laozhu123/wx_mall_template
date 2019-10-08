const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupons: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    that.getCoupons()
  },

  getCoupons: function () {
    var that = this;
    WXAPI.getAllCoupons({}).then(function (res) {
      if (res.code == 0) {
        that.setData({
          coupons: res.data
        });
      }
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

  getCounpon: function (e) {
    const that = this
    WXAPI.robCoupons({
      coupon_id: e.currentTarget.dataset.id,
    }).then(function (res) {
      if (res.code == 0) {
        wx.showToast({
          title: '领取成功，赶紧去下单吧~',
          icon: 'success',
          duration: 2000
        })
        that.getCoupons()
      } else {
        wx.showModal({
          title: '错误',
          content: res.msg,
          showCancel: false
        })
      }
    })
  },
})