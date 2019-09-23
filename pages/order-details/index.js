const app = getApp();
const CONFIG = require('../../config.js')
const WXAPI = require('../../wxapi/main')
Page({
  data: {
    orderId: 0,
    goodsList: [],
    yunPrice: "0.00",
    appid: CONFIG.appid,
    expireTime: "",
  },
  onLoad: function (e) {
    var orderId = e.id;
    this.data.orderId = orderId;
    this.setData({
      orderId: orderId
    });
  },
  onShow: function () {
    var that = this;
    WXAPI.orderDetail({ id: that.data.orderId }).then(function (res) {
      if (res.code != 0) {
        wx.showModal({
          title: '错误',
          content: res.msg,
          showCancel: false
        })
        return;
      }
      that.setData({
        orderDetail: res.data,
        expireTime: res.data.orderInfo.ExpireTime.slice(5),
      });
    })
    var yunPrice = parseFloat(this.data.yunPrice);
    var allprice = 0;
    var goodsList = this.data.goodsList;
    for (var i = 0; i < goodsList.length; i++) {
      allprice += parseFloat(goodsList[0].price) * goodsList[0].number;
    }
    this.setData({
      allGoodsPrice: allprice,
      yunPrice: yunPrice
    });
  },
  wuliuDetailsTap: function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/wuliu/index?id=" + orderId
    })
  },


  cancelOrderTap: function () {
    const that = this;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          WXAPI.updateOrder({ id: that.data.orderId, status: 4 }).then(function (res) {
            if (res.code == 0) {
              that.onShow();
            }
          })
        }
      }
    })
  },
  toPayTap: function () {

  },
  refundApply: function () {
    // 申请售后
    wx.navigateTo({
      url: "/pages/order/refundApply?id=" + this.data.orderId + "&amount=" + this.data.orderDetail.orderInfo.RealPrice
    })
  },
  judgeOrder: function () {
    wx.navigateTo({
      url: "/pages/order/judge?id=" + this.data.orderId
    })
  },
  receive: function () {
    var that = this
    WXAPI.updateOrder({ id: that.data.orderId, status: 3 }).then(function (res) {
      if (res.code == 0) {
        wx.showToast({
          title: '收货成功',
        })
        that.setData({
          currentType: 3
        });
        that.onShow()

      } else {
        wx.showToast({
          title: '收货失败',
        })
      }
    })
  }
})