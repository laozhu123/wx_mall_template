// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_head: "../../images/default_head.png",
    index: 0,
    showNotice: true,
    powerImage: "../../images/power_on.png"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    var that = this
    if (that.data.showNotice){
      var helo = setInterval(function () { that.setData({ showNotice: !that.data.showNotice }) }, 500)
      setInterval(function () { 
        var image = "../../images/power_on.png"
        if (that.data.powerImage == "../../images/power_on.png"){
          image = "../../images/power_off.png"
        }
        that.setData({ powerImage : image}) }, 300)
      setTimeout(function(){
          clearInterval(helo)
          that.setData({
          showNotice:false
          })
        },3000)
    }
  },

  share: function () {

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