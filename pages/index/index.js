const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    inputShowed: false, // 是否显示搜索框
    inputVal: "", // 搜索框内容
    category_box_width: 750, //分类总宽度
    goodsRecommend: [], // 推荐商品
    kanjiaList: [], //砍价商品列表
    pingtuanList: [], //拼团商品列表
    kanjiaGoodsMap: {}, //砍价商品列表

    indicatorDots: true,
    autoplay: true,
    interval: 3000,
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

    curPage: 1,
    pageSize: 20,
    cateScrollTop: 0
  },

  tabClick: function (e) {
    let offset = e.currentTarget.offsetLeft;
    if (offset > 150) {
      offset = offset - 150
    } else {
      offset = 0;
    }
    this.setData({
      activeCategoryId: e.currentTarget.id,
      curPage: 1,
      cateScrollTop: offset
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  bindTypeTap: function (e) {
    this.setData({
      selectCurrent: e.index
    })
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
    WXAPI.goodsCategory({
      type: '1'
    }).then(function (res) {
      // let categories = [{
      //   id: 0,
      //   icon: '/images/fl.png',
      //   name: "全部"
      // }];
      let categories = [];
      if (res.code == 0) {
        categories = categories.concat(res.data.list)
      }
      const _n = Math.ceil(categories.length / 2)
      // const _n = Math.ceil(categories.length)
      that.setData({
        categories: categories,
        category_box_width: 150 * _n,
        activeCategoryId: 0,
        curPage: 1
      });
      that.getGoodsList(0);
    })
    WXAPI.goods({
      type: '1',
      kind: '1'
    }).then(res => {
      if (res.code === 0) {
        that.setData({
          goodsRecommend: res.data.list
        })
      }
    })
    that.getCoupons()
    that.getNotice()
    that.kanjiaGoods()
    that.pingtuanGoods()
  },
  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  getGoodsList: function (goodsTypeId, append) {
    var that = this;
    WXAPI.goods({
      goods_type_id: goodsTypeId,
      name: that.data.inputVal,
      start: (this.data.curPage-1) * this.data.pageSize,
      limit: this.data.pageSize,
      type: 1
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
      for (var i = 0; i < res.data.list.length; i++) {
        goods.push(res.data.list[i]);
      }
      that.setData({
        loadingMoreHidden: true,
        goods: goods,
      });
    })
  },
  getCoupons: function () {
    var that = this;
    WXAPI.coupons({status : 0}).then(function (res) {
      if (res.code == 0) {
        that.setData({
          coupons: res.data.list
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
    this.getGoodsList(this.data.activeCategoryId);
  },
  onReachBottom: function () {
    this.setData({
      curPage: this.data.curPage + 1
    });
    this.getGoodsList(this.data.activeCategoryId, true)
  },
  onPullDownRefresh: function () {
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId)
    wx.stopPullDownRefresh()
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
  // 以下为砍价业务
  kanjiaGoods() {
    const _this = this
    WXAPI.kanjiaList({type : 1}).then(function (res) {
      if (res.code == 0) {
        _this.setData({
          kanjiaList: res.data.list,
          kanjiaGoodsMap: res.data.goodsMap
        })
      }
    })
  },
  goCoupons: function (e) {
    wx.navigateTo({
      url: "/pages/coupons/index"
    })
  },
  pingtuanGoods() { // 获取团购商品列表
    const _this = this
    WXAPI.goods({
      type : 1,
      kind : 3
    }).then(res => {
      if (res.code === 0) {
        _this.setData({
          pingtuanList: res.data.list
        })
      }
    })
  }
})