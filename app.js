import Api from './config/api';
App({
  onLaunch() {
    let that = this;
    Api.login().then(res => {
      console.log(res);
      setTimeout(function () {
        that.globalData.login = true;
        if (res.code == 0) {
          if (res.data.login) {
            wx.setStorageSync('token', res.data.token);
            wx.setStorageSync('userInfo', res.data.info);
          } else {
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
          }
          that.globalData.msg = res.data.msg;
          that.globalData.status = { login: res.data.login, auth: res.data.auth };
        }
      }, 100);
    })
  },
  globalData: {
    userInfo: null,
    status: { login: false, auth: false },
    sysinfo:wx.getSystemInfoSync(),
    screenWidth:wx.getSystemInfoSync().screenWidth,
    screenHeight:wx.getSystemInfoSync().screenHeight,
  },
  getModel: function () { //获取手机型号
    return this.globalData.sysinfo["model"]
  },
  getVersion: function () { //获取微信版本号
    return this.globalData.sysinfo["version"]
  },
  getSystem: function () { //获取操作系统版本
    return this.globalData.sysinfo["system"]
  },
  getPlatform: function () { //获取客户端平台
    return this.globalData.sysinfo["platform"]
  },
  getSDKVersion: function () { //获取客户端基础库版本
    return this.globalData.sysinfo["SDKVersion"]
  },
  BLEInformation:{
    platform: "",
    deviceId:"",
    writeCharaterId: "",    
    writeServiceId: "",
    notifyCharaterId: "",
    notifyServiceId: "",
    readCharaterId: "",
    readServiceId: "",
  },
  watch(method) {
    var obj = this.globalData;
    if (obj.login) {
      method(obj.status);
    } else {
      Object.defineProperty(obj, 'status', {
        configurable: true,
        enumerable: true,
        set: function (value) {
          this._status = value;
          method(value);
        },
        get: function () {
          return this._status;
        }
      })
    }
  }
})
