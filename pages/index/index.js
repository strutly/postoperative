var that, timerId;
const app = getApp()
import Api from '../../config/api';
import WxValidate from '../../utils/WxValidate';
import CustomPage from '../../CustomPage';
CustomPage({
  data: {
    loginEnd: false,
    sexArr: ['请选择性别', '男', '女'],
    sex: 0,
    disabled: false,
    userInfo: { type: 0 }
  },

  onLoad() {
    that = this;
    that.initValidate();
    let res = wx.getSystemInfoSync()
    console.log(res)
  },
  onReady() {
    console.log("onReady")
    getApp().watch(function (value) {
      console.log(value);
      /*
        登录成功,并且授权成功 ,获取首页数据
      */
      if (value.login && value.auth) {
        let loginEnd = that.data.loginEnd;
        if (!loginEnd) that.showTips('登录成功', 'success');

        that.setData({
          modalauth: false,
          loginEnd: true
        })
      }
      /**
       * 登录成功,授权失败,提示授权
       */
      else if (value.login && !value.auth) {
        that.setData({
          modalauth: true
        })
      }
      /**
       * 登录不成功等提示错误信息
       */
      else {
        that.showTips(app.globalData.msg);
      }
      that.setData({
        authSuccess: value.auth,
        loginMsg: app.globalData.msg,
        userInfo: wx.getStorageSync('userInfo')
      })
    })
  },
  initValidate() {
    let rules = {
      cardNo: {
        required: true
      },
      name: {
        required: true
      },
      sex: {
        required: true
      },
      age: {
        required: true
      },
      weight: {
        required: true
      },
      height: {
        required: true
      }
    }, messages = {
      cardNo: {
        required: "请输入身份证号码"
      },
      name: {
        required: "请输入姓名"
      },
      sex: {
        required: "请输入性别"
      },
      age: {
        required: "请输入年龄"
      },
      weight: {
        required: "请输入体重"
      },
      height: {
        required: "请输入身高"
      }
    };
    that.WxValidate = new WxValidate(rules, messages);
  },
  async cardSuccess(e) {
    console.log(e);
    let year = new Date().getFullYear();
    let sexArr = ["未知", "男", "女"];
    let birth = e.detail.birth.text;
    let birthYear = birth.split("-")[0];
    let cardNo = e.detail.id.text;
    let name = e.detail.name.text;
    let sex = sexArr.indexOf(e.detail.gender.text) || 0;
    let age = year - birthYear;
    let res = await Api.patientByCardNum({ cardNo: cardNo });

    console.log(res);
    let data = res.data || {};
    let patientInfo = { cardNo, name, sex, age, ...data };

    console.log(patientInfo);

    that.setData(patientInfo);
  },
  async cardNoChange(e) {
    let cardNo = e.detail.value;
    if (cardNo.length < 11) return;
    let res = await Api.patientByCardNum({ cardNo: e.detail.value });
    if (res.code == 0 && res.data) {
      that.setData(res.data)
    } else if (!res.data) {
      that.setData({
        id: ""
      })
    }
  },
  nameChange(e) {
    console.log(e);
    let name = e.detail.value;
    if (timerId) clearTimeout(timerId);
    //实现防抖  
    if (name) {
      timerId = setTimeout(async () => {
        let res = await Api.patientByName(name);
        if (res.code == 0) {
          that.setData({
            mask: res.data.length > 0,
            patients: res.data
          })
        }
      }, 300);
    }else{
      that.setData({
        mask: false,
        patients: []
      })
    }
  },
  choose(e) {
    console.log(e);
    let index = e.currentTarget.dataset.index;
    let patients = that.data.patients;
    that.setData({
      ...patients[index],
      mask: false
    })
  },
  nameblur() {
    that.setData({
      mask: false
    })
  },
  async submit(e) {
    console.log(e);
    let data = e.detail.value;
    if (!that.WxValidate.checkForm(data)) {
      console.log(that.WxValidate)
      let error = that.WxValidate.errorList[0]
      that.showTips(error.msg)
      return false;
    }
    that.setData({
      disabled: true
    })
    try {
      let res = {};
      if (data.id) {
        res = await Api.patientUpdate(data);
      } else {
        res = await Api.patientAdd(data);
      }
      if (res.code == 0) {
        that.showTips("信息保存成功", "success");
        let data = res.data;
        that.setData(data);
        wx.navigateTo({
          url: '/pages/index/edit?id=' + data.id
        })
      } else {
        that.showTips(res.msg || "出错了");
      }
    } catch (error) {

    }
    that.setData({
      disabled: false
    })
  },
  sexChange(e) {
    that.setData({
      sex: e.detail.value
    })
  },
  async getPhoneNumber(e) {
    console.log(e);
    if (e.detail.errMsg === "getPhoneNumber:ok") {
      let code = await Api.getCode();
      let res = await Api.phone({
        encryptedData: e.detail.encryptedData,
        code: code,
        iv: e.detail.iv
      })
      console.log(res);
      if (res.code == 0) {
        if (res.data.auth && res.data.login) {
          wx.setStorageSync('token', res.data.token);
          wx.setStorageSync('userInfo', res.data.info);
        } else {
          wx.removeStorageSync('code');
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          that.showTips(res.data.msg);
          that.setData({
            authModal: false
          })
        }
        app.globalData.msg = res.data.msg;
        app.globalData.status = { login: res.data.login, auth: res.data.auth };
      } else {
        wx.removeStorageSync('code');
        that.showTips(res.msg);
        that.setData({
          modalauth: false
        })
      }
    } else {
      that.showTips('您已拒绝授权获取手机号~');
      that.setData({
        authModal: false
      })
    }
  },
  scanCode() {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success(res) {
        console.log(res);
        let result = res.result;
        if (result.indexOf("/pages/index/detail?id=") > -1) {
          wx.navigateTo({
            url: res.result,
          })
        } else {
          that.showTips("请扫描专用二维码~");
        }
      }
    })
  }
})
