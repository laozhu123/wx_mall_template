const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    kind: 0,
    curPage: 1,
    pageSize: 20,
    canLoadMore: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      kind: options.kind,
    })
    this.getGoodsList(false)
    switch(options.kind){
      case '1':
        wx.setNavigationBarTitle({
          title: '爆款推荐'
        })
        break
      case '2':
        wx.setNavigationBarTitle({
          title: '0元砍价'
        })
        break
      case '3':
        wx.setNavigationBarTitle({
          title: '优惠团购'
        })
        break
      case '4':
        wx.setNavigationBarTitle({
          title: '限时秒杀'
        })
        break
      case '6':
        wx.setNavigationBarTitle({
          title: '积分商城'
        })
        break
    }
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
    this.setData({
      curPage: 1,
      pageSize: 20
    })
    this.getGoodsList(false)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.canLoadMore){
      this.data.setData({
        curPage: this.data.curPage+1
      })
      this.getGoodsList(true)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getGoodsList: function (append) {
    var that = this;
    WXAPI.goods({
      start: (this.data.curPage - 1) * this.data.pageSize,
      limit: this.data.pageSize,
      type: 1,
      kind: this.data.kind,
    }).then(function (res) {
      wx.hideLoading()
      if (res.code == 404 || res.code == 700 || res.data.list.length == 0) {
        let newData = {
          loadingMoreHidden: false
        }
        if (!append) {
          newData.goods = []
        }
        that.setData(newData);
        return
      }
      let goods = [];
      if (append) {
        goods = that.data.list
      }
      var canLoadMore = false
      if (res.data.list.length == that.data.pageSize){
        canLoadMore = true
      }
      for (var i = 0; i < res.data.list.length; i++) {
        goods.push(res.data.list[i]);
      }
      that.setData({
        loadingMoreHidden: true,
        goods: goods,
        canLoadMore: canLoadMore,
      });
    })
  },

  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
})