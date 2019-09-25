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
  toPayTap: function (e) {
    
    let that = this
    let _msg = '订单金额: ' + this.data.orderDetail.orderInfo.RealPrice / 100 + ' 元'
    _msg += ',可用余额为 ' + 0 + ' 元'
    _msg += ',仍需微信支付 ' + this.data.orderDetail.orderInfo.RealPrice / 100 + ' 元'

    wx.showModal({
      title: '请确认支付',
      content: _msg,
      confirmText: "确认支付",
      cancelText: "取消支付",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          that._toPayTap(that.data.orderId, e.detail.formId)
        } else {
          console.log('用户点击取消支付')
        }
      }
    })
  },
  _toPayTap: function (orderId, formId) {
    const _this = this

    WXAPI.getPayOrderId({ id: orderId, form_id: formId }).then(function (res) {
      if (res.code == 0) {
        wx.requestPayment(
          {
            'timeStamp': res.data.wx_reply.timeStamp,
            'nonceStr': res.data.wx_reply.nonceStr,
            'package': 'prepay_id=' + res.data.wx_reply.prepayId,
            'signType': res.data.wx_reply.signType,
            'paySign': res.data.wx_reply.paySign,
            'success': function (res) {
              wx.showToast({
                title: '支付成功',
                icon: 'none'
              })
            },
            'fail': function (res) {
              wx.showToast({
                title: '支付失败',
                icon: 'none'
              })
            },
            'complete': function (res) { }
          })
      } else {
        wx.showToast({
          title: '微信支付失败',
          icon: 'none'
        })
      }
    })

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