const WXAPI = require('../../wxapi/main')
const app = getApp();
const WxParse = require('../../wxParse/wxParse.js');
const regeneratorRuntime = require('../../utils/runtime')

Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail: {},
    swiperCurrent: 0,
    hasMoreSelect: false,
    selectSize: "选择：",
    selectSizePrice: 0,
    totalScoreToPay: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,

    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar", //购物类型，加入购物车或立即购买，默认为加入购物车
    currentPages: undefined,

    openShare: false
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  async onLoad(e) {
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene) // 处理扫码进商品详情页面的逻辑
      if (scene) {
        e.id = scene.split(',')[0]
        wx.setStorageSync('referrer', scene.split(',')[1])
      }
    }
    this.data.goodsId = e.id
    const that = this
    this.data.kjJoinUid = e.kjJoinUid
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum,
          curuid: wx.getStorageSync('uid')
        });
      }
    })
    this.reputation(e.id)
  },
  onShow() {
    this.getGoodsDetailInfo(this.data.goodsId)
  },
  async getGoodsDetailInfo(goodsId) {
    const that = this;
    const goodsDetailRes = await WXAPI.goodsDetail({ id: goodsId, type: 1 })
    if (goodsDetailRes.code == 0) {
      var selectSizeTemp = "";
      if (goodsDetailRes.data.properties.length > 0) {
        for (var i = 0; i < goodsDetailRes.data.properties.length; i++) {
          selectSizeTemp = selectSizeTemp + " " + goodsDetailRes.data.properties[i].Name;
        }
        that.setData({
          hasMoreSelect: true,
          selectSize: that.data.selectSize + selectSizeTemp,
          selectSizePrice: goodsDetailRes.data.basicInfo.MinPrice,
          totalScoreToPay: goodsDetailRes.data.basicInfo.MinScore
        });
      }
      if (goodsDetailRes.data.basicInfo.PingTuan === 1) {
        that.pingtuanList(goodsId)
      }
      that.data.goodsDetail = goodsDetailRes.data;
      if (goodsDetailRes.data.basicInfo.VideoId) {
        that.getVideoSrc(goodsDetailRes.data.basicInfo.VideoId);
      }
      let _data = {
        goodsDetail: goodsDetailRes.data,
        selectSizePrice: goodsDetailRes.data.basicInfo.MinPrice,
        totalScoreToPay: goodsDetailRes.data.basicInfo.MinScore,
        buyNumMax: goodsDetailRes.data.basicInfo.Stores,
        buyNumber: (goodsDetailRes.data.basicInfo.Stores > 0) ? 1 : 0,
        currentPages: getCurrentPages()
      }
      if (goodsDetailRes.data.basicInfo.PingTuan === 1) {
        const pingtuanSetRes = await WXAPI.pingtuanSet({ goods_id: goodsId })
        if (pingtuanSetRes.code == 0) {
          if (pingtuanSetRes.data.length > 0) {
            _data.pingtuanSet = pingtuanSetRes.data[0]
          }
        }
      }
      that.setData(_data);
      WxParse.wxParse('article', 'html', goodsDetailRes.data.content, that, 5);
    }
  },
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy",
      selectSizePrice: this.data.goodsDetail.basicInfo.MinPrice
    });
    this.bindGuiGeTap();
  },
  toPingtuan: function (e) {
    if (e.currentTarget.dataset.hasjoin == 1) {
      wx.showModal({
        title: '提示',
        content: '已参与该拼单',
        showCancel: false
      })
      return
    }
    let pingtuanopenid = 0
    if (e.currentTarget.dataset.pingtuanopenid) {
      pingtuanopenid = e.currentTarget.dataset.pingtuanopenid
    }
    this.setData({
      shopType: "toPingtuan",
      selectSizePrice: this.data.goodsDetail.basicInfo.PingTuanPrice,
      pingtuanopenid: pingtuanopenid
    });
    this.bindGuiGeTap();
  },
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    for (var i = 0; i < this.data.goodsDetail.properties.length; i++) {
      for (var j = 0; j < this.data.goodsDetail.properties[i].ChildsCurGoods.length; j++) {
        this.data.goodsDetail.properties[i].ChildsCurGoods[j].active = false
        this.data.goodsDetail.properties[i].ChildsCurGoods[j].unable = false
      }
    }
    this.setData({
      goodsDetail: this.data.goodsDetail,
      hideShopPopup: true,
      canSubmit: false,
    })
  },
  numJianTap: function () {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function () {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  /**
   * 选择商品规格
   * @param {Object} e
   */
  labelItemTap: function (e) {
    var that = this;
    /*
    console.log(e)
    console.log(e.currentTarget.dataset.propertyid)
    console.log(e.currentTarget.dataset.propertyname)
    console.log(e.currentTarget.dataset.propertychildid)
    console.log(e.currentTarget.dataset.propertychildname)
    */
    // 取消该分类下的子栏目所有的选中状态
    var childs = that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].ChildsCurGoods;
    var index = -1
    for (var i = 0; i < childs.length; i++) {
      if (that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].ChildsCurGoods[i].active == true) {
        index = i
      }
      that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].ChildsCurGoods[i].active = false;
    }
    
    // 设置当前选中状态
    if (index != e.currentTarget.dataset.propertychildindex) {
      that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].ChildsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
    }

    var selectNum = 0
    var parentIndex = 0 //用于只选择一个的时候
    var childIndex = [-1, -1]
    for (var i = 0; i < that.data.goodsDetail.properties.length; i++) {
      childs = that.data.goodsDetail.properties[i].ChildsCurGoods;
      for (var j = 0; j < childs.length; j++) {
        if (childs[j].active) {
          selectNum++;
          parentIndex = i;
          childIndex[i] = j;
          break
        }
      }
    }
    if (that.data.goodsDetail.properties.length == 2) {
      if (selectNum == 0) {
        for (var i = 0; i < that.data.goodsDetail.properties.length; i++) {
          childs = that.data.goodsDetail.properties[i].ChildsCurGoods;
          for (var j = 0; j < childs.length; j++) {
            childs[j].unable = false;
          }
        }
      } else if (selectNum == 1) {
        var otherIndex = 1 - parentIndex
        var proIdStorePriceStr = that.data.goodsDetail.properties[parentIndex].ChildsCurGoods[childIndex[parentIndex]].ProIdStorePrice;
        var proIdStorePrices = proIdStorePriceStr.split("|");
        for (var k = 0; k < proIdStorePrices.length; k++) {
          var psp = proIdStorePrices[k].split(":");
          for (var l = 0; l < that.data.goodsDetail.properties[otherIndex].ChildsCurGoods.length; l++) {
            if (psp[0] == that.data.goodsDetail.properties[otherIndex].ChildsCurGoods[l].id) {
              if (psp[1] > 0) {
                that.data.goodsDetail.properties[otherIndex].ChildsCurGoods[l].unable = false
              } else {
                that.data.goodsDetail.properties[otherIndex].ChildsCurGoods[l].unable = true
              }
            }
          }
        }
        for (var k = 0; k < that.data.goodsDetail.properties[parentIndex].ChildsCurGoods.length;k++){
          that.data.goodsDetail.properties[parentIndex].ChildsCurGoods[k].unable = false
        }
      }else if (selectNum == 2){
        for (var parentIndex = 0; parentIndex <= 1; parentIndex++){
          var otherIndex = 1 - parentIndex
          var proIdStorePriceStr = that.data.goodsDetail.properties[parentIndex].ChildsCurGoods[childIndex[parentIndex]].ProIdStorePrice;
          var proIdStorePrices = proIdStorePriceStr.split("|");
          for (var k = 0; k < proIdStorePrices.length; k++) {
            var psp = proIdStorePrices[k].split(":");
            for (var l = 0; l < that.data.goodsDetail.properties[otherIndex].ChildsCurGoods.length; l++) {
              if (psp[0] == that.data.goodsDetail.properties[otherIndex].ChildsCurGoods[l].id) {
                if (psp[1] > 0) {
                  that.data.goodsDetail.properties[otherIndex].ChildsCurGoods[l].unable = false
                } else {
                  that.data.goodsDetail.properties[otherIndex].ChildsCurGoods[l].unable = true
                }
              }
            }
          }
        }
      }
    }

    // 获取所有的选中规格尺寸数据
    var needSelectNum = that.data.goodsDetail.properties.length;
    var curSelectNum = 0;
    var propertyChildIds = "";
    var propertyChildNames = "";
    var selectSizePrice = 0
    var totalScoreToPay = 0
    var stores = 0
    for (var i = 0; i < that.data.goodsDetail.properties.length; i++) {
      childs = that.data.goodsDetail.properties[i].ChildsCurGoods;
      for (var j = 0; j < childs.length; j++) {
        if (childs[j].active) {
          curSelectNum++;
          propertyChildIds = propertyChildIds + that.data.goodsDetail.properties[i].id + ":" + childs[j].id + ",";
          propertyChildNames = propertyChildNames + that.data.goodsDetail.properties[i].Name + ":" + childs[j].Name + "  ";
          if (that.data.shopType == "toPingtuan") {
            selectSizePrice = childs[j].PingTuanPrice
          } else {
            selectSizePrice = childs[j].Price
          }
          totalScoreToPay = childs[j].Score
          stores = childs[j].Stores
        }
      }
    }
    if (that.data.goodsDetail.properties.length == 2){
      if (childIndex[0] > -1 && childIndex[1] > -1){
        var psps = that.data.goodsDetail.properties[0].ChildsCurGoods[childIndex[0]].ProIdStorePrice.split("|")
        var id = that.data.goodsDetail.properties[1].ChildsCurGoods[childIndex[1]].id
        for (var i = 0; i < psps.length; i++){
          var psp = psps[i].split(":")
          if (psp[0] == id){
            stores = psp[1]
            selectSizePrice = psp[2]
          }
        }
      }
    }
    var canSubmit = false;
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
    }
    // 计算当前价格
    if (canSubmit) {

      that.setData({
        selectSizePrice: selectSizePrice,
        totalScoreToPay: totalScoreToPay,
        propertyChildIds: propertyChildIds,
        propertyChildNames: propertyChildNames,
        buyNumMax: stores,
        buyNumber: (stores > 0) ? 1 : 0
      });

    }


    this.setData({
      goodsDetail: that.data.goodsDetail,
      canSubmit: canSubmit
    })
  },
  /**
   * 加入购物车
   */
  addShopCar: function () {
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      this.bindGuiGeTap();
      return;
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建购物车
    var shopCarInfo = this.bulidShopCarInfo();

    this.setData({
      shopCarInfo: shopCarInfo,
      shopNum: shopCarInfo.shopNum
    });

    // 写入本地存储
    wx.setStorage({
      key: 'shopCarInfo',
      data: shopCarInfo
    })
    this.closePopupTap();
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
    //console.log(shopCarInfo);

    //shopCarInfo = {shopNum:12,shopList:[]}
  },
  /**
   * 立即购买
   */
  buyNow: function (e) {
    let that = this
    let shoptype = e.currentTarget.dataset.shoptype
    console.log(shoptype)
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      this.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel: false
      })
      return;
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建立即购买信息
    var buyNowInfo = this.buliduBuyNowInfo(shoptype);
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    this.closePopupTap();
    if (shoptype == 'toPingtuan') {
      if (this.data.pingtuanopenid) {
        console.log(this.data.pingtuanopenid)
        wx.navigateTo({
          url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + this.data.pingtuanopenid
        })
      } else {
        WXAPI.pingtuanOpen({ goods_id: that.data.goodsDetail.basicInfo.id }).then(function (res) {
          if (res.code != 0) {
            wx.showToast({
              title: res.msg,
              icon: 'none',
              duration: 2000
            })
            return
          }
          wx.navigateTo({
            url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + res.data.id
          })
        })
      }
    } else {
      wx.navigateTo({
        url: "/pages/to-pay-order/index?orderType=buyNow"
      })
    }

  },
  /**
   * 组建购物车信息
   */
  bulidShopCarInfo: function () {
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.Pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.Name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var shopCarInfo = this.data.shopCarInfo;
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    var hasSameGoodsIndex = -1;
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      var tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
        hasSameGoodsIndex = i;
        shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }

    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    shopCarInfo.kjId = this.data.kjId;
    return shopCarInfo;
  },
  /**
   * 组建立即购买信息
   */
  buliduBuyNowInfo: function (shoptype) {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.Pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.Name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.LogisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.Weight;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    /*    var hasSameGoodsIndex = -1;
        for (var i = 0; i < toBuyInfo.shopList.length; i++) {
          var tmpShopCarMap = toBuyInfo.shopList[i];
          if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
            hasSameGoodsIndex = i;
            shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
            break;
          }
        }
        toBuyInfo.shopNum = toBuyInfo.shopNum + this.data.buyNumber;
        if (hasSameGoodsIndex > -1) {
          toBuyInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
        } else {
          toBuyInfo.shopList.push(shopCarMap);
        }*/

    buyNowInfo.shopList.push(shopCarMap);
    buyNowInfo.kjId = this.data.kjId;
    return buyNowInfo;
  },
  onShareAppMessage: function () {
    let _data = {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + wx.getStorageSync('uid'),
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
    if (this.data.kjJoinUid) {
      _data.title = this.data.curKanjiaprogress.joiner.nick + '邀请您帮TA砍价'
      _data.path += '&kjJoinUid=' + this.data.kjJoinUid
    }
    return _data
  },
  reputation: function (goodsId) {
    var that = this;
    WXAPI.goodsReputation({
      goods_id: goodsId
    }).then(function (res) {
      if (res.code == 0) {
        that.setData({
          reputation: res.data.list
        });
      }
    })
  },
  pingtuanList: function (goodsId) {
    var that = this;
    WXAPI.pingtuanList({ id: goodsId }).then(function (res) {
      if (res.code == 0) {
        that.setData({
          pingtuanList: res.data.list
        });
      }
    })
  },
  getVideoSrc: function (videoId) {
    var that = this;
    WXAPI.videoDetail(videoId).then(function (res) {
      if (res.code == 0) {
        that.setData({
          videoMp4Src: res.data.fdMp4
        });
      }
    })
  },
  joinPingtuan: function (e) {
    let pingtuanopenid = e.currentTarget.dataset.pingtuanopenid
    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + pingtuanopenid
    })
  },
  goIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  openShareDiv() {
    this.setData({
      openShare: true
    })
  },
  closeShareDiv() {
    this.setData({
      openShare: false
    })
  },
  toPoster: function (e) { // 千万生成海报界面
    wx.navigateTo({
      url: "/pages/goods-details/poster?goodsid=" + e.currentTarget.dataset.goodsid
    })
  }
})