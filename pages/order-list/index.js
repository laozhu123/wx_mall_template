const wxpay = require('../../utils/pay.js')
const app = getApp()
const WXAPI = require('../../wxapi/main')
Page({
  data: {
    statusType: ["待支付", "待发货", "待收货", "待评价", "全部"],
    hasRefund: false,
    currentType: 0,
    tabNum: [0, 0, 0, 0, 0]
  },
  statusTap: function (e) {
    const curType = e.currentTarget.dataset.index;
    this.data.currentType = curType
    this.setData({
      currentType: curType
    });
    this.onShow();
  },
  cancelOrderTap: function (e) {
    const that = this;
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          WXAPI.updateOrder({
            id: orderId,
            status: 4
          }).then(function (res) {
            if (res.code == 0) {
              that.onShow();
            }
          })
        }
      }
    })
  },
  refundApply(e) {
    // 申请售后
    const orderId = e.currentTarget.dataset.id;
    const amount = e.currentTarget.dataset.amount;
    wx.navigateTo({
      url: "/pages/order/refundApply?id=" + orderId + "&amount=" + amount
    })
  },
  toPayTap: function (e) {
    const that = this;
    let { orderId, realPrice } = e.detail.value
    console.log(e.detail.value)


    let _msg = '订单金额: ' + realPrice/100 + ' 元'
    _msg += ',可用余额为 ' + 0 + ' 元'
    _msg += ',仍需微信支付 ' + realPrice/100  + ' 元'


    wx.showModal({
      title: '请确认支付',
      content: _msg,
      confirmText: "确认支付",
      cancelText: "取消支付",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          that._toPayTap(orderId, realPrice, e.detail.form_id)
        } else {
          console.log('用户点击取消支付')
        }
      }
    })
  },

  _toPayTap: function (orderId, money, formId) {
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
      }else{
        wx.showToast({
          title: '微信支付失败',
          icon: 'none'
        })
      }
    })

  },
  onLoad: function (options) {
    if (options && options.type) {
      if (options.type == 99) {
        this.setData({
          hasRefund: true,
          currentType: options.type
        });
      } else {
        this.setData({
          hasRefund: false,
          currentType: options.type
        });
      }
    }
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成

  },
  getOrderStatistics: function () {
    var that = this;
    WXAPI.orderStatistics({}).then(function (res) {
      if (res.code == 0) {
        var tabNum = that.data.tabNum

        tabNum[0] = res.data.count_id_no_pay
        tabNum[1] = res.data.count_id_no_transfer
        tabNum[2] = res.data.count_id_no_confirm
        tabNum[3] = res.data.count_id_no_reputation

        that.setData({
          tabNum: tabNum
        });
      }
    })
  },
  onShow: function () {
    // 获取订单列表
    var that = this;
    var postData = {
      token: wx.getStorageSync('token')
    };
    postData.type = 1
    if (that.data.currentType == 4) {
      postData.status = -1
    } else {
      postData.status = that.data.currentType;
    }
    if (postData.status)
      this.getOrderStatistics();
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

  },
  judgeOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order/judge?id=" + orderId
    })
  },
  receive: function (e) {
    var that = this
    const orderId = e.currentTarget.dataset.id;
    WXAPI.updateOrder({
      id: orderId,
      status: 3
    }).then(function (res) {
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