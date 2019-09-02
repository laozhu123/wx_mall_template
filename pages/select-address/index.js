const WXAPI = require('../../wxapi/main')
const app = getApp()
Page({
  data: {
    addressList: []
  },

  selectTap: function(e) {
    var id = e.currentTarget.dataset.id;
    WXAPI.updateAddress({
      id: id,
      first: 1
    }).then(function(res) {
      wx.navigateBack({})
    })
  },

  addAddess: function() {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },

  editAddess: function(e) {
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
    })
  },

  onLoad: function() {
    console.log('onLoad')


  },
  onShow: function() {
    this.initShippingAddress();
  },
  initShippingAddress: function() {
    var that = this;
    WXAPI.queryAddress({}).then(function(res) {
      if (res.code == 0) {
        that.setData({
          addressList: res.data.list
        });
      } else if (res.code == 700) {
        that.setData({
          addressList: null
        });
      }
    })
  }

})