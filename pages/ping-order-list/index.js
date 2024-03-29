const wxpay = require('../../utils/pay.js')
const app = getApp()
const WXAPI = require('../../wxapi/main')
Page({
  data: {
    statusType: ["待支付", "拼团中", "待发货", "待收货", "全部"],
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
          WXAPI.updateOrder({ id: orderId, status: 4 }).then(function (res) {
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
    const orderId = e.currentTarget.dataset.id;
    let money = e.currentTarget.dataset.money;
    const needScore = e.currentTarget.dataset.score;
    WXAPI.userAmount(wx.getStorageSync('token')).then(function (res) {
      if (res.code == 0) {
        // 增加提示框
        if (res.data.score < needScore) {
          wx.showToast({
            title: '您的积分不足，无法支付',
            icon: 'none'
          })
          return;
        }
        let _msg = '订单金额: ' + money + ' 元'
        if (res.data.balance > 0) {
          _msg += ',可用余额为 ' + res.data.balance + ' 元'
          if (money - res.data.balance > 0) {
            _msg += ',仍需微信支付 ' + (money - res.data.balance) + ' 元'
          }
        }
        if (needScore > 0) {
          _msg += ',并扣除 ' + money + ' 积分'
        }
        money = money - res.data.balance
        wx.showModal({
          title: '请确认支付',
          content: _msg,
          confirmText: "确认支付",
          cancelText: "取消支付",
          success: function (res) {
            console.log(res);
            if (res.confirm) {
              that._toPayTap(orderId, money)
            } else {
              console.log('用户点击取消支付')
            }
          }
        });
      } else {
        wx.showModal({
          title: '错误',
          content: '无法获取用户资金信息',
          showCancel: false
        })
      }
    })
  },
  _toPayTap: function (orderId, money) {
    const _this = this
    if (money <= 0) {
      // 直接使用余额支付
      WXAPI.orderPay(orderId, wx.getStorageSync('token')).then(function (res) {
        _this.onShow();
      })
    } else {
      wxpay.wxpay('order', money, orderId, "/pages/order-list/index");
    }
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
    WXAPI.pingTuanOrderStatistics({}).then(function (res) {
      if (res.code == 0) {
        var tabNum = that.data.tabNum

        tabNum[0] = res.data.count_wait_pay
        tabNum[1] = res.data.count_pinging
        tabNum[2] = res.data.count_wait_send
        tabNum[3] = res.data.count_wait_receive

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
    if (that.data.currentType == 4) {
      postData.status = 0
    } else {
      postData.status = that.data.currentType + 1;
    }
    if (postData.status)
      this.getOrderStatistics();
    WXAPI.pingTuanOrderList(postData).then(function (res) {
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
    WXAPI.updateOrder({ id: orderId, status: 3 }).then(function (res) {
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