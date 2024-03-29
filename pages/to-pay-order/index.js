const app = getApp()
const WXAPI = require('../../wxapi/main')

Page({
  data: {
    totalScoreToPay: 0,
    goodsList: [],
    allGoodsPrice: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
    pingtuanOpenId: undefined, //拼团的话记录团号

    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null, // 当前选择使用的优惠券
    allowSelfCollection: 0, // 是否允许到店自提
    allowKd: 0, // 是否允许快递
    peisongType: 'zq', // 配送方式 kd,zq 分别表示快递/到店自取

    expressMoneyLocal: 0,
    expressMoneyOut: 0,
  },
  onShow: function() {
    const that = this;
    let shopList = [];
    //立即购买下单
    if ("buyNow" == that.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      that.data.kjId = buyNowInfoMem.kjId;
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList
      }
    } else {
      //购物车下单
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      that.data.kjId = shopCarInfoMem.kjId;
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        // shopList = shopCarInfoMem.shopList
        shopList = shopCarInfoMem.shopList.filter(entity => {
          return entity.active;
        });
      }
    }
    console.log(shopList)
    that.getExpressInfo(shopList)
    that.setData({
      goodsList: shopList,
    });
    that.initShippingAddress();
  },

  getExpressInfo: function(list) {
    let that = this
    var idNums = ""
    for (let i = 0; i < list.length; i++) {
      if (idNums != "") {
        idNums += "|" + list[i].goodsId + ":" + list[i].number
      } else {
        idNums += list[i].goodsId + ":" + list[i].number
      }
    }
    WXAPI.getExpressPrice({ id_nums: idNums}).then(res => {
      if (res.code == 0) {
        var all = that.data.allGoodsPrice
        if (that.data.peisongType == 'kd'){
          all += res.data.expressMoneyLocal
        }
        that.setData({
          allowSelfCollection: res.data.ziqu,
          allowKd: res.data.kuaidi,
          expressMoneyLocal: res.data.expressMoneyLocal,
          expressMoneyOut: res.data.expressMoneyOut,
          allGoodsAndYunPrice: all,
          yunPrice: res.data.expressMoneyLocal,
        })
      }
    })
  },

  onLoad: function(e) {
    let _data = {
    }
    if (e.orderType) {
      _data.orderType = e.orderType
    }
    if (e.pingtuanOpenId) {
      _data.pingtuanOpenId = e.pingtuanOpenId
    }
    this.setData(_data);
  },

  getDistrictId: function(obj, aaa) {
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },

  getTotalFee: function() {
    var that = this;

    let postData = {
      goodsJsonStr: that.data.goodsJsonStr,
      peisongType: that.data.peisongType,
      pingtuanId: that.data.pingtuanOpenId,
    };
    WXAPI.getTotalFee(postData).then(function(res) {
      if (that.data.curAddressData) {
        var all = res.data.amountTotle
        if (that.data.peisongType == 'kd') {
          all += that.data.expressMoneyLocal
        }
        that.setData({
          allGoodsPrice: res.data.amountTotle,
          allGoodsAndYunPrice: all,
        });
      } else {
        that.setData({
          allGoodsPrice: res.data.amountTotle,
          allGoodsAndYunPrice: res.data.amountTotle,
        });
      }

      that.getMyCoupons();
      return;
    })
  },
  radioChange(e) {
    if (e.detail.value == 'kd') {
      if (this.data.curAddressData) {
        this.setData({
          yunPrice: this.data.expressMoneyLocal,
          allGoodsAndYunPrice: this.data.allGoodsPrice + this.data.expressMoneyLocal,
          peisongType: e.detail.value
        })
      } else {
        this.setData({
          peisongType: e.detail.value
        })
      }
    } else {
      this.setData({
        yunPrice: 0,
        allGoodsPrice: this.data.allGoodsPrice,
        allGoodsAndYunPrice: this.data.allGoodsPrice,
        peisongType: e.detail.value
      })
    }
  },

  createOrder: function(e) {
    var that = this;
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息1
    }

    let postData = {
      goodsJsonStr: that.data.goodsJsonStr,
      remark: remark,
      peisongType: that.data.peisongType
    };
    if (that.data.pingtuanOpenId) {
      postData.pingtuanId = that.data.pingtuanOpenId
    }
    if (postData.peisongType == 'kd') {
      if (!that.data.curAddressData) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return;
      }
      if (postData.peisongType == 'kd') {
        postData.address = that.data.curAddressData.ProvinceStr + that.data.curAddressData.CityStr + that.data.curAddressData.AreaStr + that.data.curAddressData.Address;
        postData.linkMan = that.data.curAddressData.People;
        postData.mobile = that.data.curAddressData.Tel;
        postData.code = that.data.curAddressData.Code;
      }
    }
    if (that.data.curCoupon) {
      postData.couponId = that.data.curCoupon.id;
    }

    WXAPI.orderCreate(postData).then(function(res) {
      if (res.code != 0) {
        wx.showModal({
          title: '错误',
          content: res.msg,
          showCancel: false
        })
        return;
      }

      if (e && "buyNow" != that.data.orderType) {
        // 清空购物车数据
        wx.removeStorageSync('shopCarInfo');
      }
      // 配置模板消息推送
      WXAPI.sendMessage({
        form_id: e.detail.formId,
        template_id: 'jLsMVQaCLXDfOaW61KH_Aw424nxylFf8Mr3YVOJTdlc',
        page: 'pages/order-details/index?id='+res.data.id,
        data: res.data.OrderNumber + '|¥' + res.data.RealPrice/100 + '|' + res.data.CreateTime + '|' + res.data.GoodsDetailList[0].Name + 'x' + res.data.GoodsDetailList[0].Number,
        emphasis_keyword: 'keyword2.DATA'
      })

      // 下单成功，跳转到订单管理界面
      wx.redirectTo({
        url: "/pages/order-list/index"
      });
    })
  },
  initShippingAddress: function() {
    var that = this;
    WXAPI.defaultAddress({}).then(function(res) {
      if (res.code == 0) {
        that.setData({
          curAddressData: res.data
        });
      } else {
        that.setData({
          curAddressData: null
        });
      }
    })
    that.processYunfei();
  },
  processYunfei: function() {
    var that = this;
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var allGoodsPrice = 0;


    let inviter_id = 0;
    let inviter_id_storge = wx.getStorageSync('referrer');
    if (inviter_id_storge) {
      inviter_id = inviter_id_storge;
    }
    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }

      goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"propertyChildIds":"' + carShopBean.propertyChildIds + '","logisticsType":0, "inviter_id":' + inviter_id + '}';
      goodsJsonStr += goodsJsonStrTmp;


    }
    goodsJsonStr += "]";
    //console.log(goodsJsonStr);
    that.setData({
      goodsJsonStr: goodsJsonStr
    });
    that.getTotalFee();
  },
  addAddress: function() {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  selectAddress: function() {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  getMyCoupons: function() {
    var that = this;
    WXAPI.coupons({}).then(function(res) {
      if (res.code == 0) {
        var coupons = res.data.list.filter(entity => {
          return entity.MinUsePrice <= that.data.allGoodsAndYunPrice;
        });
        if (coupons.length > 0) {
          that.setData({
            hasNoCoupons: false,
            coupons: coupons
          });
        }
      }
    })
  },
  bindChangeCoupon: function(e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex == -1) {
      this.setData({
        youhuijine: 0,
        curCoupon: null
      });
      return;
    }
    //console.log("selIndex:" + selIndex);
    this.setData({
      youhuijine: this.data.coupons[selIndex].DiscountPrice,
      curCoupon: this.data.coupons[selIndex]
    });
  }

})