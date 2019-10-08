const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    inputShowed: false, // 是否显示搜索框
    inputVal: "", // 搜索框内容
    category_box_width: 750, //分类总宽度
  
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    interval2: 5000,
    duration: 1000,
    loadingHidden: false, // loading
    userInfo: {},
    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],

    scrollTop: 0,
    loadingMoreHidden: true,

    coupons: [],
    cateScrollTop: 0,
    color: '#289987',

    curPage: 1,
    pageSize: 20,
    canLoadMore: false,
    goods: [],
  },

  
  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  onLoad: function (e) {
    wx.showShareMenu({
      withShareTicket: true
    })
    const that = this
    // if (e && e.query && e.query.inviter_id) { 
    //   wx.setStorageSync('referrer', e.query.inviter_id)
    // }
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    /**
     * 示例：
     * 调用接口封装方法
     */
    WXAPI.banners({
      type: '1'
    }).then(function (res) {
      if (res.code == 700) {
        wx.showModal({
          title: '提示',
          content: '请在后台添加 banner 轮播图片，自定义类型填写 new',
          showCancel: false
        })
      } else {
        that.setData({
          banners: res.data.list
        });
      }
    }).catch(function (e) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    })
    that.getCoupons()
    that.getNotice()
    that.getGoodsList()
  },
  onShow: function(){
    this.getCoupons()
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
    if (this.data.canLoadMore) {
      this.data.setData({
        curPage: this.data.curPage + 1
      })
      this.getGoodsList(true)
    }
  },
  getGoodsList: function (append) {
    var that = this;
    WXAPI.goods({
      start: (this.data.curPage - 1) * this.data.pageSize,
      limit: this.data.pageSize,
      type: 1,
      name: that.data.inputVal,
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
      if (res.data.list.length == that.data.pageSize) {
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
  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  
  getCoupons: function () {
    var that = this;
    WXAPI.getAllCoupons({}).then(function (res) {
      if (res.code == 0) {
        that.setData({
          coupons: res.data
        });
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: '"' + wx.getStorageSync('mallName') + '" ' + CONFIG.shareProfile,
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  getNotice: function () {
    var that = this;
    WXAPI.noticeList({ type : 1 }).then(function (res) {
      if (res.code == 0) {
        that.setData({
          noticeList: res.data.list
        });
      }
    })
  },
  toSearch: function () {
    this.setData({
      curPage: 1
    });
    this.getGoodsList(false);
  },
  // onReachBottom: function () {
  //   this.setData({
  //     curPage: this.data.curPage + 1
  //   });
  //   this.getGoodsList(this.data.activeCategoryId, true)
  // },
  // onPullDownRefresh: function () {
  //   this.setData({
  //     curPage: 1
  //   });
  //   this.getGoodsList(this.data.activeCategoryId)
  //   wx.stopPullDownRefresh()
  // },
  // 以下为搜索框事件
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  goCoupons: function (e) {
    wx.navigateTo({
      url: "/pages/coupons-new/index"
    })
  },
  // 以下为搜索框事件
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
})