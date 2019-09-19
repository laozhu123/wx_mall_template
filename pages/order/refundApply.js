const regeneratorRuntime = require('../../utils/runtime')
const WXAPI = require('../../wxapi/main')
Page({
  data: {
    orderId: 1,
    amount: 999.00,
    max: 0,
    refundApplyDetail: undefined,

    types: ["我要退款(无需退货)", "我要退货退款","我要换货"],
    typeIndex: 0,

    logisticsStatuses: ["点击选择货物状态","未收到货","已收到货"],
    logisticsStatusIndex: 0,

    reasons: [
      "点击选择申请原因",
      "不喜欢/不想要",
      "空包裹",
      "未按约定时间发货",
      "快递/物流一直未送达",
      "货物破损已拒签",
      "退运费",
      "规格尺寸与商品页面描述不符",
      "功能/效果不符",
      "质量问题",
      "少件/漏发",
      "包装/商品破损",
      "发票问题",
    ],
    reasonIndex: 0,

    files: [],
    pics: [],
    content: "",
    num: 0,
    tel: ""
  },
  onLoad: function (e) {
    this.setData({
      orderId: e.id,
      amount: e.amount,
      max: e.amount,
    });
    const _this = this
    WXAPI.refundApplyDetail({ order_id: _this.data.orderId }).then(res => {
      if (res.code == 0) {
        _this.setData({
          refundApplyDetail: res.data,  // baseInfo, pics
          content: res.data.Remark,
          amount: res.data.Money,
          typeIndex: res.data.TypeIndex,
          reasonIndex: res.data.ReasonIndex,
          logisticsStatusIndex: res.data.LogisticsStatusIndex,
          tel: res.data.Tel,
          files: res.data.PicList,
        })
      }
    })
  },
  onShow() {
    
  },
  refundApplyCancel() {
    const _this = this
    WXAPI.refundApplyCancel({ order_id: _this.data.orderId}).then(res => {
      if (res.code == 0) {
        wx.navigateTo({
          url: "/pages/order-list/index"
        })
      }
    })
  },
  
  reasonChange: function (e) {
    this.setData({
      reasonIndex: e.detail.value
    })
  },
  typeChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },
  logisticsStatusChange: function (e) {
    this.setData({
      logisticsStatusIndex: e.detail.value
    })
  },
  chooseImage: function (e) {
    const that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
      }
    })
  },
  previewImage: function (e) {
    const that = this;
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: that.data.files // 需要预览的图片http链接列表
    })
  },

  inputChange: function (e) {
    this.setData({
      num: e.detail.value.length,
      content: e.detail.value
    })
  },

  bindSave: function (e) {
    const _this = this;
    // _this.data.orderId
    // _this.data.type
    // _this.data.logisticsStatus
    // _this.data.reasons[_this.data.reasonIndex]
    let amount = e.detail.value.amount.slice(1);
    if (_this.data.type == 2) {
      amount = 0.00
    }
    let tel = e.detail.value.tel

    // _this.data.pics
    WXAPI.refundApply(
      {
        order_id: _this.data.orderId,
        typ: _this.data.types[_this.data.typeIndex],
        type_index: _this.data.typeIndex,
        logistics_status: _this.data.logisticsStatuses[_this.data.logisticsStatusIndex],
        logistics_status_index: _this.data.logisticsStatusIndex,
        reason: _this.data.reasons[_this.data.reasonIndex],
        reason_index: _this.data.reasonIndex,
        money: amount,
        remark: _this.data.content,
        pics: _this.data.pics.join(),
        tel: tel,
      }
    ).then(res => {
      if (res.code == 0) {
        wx.showModal({
          title: '成功',
          content: '提交成功，请耐心等待我们处理！',
          showCancel: false,
          confirmText: '我知道了',
          success(res) {
            wx.navigateTo({
              url: "/pages/order-list/index"
            })
          }
        })
      } else {
        wx.showModal({
          title: '失败',
          content: res.msg,
          showCancel: false,
          confirmText: '我知道了',
          success(res) {
            wx.navigateTo({
              url: "/pages/order-list/index"
            })
          }
        })
      }
    })
  },
  uploadPics: function (e) {
    const _this = this;
    _this.data.pics = []
    let successNum = 0;
    let failNum = 0;
    if (_this.data.files.length > 0){
      for (let i = 0; i < _this.data.files.length; i++) {
        wx.uploadFile({
          url: 'https://www.007spy.cn/v1/image/upload_image', //仅为示例，非真实的接口地址
          filePath: _this.data.files[i],
          name: 'file',
          header: { "Content-Type": "multipart/form-data" },
          success: function (res) {
            var data = res.data
            data = data.split(',')[1].split('"')[3]
            //do something
            _this.data.pics.push(data)
            successNum++
            if (successNum == _this.data.files.length) {
              _this.bindSave(e)
            }
          },
          fail: function (res) {
            if (failNum == 0) {
              wx.showToast({
                title: '图片上传失败',
                icon: '',
                image: '',
                duration: 0,
                mask: true,
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
              })
              failNum++
            }

          }
        })
      }
    }else{
      _this.bindSave(e)
    }
  }
  
});