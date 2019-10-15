// 小程序开发api接口工具包，https://github.com/gooking/wxapi
const CONFIG = require('./config.js')
const API_BASE_URL = 'https://www.007spy.cn'
const that = this

const request = (url, needSubDomain, method, data) => {
  let _url = API_BASE_URL + (needSubDomain ? '/' + CONFIG.subDomain : '') + url
  data.access_token = wx.getStorageSync('token')
  return new Promise((resolve, reject) => {
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
                    resolve(request.data)
                  },
                  fail(error){
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
        resolve(request.data)
      },
      fail(error) {
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
  updateUserInfo: (data) => {
    return request('/v1/user/update_user', false, 'post', data)
  },
  getUserInfo: (data) => {
    return request('/v1/user/get_user_by_id', false, 'post', data)
  },
  getUserInfoById: (data) => {
    return request('/v1/user/get_user_by_id', false, 'post', data)
  },
}