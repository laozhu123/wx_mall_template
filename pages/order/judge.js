// pages/order/judge.js
const WXAPI = require('../../wxapi/main')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: 1,
    pics: [],
    files: [],
    describe: 0,
    service: 0,
    express: 0,
    num: 0,
    content: "",
    order: undefined,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    this.setData({
      orderId: e.id,
    });
    this.getOrderInfo()
  },

  getOrderInfo: function(){
    var that = this
    WXAPI.orderDetail({ id: that.data.orderId }).then(function (res) {
      if (res.code == 0) {
        that.setData({
          order: res.data
        })
      }else{
        wx.showToast({
          title: '订单信息获取失败',
          icon: 'none'
        })
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

  describeSelect: function(e){
    this.setData({
      describe: e.currentTarget.dataset.index
    })
  },

  serviceSelect: function (e) {
    this.setData({
      service: e.currentTarget.dataset.index
    })
  },
  
  expressSelect: function (e) {
    this.setData({
      express: e.currentTarget.dataset.index
    })
  },

  inputChange: function (e) {
    this.setData({
      num: e.detail.value.length,
      content: e.detail.value
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

  submit: function(){
    var that = this
    WXAPI.judgeOrder({
      order_id: that.data.orderId, 
    describe: that.data.describe, 
    service: that.data.service, 
    express: that.data.express,
    pics: that.data.pics,
    remark: that.data.content,
    }).then(res => {
      if (res.code == 0) {
        wx.showToast({
          title: '发表成功',
          content: 'none',
        })
        wx.navigateBack({})
      } else {
        wx.showToast({
          title: '发表失败',
          content: 'none',
        })
      }
    })
  },

  uploadPics: function (e) {
    if (this.data.describe==0||this.data.service ==0 ||this.data.express==0){
      wx.showToast({
        title: '请对订单评级',
        icon: 'none',
      })
      return
    }
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
              _this.submit()
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
      _this.submit()
    }
  },
  
})