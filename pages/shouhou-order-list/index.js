const wxpay = require('../../utils/pay.js')
const app = getApp()
const WXAPI = require('../../wxapi/main')
Page({
  data: {
    hasRefund: false,
  },
  refundApply(e) {
    // 申请售后
    const orderId = e.currentTarget.dataset.id;
    const amount = e.currentTarget.dataset.amount;
    wx.navigateTo({
      url: "/pages/order/refundApply?id=" + orderId + "&amount=" + amount
    })
  },
  onLoad: function (options) {
    
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成

  },
  onShow: function () {
    // 获取订单列表
    var postData = {}
    var that = this;
    postData.type = 1
    postData.status = 6
    WXAPI.orderList(postData).then(function (res) {
      if (res.code == 0) {
        that.setData({
          orderList: res.data.list,
          goodsMap: res.data.goodsMap
        });
      } else {
        that.setData({
          orderList: null,
          goodsMap: {}
        });
      }
    })
  },
  onHide: function () {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh: function () {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onReachBottom: function () {
    // 页面上拉触底事件的处理函数

  }
})