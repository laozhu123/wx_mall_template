const wxpay = require('../../utils/pay.js')
const app = getApp()
const WXAPI = require('../../wxapi/main')
Page({
  data: {
    statusType: ["未使用","已使用","已过期"],
    tabClass: ["", "", ""],
    currentType: 0
  },
  statusTap: function (e) {
    const curType = e.currentTarget.dataset.index;
    this.data.currentType = curType
    this.setData({
      currentType: curType
    });
    this.onShow();
  },
  onReady: function() {
    // 生命周期函数--监听页面初次渲染完成

  },
  onShow: function() {
    // 获取订单列表
    var that = this;
    var postData = {
      token: wx.getStorageSync('token')
    };
    
    WXAPI.orderList(postData).then(function(res) {
      if (res.code == 0) {
        that.setData({
          orderList: res.data.orderList
        });
      } else {
        that.setData({
          orderList: null
        });
      }
    })
  },
  onHide: function() {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function() {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数

  }
})