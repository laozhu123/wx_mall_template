// 小程序开发api接口工具包，https://github.com/gooking/wxapi
const CONFIG = require('./config.js')
const API_BASE_URL = 'https://www.007spy.cn'
const that = this

const request = (url, needSubDomain, method, data) => {
  let _url = API_BASE_URL + (needSubDomain ? '/' + CONFIG.subDomain : '') + url
  data.access_token = wx.getStorageSync('token')
  return new Promise((resolve, reject) => {
    wx.showLoading({
    })
    wx.request({
      url: _url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success(request) {
        if (request.data.code === 40000) {
          //重新获取token, 也许有问题这个东西不知道的
          wx.login({
            success: function (res) {
              login(res.code).then(function (res) {
                if (res.code != 0) {
                  // 登录错误
                  wx.hideLoading()
                  wx.showModal({
                    title: '提示',
                    content: '无法登录，请重试',
                    showCancel: false
                  })
                  return;
                }
                wx.setStorageSync('token', res.data.token)
                data.access_token = res.data.token
                wx.request({
                  url: _url,
                  method: method,
                  data: data,
                  header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  success(request){
                    wx.hideLoading()
                    resolve(request.data)
                  },
                  fail(error){
                    wx.hideLoading()
                    reject(error)
                  },
                  complete(aaa){
                    //加载完成
                  }
                })
              })
            }
          })
          return
        }
        wx.hideLoading()
        resolve(request.data)
      },
      fail(error) {
        wx.hideLoading()
        reject(error)
      },
      complete(aaa) {
        // 加载完成
      }
    })
  })
}

/**
 * 小程序的promise没有finally方法，自己扩展下
 */
Promise.prototype.finally = function (callback) {
  var Promise = this.constructor;
  return this.then(
    function (value) {
      Promise.resolve(callback()).then(
        function () {
          return value;
        }
      );
    },
    function (reason) {
      Promise.resolve(callback()).then(
        function () {
          throw reason;
        }
      );
    }
  );
}

function login(code){
  return request('/v1/user/get_mall_user_info_with_wx_sm_app_code', false, 'post', {
    code: code,
    type: 1,
    app_code: CONFIG.appid
  })
}

module.exports = {
  request,
  login: (code) => {
    return request('/v1/user/get_mall_user_info_with_wx_sm_app_code', false, 'post', {
      code:code,
      type: 1,
      app_code: CONFIG.appid
    })
  },
  getAppDetail: () => {
    return request('/v1/app/get_app_by_app_code', false, 'post', {
      app_code: CONFIG.appid
    })
  },
  goodsCategory: (data) => {
    return request('/v1/goods_type/get_goods_type_list', false, 'post', data)
  },
  goods: (data) => {
    return request('/v1/goods/get_goods_list', false, 'post', data)
  },
  goodsDetail: (data) => {
    return request('/v1/goods/get_goods_by_id', false, 'post', data)
  },
  pingtuanList: (data) => {
    return request('/v1/ping_tuan_record/get_ping_tuan_record_list', false, 'post', data)
  },
  pingtuanSet: (data) => {
    return request('/v1/ping_tuan_set/get_ping_tuan_set_list', false, 'post', data)
  },
  pingtuanOpen: (data) => {
    return request('/v1/ping_tuan_record/add_ping_tuan_record', false, 'post', data)
  },
  kanjiaList: (data) => {
    return request('/v1/kan_jia/get_kan_jia_list', false, 'post', data)
  },
  coupons: (data) => {
    return request('/v1/user_coupon/get_user_coupon_list_by_user_id', false, 'post', data)
  },
  getCanRobCoupons: (data) => {
    return request('/v1/coupon_template/get_coupon_template_list', false, 'post', data)
  },
  robCoupons: (data) => {
    return request('/v1/user_coupon/user_rob_coupon_by_id', false, 'post', data)
  },
  robCouponsByPwd: (data) => {
    return request('/v1/user_coupon/user_rob_coupon_by_pwd', false, 'post', data)
  },
  myCoupons: (data) => {
    return request('/v1/user_coupon/get_user_coupon_list_by_user_id', false, 'post', data)
  },
  banners: (data) => {
    return request('/v1/banner_image/get_banner_image_list', false, 'post', data)
  },
  noticeList: (data) => {
    return request('/v1/notice/get_notice_list', false, 'post', data)
  },
  noticeDetail: (data) => {
    return request('/v1/notice/get_notice_by_id', false, 'post', data)
  },
  goodsReputation: (data) => {
    return request('/v1/reputation/get_reputation_list_by_goods_id', false, 'post', data)
  },
  defaultAddress: (data) => {
    return request('/v1/address/get_default_address', false, 'post', data)
  },
  queryAddress: (data) => {
    return request('/v1/address/get_address_list', false, 'post', data)
  },
  addressDetail: (data) => {
    return request('/v1/address/get_address_by_id', false, 'post', data)
  },
  addAddress: (data) => {
    return request('/v1/address/add_address', false, 'post', data)
  },
  updateAddress: (data) => {
    return request('/v1/address/update_address', false, 'post', data)
  },
  deleteAddress: (data) => {
    return request('/v1/address/delete_address', false, 'post', data)
  },
  province: (data) => {
    return request('/v1/address/get_province', false, 'post',data)
  },
  nextRegion: (data) => {
    return request('/v1/address/get_next_list', false, 'post', data)
  },
  orderCreate: (data) => {
    return request('/v1/order/create_order', false, 'post', data)
  },
  getTotalFee: (data) => {
    return request('/v1/order/get_total_fee', false, 'post', data)
  },
  orderStatistics: (data) => {
    return request('/v1/order/order_statistics', false, 'post', data)
  },
  orderList: (data) => {
    return request('/v1/order/get_order_list', false, 'post', data)
  },
  pingTuanOrderStatistics: (data) => {
    return request('/v1/order/ping_tuan_order_statistics', false, 'post', data)
  },
  pingTuanOrderList: (data) => {
    return request('/v1/order/get_ping_tuan_order_list', false, 'post', data)
  },
  orderDetail: (data) => {
    return request('/v1/order/get_order_by_id', false, 'post', data)
  },
  updateOrder: (data) => {
    return request('/v1/order/update_order', false, 'post', data)
  },
  userAmount: (data) => {
    return request('/v1/user/amount', false, 'post', data)
  },
  refundApplyDetail: (data) => {
    return request('/v1/refund_apply/get_refund_apply_by_order_id', false, 'post', data)
  },
  refundApplyCancel: (data) => {
    return request('/v1/refund_apply/cancel_refund_apply_by_order_id', false, 'post', data)
  },
  refundApply: (data) => {
    return request('/v1/refund_apply/add_refund_apply', false, 'post', data)
  },
  uploadImage: (data) => {
    return request('/v1/image/upload_image', false, 'post', data)
  },
  updateUserInfo: (data) => {
    return request('/v1/user/update_user', false, 'post', data)
  },
  getUserInfo: (data) => {
    return request('/v1/user/get_user_by_id', false, 'post', data)
  },
  getExpressPrice: (data) => {
    return request('/v1/express/get_express_money', false, 'post', data)
  },
  judgeOrder: (data) => {
    return request('/v1/reputation/add_reputation', false, 'post', data)
  },
  goodsPrice: (data) => {
    return request('/v1/goods/goods_price', false, 'post', data)
  },
  wxaQrcode: (data) => {
    return request('/v1/app/get_qrcode', false, 'post', data)
  },
  
}