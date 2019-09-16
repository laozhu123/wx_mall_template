// pages/user-info/index.js
const WXAPI = require('../../wxapi/main')
const regeneratorRuntime = require('../../utils/runtime')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pickerRegionRange: [],
    pickerSelect: [0, 0, 0],
    showRegionStr: '请选择',
    hiddenmodalput: true
  },
  initRegionPicker() {
    WXAPI.province({}).then(res => {
      if (res.code === 0) {
        let _pickerRegionRange = []
        _pickerRegionRange.push(res.data)
        _pickerRegionRange.push([{
          name: '请选择'
        }])
        _pickerRegionRange.push([{
          name: '请选择'
        }])
        this.data.pickerRegionRange = _pickerRegionRange
        this.bindcolumnchange({
          detail: {
            column: 0,
            value: 0
          }
        })
      }
    })
  },
  async initRegionDB(pname, cname, dname) {
    this.data.showRegionStr = pname + cname + dname
    let pObject = undefined
    let cObject = undefined
    let dObject = undefined
    if (pname) {
      const index = this.data.pickerRegionRange[0].findIndex(ele => {
        return ele.name == pname
      })
      if (index >= 0) {
        this.data.pickerSelect[0] = index
        pObject = this.data.pickerRegionRange[0][index]
      }
    }
    if (!pObject) {
      return
    }
    const _cRes = await WXAPI.nextRegion({
      id: pObject.id
    })
    if (_cRes.code === 0) {
      this.data.pickerRegionRange[1] = _cRes.data
      if (cname) {
        const index = this.data.pickerRegionRange[1].findIndex(ele => {
          return ele.name == cname
        })
        if (index >= 0) {
          this.data.pickerSelect[1] = index
          cObject = this.data.pickerRegionRange[1][index]
        }
      }
    }
    if (!cObject) {
      return
    }
    const _dRes = await WXAPI.nextRegion({
      id: cObject.id
    })
    if (_dRes.code === 0) {
      this.data.pickerRegionRange[2] = _dRes.data
      if (dname) {
        const index = this.data.pickerRegionRange[2].findIndex(ele => {
          return ele.name == dname
        })
        if (index >= 0) {
          this.data.pickerSelect[2] = index
          dObject = this.data.pickerRegionRange[2][index]
        }
      }
    }
    this.setData({
      pickerRegionRange: this.data.pickerRegionRange,
      pickerSelect: this.data.pickerSelect,
      showRegionStr: this.data.showRegionStr,
      pObject: pObject,
      cObject: cObject,
      dObject: dObject
    })
  },
  bindchange: function (e) {
    console.log(e)
    const pObject = this.data.pickerRegionRange[0][e.detail.value[0]]
    const cObject = this.data.pickerRegionRange[1][e.detail.value[1]]
    const dObject = this.data.pickerRegionRange[2][e.detail.value[2]]
    const showRegionStr = pObject.name + cObject.name + dObject.name
    this.data.userInfo.Address = showRegionStr
    this.setData({
      pObject: pObject,
      cObject: cObject,
      dObject: dObject,
      showRegionStr: showRegionStr,
      userInfo: this.data.userInfo
    })
    
    WXAPI.updateUserInfo({
      address: showRegionStr, 
      province_id: pObject.id,
      city_id: cObject.id,
      district_id: dObject ? dObject.id : '',
      province_str: pObject.name,
      city_str: cObject.name,
      district_str: dObject.name})
  },

  selectBirthDay: function (e) {
    this.data.userInfo.BirthDay = e.detail.value
    this.setData({
      userInfo: this.data.userInfo
    })

    WXAPI.updateUserInfo({
      birthday: e.detail.value
    })
  },
  bindcolumnchange: function (e) {
    const column = e.detail.column
    const index = e.detail.value
    console.log('eeee:', e)
    const regionObject = this.data.pickerRegionRange[column][index]
    console.log('bindcolumnchange', regionObject)
    if (column === 2) {
      this.setData({
        pickerRegionRange: this.data.pickerRegionRange
      })
      return
    }
    if (column === 1) {
      this.data.pickerRegionRange[2] = [{
        name: '请选择'
      }]
    }
    if (column === 0) {
      this.data.pickerRegionRange[1] = [{
        name: '请选择'
      }]
      this.data.pickerRegionRange[2] = [{
        name: '请选择'
      }]
    }
    // // 后面的数组全部清空
    // this.data.pickerRegionRange.splice(column+1)
    // 追加后面的一级数组
    WXAPI.nextRegion({
      id: regionObject.id
    }).then(res => {
      if (res.code === 0) {
        this.data.pickerRegionRange[column + 1] = res.data
      }
      this.bindcolumnchange({
        detail: {
          column: column + 1,
          value: 0
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this
    _this.initRegionPicker() // 初始化省市区选择器
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    WXAPI.getUserInfo({}).then(function (res) {
      if (res.code == 0) {
        that.setData({
          userInfo: res.data,
        });
        console.log(parseInt(res.data.ProvinceId.slice(0, 2)))
        if (res.data.ProvinceId != ""){
          that.data.pickerSelect[0] = parseInt(res.data.ProvinceId.slice(0,2))-1
        }
        if (res.data.CityId != "") {
          that.data.pickerSelect[1] = parseInt(res.data.CityId.slice(2,4))-1
        }
        if (res.data.DistrictId != "") {
          that.data.pickerSelect[2] = parseInt(res.data.DistrictId.slice(4,6))-1
        }
        that.setData({
          pickerSelect: that.data.pickerSelect
        })
        that.initRegionDB(res.data.ProvinceStr, res.data.CityStr, res.data.AreaStr)
      }
    })
  },

  editSign: function(){
    wx.navigateTo({
      url: "/pages/user-info/sign?desc="+this.data.userInfo.Desc
    })
  },
  
  editTel: function(){
    this.setData({
      hiddenmodalput: false,
    })
  },
  
  telCancel: function(){
    this.setData({
      hiddenmodalput: true,
      userInfo: this.data.userInfo
    })
  },

  telConfirm: function () {
    WXAPI.updateUserInfo({
      tel: this.data.tel
    })
    this.data.userInfo.Tel = this.data.tel
    this.setData({
      hiddenmodalput: true,
      userInfo: this.data.userInfo
    })
  },

  telInput: function (e) {
    this.setData({
      tel: e.detail.value
    })
  }
})