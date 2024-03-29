const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('../../wxapi/main')
const regeneratorRuntime = require('../../utils/runtime')
import imageUtil from '../../utils/image'

let ctx

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canvasstyle: undefined
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.data.goodsid = options.goodsid
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    const goodsDetailRes = await WXAPI.goodsDetail({ id: this.data.goodsid, type:1})
    this.data.pic = goodsDetailRes.data.basicInfo.Pic
    this.data.name = goodsDetailRes.data.basicInfo.Name
    this.downLoadGoodsPic()
  },
  downLoadGoodsPic() {
    const _this = this
    console.log(1)
    _this.downLoadQrcode(100)
    return
    wx.getImageInfo({
      src: _this.data.pic,
      success: (res) => {
        let imageSize = imageUtil(res.width, res.height)
        const additionHeight = 300
        _this.setData({
          canvasstyle: 'height:' + (imageSize.imageHeight + additionHeight) + 'px'
        })
        wx.showLoading({
          mask: true,
          title: '合成中...',
        })
        ctx = wx.createCanvasContext('myCanvas')
        ctx.setFillStyle('#fff')
        ctx.fillRect(0, 0, imageSize.windowWidth, imageSize.imageHeight + additionHeight)
        ctx.drawImage(res.path, imageSize.x, imageSize.y, imageSize.imageWidth, imageSize.imageHeight)

        ctx.setFontSize(16)
        ctx.setFillStyle('#e64340')
        ctx.setTextAlign('left')
        let name = _this.data.name
        ctx.fillText(name, 10, imageSize.imageHeight + 30)

        ctx.moveTo(10, imageSize.imageHeight + 50)
        ctx.setLineWidth(1)
        ctx.lineTo(imageSize.windowWidth - 10, imageSize.imageHeight + 50)
        ctx.setStrokeStyle('#eee')
        ctx.stroke()
        console.log(2)  
        _this.downLoadQrcode(imageSize)
      },
      fail: (res)=>{
        console.log(res)
      }
    })
  },
  downLoadQrcode(_imageSize) {
    console.log(3)
    const _this = this
    WXAPI.wxaQrcode({
      scene: _this.data.goodsid +',' + wx.getStorageSync('uid'),
      page: 'pages/goods-details/index',
      is_hyaline: 1,
    }).then(res => {
      console.log(4)
      if (res.code !== 0) {
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })
      } else {
        const imageUrl = res.data
        wx.getImageInfo({
          src: imageUrl,
          success: (res) => {
            wx.showLoading({
              mask: true,
              title: '合成中...',
            })
            let left = _imageSize.windowWidth / 3
            ctx = wx.createCanvasContext('myCanvas')
            ctx.drawImage(imageUrl, 240, 50, 200, 200)
            
            ctx.setFontSize(12)
            ctx.setFillStyle('#e64340')
            ctx.setTextAlign('center')
            ctx.fillText('长按识别小程序码 即可买买买~', _imageSize.windowWidth / 2, _imageSize.imageHeight + 80 + left + 50)

            setTimeout(function () {
              wx.hideLoading()
              ctx.draw()
            }, 1000)
          }
        })
      }
    })
  },
  saveToMobile() {
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      success: function (res) {
        let tempFilePath = res.tempFilePath
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: (res) => {
            wx.showModal({
              content: '图片已保存到手机相册',
              showCancel: false,
              confirmText: '知道了',
              confirmColor: '#333'
            })
          },
          fail: (res) => {
            wx.showToast({
              title: res.errMsg,
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    })
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

  }
})