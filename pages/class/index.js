const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')
Page({
  data: {
    navLeftItems: [],
    navRightItems: [],
    curNav: 1,
    curIndex: 0,
    loadingMoreHidden: true,
    curPage: 1,
    pageSize: 20,
    cateScrollTop: 0,
    activeCategoryId: 0,
    shopList: [],
  },
  onLoad: function() {
    // 加载的使用进行网络访问，把需要的数据设置到data数据对象
    var that = this
    var shopList = [];
    // 获取购物车数据
    var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
    if (shopCarInfoMem && shopCarInfoMem.shopList) {
      shopList = shopCarInfoMem.shopList
    }
    that.setData({shopList: shopList})
    WXAPI.goodsCategory({
      type: '1',
      start: '0',
      limit: '1000'
    }).then(function(res) {
      let categories = [];
      if (res.code == 0) {
        categories = categories.concat(res.data.list)
      }

      if (categories.length > 0) {
        that.setData({
          navLeftItems: categories,
          activeCategoryId: categories[0].id,
          curNav: categories[0].id
        });
      } else {
        that.setData({
          navLeftItems: categories,
        });
      }
      that.getGoodsList(categories[0].id);
    })
  },

  //事件处理函数
  switchRightTab: function(e) {
    console.log("switchRightTab")
    // 获取item项的id，和数组的下标值
    let id = e.target.dataset.id
    // 把点击到的某一项，设为当前index
    this.setData({
      curNav: id,
      curPage: 1
    })
    this.getGoodsList(id);
  },
  loadMore: function() {
    console.log("loadMore")
    this.setData({
      curPage: this.data.curPage + 1
    });
    this.getGoodsList(this.data.curNav, true)
  },
  refresh: function() {
    console.log("refresh")
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.curNav)
  },
  getGoodsList: function(goodsTypeId, append) {
    var that = this;
    WXAPI.goods({
      goods_type_id: goodsTypeId,
      name: '',
      start: (this.data.curPage - 1) * this.data.pageSize,
      limit: this.data.pageSize,
      type: 1
    }).then(function(res) {
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
      if (res.data.list.length == that.data.pageSize){
        that.setData({
          loadingMoreHidden: true,
          goods: goods,
        });
      }else{
        that.setData({
          loadingMoreHidden: false,
          goods: goods,
        });
      }
      
    })
  },
  toDetailsTap: function(e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  goShopCart: function(e){
    wx.navigateTo({
      url: "/pages/shop-cart/index?id=" + e.currentTarget.dataset.id
    })
  },
  goHot: function (e) {
    wx.navigateTo({
      url: "/pages/shop-cart/index?id=" + e.currentTarget.dataset.id
    })
  },
  goKill: function (e) {
    wx.navigateTo({
      url: "/pages/shop-cart/index?id=" + e.currentTarget.dataset.id
    })
  },
  goLimit: function (e) {
    wx.navigateTo({
      url: "/pages/shop-cart/index?id=" + e.currentTarget.dataset.id
    })
  },
  goCut: function (e) {
    wx.navigateTo({
      url: "/pages/shop-cart/index?id=" + e.currentTarget.dataset.id
    })
  },
  goScore: function (e) {
    wx.navigateTo({
      url: "/pages/shop-cart/index?id=" + e.currentTarget.dataset.id
    })
  },
})