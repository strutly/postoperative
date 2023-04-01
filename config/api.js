const log = require('./log');
const urls = require('./urls');

const pathParams = function (url, params = {}) {
  Object.keys(params).map(function (key) {
    let re = '{' + key + '}';
    console.log(re);
    console.log(params);
    console.log(url);
    url = url.replace(re, params[key]);
  });
  return url;
};

const wxLogin = function () {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        wx.setStorageSync('code', res.code);
        resolve(res.code);
      },
      fail: function (err) {
        resolve({
          code: -1,
          msg: "code获取失败,请稍后再试!"
        });
      }
    });
  })
}

const getCode = function () {
  let code = wx.getStorageSync('code');
  return new Promise(function (resolve, reject) {
    if (code) {
      wx.checkSession({
        success() {
          resolve(code);
        },
        fail() {
          return wxLogin().then(res => {
            resolve(res);
          })
        }
      })
    } else {
      return wxLogin().then(res => {
        resolve(res);
      })
    }
  });
};

/**
 * 用户登录
 */
const login = async function () {
  let code = await wxLogin();
  return new Promise((resolve, reject) => {
    wx.request({
      url: urls.loginUrl,
      data: { code: code },
      method: 'get',
      success: (res) => {
        console.log(res);
        let resp = res.data;
        if (resp.code == 0) {
          if (resp.data.login) {
            wx.setStorageSync('token', resp.data.token);
            wx.setStorageSync('userInfo', resp.data.info);
          } else {
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
          }
        }
        resolve(resp)
      },
      fail: (err) => {
        console.error("刷新token失败");
        resolve({ code: -1, msg: JSON.stringify(err), data: null });
      }
    })
  })
};

/**
 * 获取token
 */
const getToken = async function () {
  let local_token = wx.getStorageSync('token');
  let now = new Date().getTime();
  /**
   * 判断条件
   * 1:是否为空
   * 2:是否超时
   * 3:刷新token过期时间是否超时
   */
  if (local_token && local_token.expireTime < now && local_token.refreshExpireTime > now) {
    let res = await refreshToken(local_token);
    return res.token;
  };
  return local_token ? local_token.token : ''
}


/**
 * 根据刷新token获取新token
 * @param {刷新token} token 
 */
const refreshToken = function (token) {

  return new Promise((resolve, reject) => {
    wx.request({
      url: urls.refreshTokenUrl,
      data: { refreshToken: token.refreshToken },
      method: 'post',
      success: (res) => {
        wx.setStorageSync('token', res.data.data);
        resolve(res.data.data)
      },
      fail: (err) => {
        console.error("刷新token失败");
        resolve({ code: -1, msg: JSON.stringify(err), data: null });
      }
    })
  })
}

var retry = 0;
const sendAjax = async function (url, data = {}, method = "GET") {
  let token = await getToken();
  log.info({ url: url, data: data, method: method });
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'token': token
      },
      dataType: "json",
      success: function (res) {
        log.info({ param: { url: url, data: data, method: method }, res: res });
        if (res.data.code == 0) {
          resolve(res.data);
        } else if (res.data.code == 401) {
          retry++;
          if (retry < 2) {
            return login().then(res => {
              return sendAjax(url, data, method).then(res => {
                retry = 0;
                resolve(res);
              })
            })
          } else {
            log.error({ param: { url: url, data: data, method: method }, res: res });
            resolve({ code: -2, msg: "用户信息验证失败,请登录后再试!" });
          }
        } else {
          resolve(res.data);
        };
      },
      fail: function (err) {
        console.log(err)
        resolve({ code: -2, msg: "未知错误请稍后再试!" })
      }
    })
  });
};




const qiniuUploader = require("../utils/qiniuUploader");

let getQiniuToken = function () {
  console.log("get qiniuToken")
  return new Promise((resolve, reject) => {
    wx.request({
      url: urls.qiniuTokenUrl,
      header: {
        'Content-Type': 'application/json',
        'token': wx.getStorageSync('token').token
      },
      success: function (res) {
        console.log(res);
        var token = res.data.data;
        resolve(token);
      },
      fail: function (error) {
        resolve();
      }
    })
  })
}

const uploadFile = async function (tempFilePath) {
  console.log("upload")
  let qiniuToken = await getQiniuToken();
  const options = {
    region: 'ECN',// bucket所在区域，这里是华北区。ECN, SCN, NCN, NA, ASG，分别对应七牛云的：华东，华南，华北，北美，新加坡 5 个区域
    domain: 'http://gridpic.tsing-tec.com',
    shouldUseQiniuFileName: true,
    uptoken: qiniuToken,
    uptokenURL: urls.qiniuTokenUrl,
    serverToken: wx.getStorageSync('token').token
  };
  // 将七牛云相关配置初始化进本sdk
  qiniuUploader.init(options);

  return new Promise(function (resolve, reject) {
    qiniuUploader.upload(tempFilePath, (res) => {
      resolve({ code: 0, data: res.fileURL });
    }, (error) => {
      resolve({ code: -1 });
    },
      null,
      (res) => {

      }, null
    );
  })
};
let Api = {
  domain: urls.domain,
  getCode: () => getCode(),
  login: () => login(),
  refreshToken: (data) => refreshToken(data),
  auth: (data) => sendAjax(urls.authUrl, data, 'post'),
  phone: (data) => sendAjax(urls.phoneUrl, data, 'post'),
  uploadFile: (data) => uploadFile(data),
  patientAdd: (data) => sendAjax(urls.patientUrl, data, 'post'),
  patientByCardNum: (data) => sendAjax(pathParams(urls.patientByCardNumUrl, data), { 1: 1 }, 'post'),
  patientDetail: (data) => sendAjax(pathParams(urls.patientDetailUrl, data), { 1: 1 }, 'get'),
  patientUpdate: (data) => sendAjax(urls.patientUrl, data, 'put'),

  //
  disposePage: (data) => sendAjax(urls.disposeUrl, data, 'get'),
  disposeAdd: (data) => sendAjax(urls.disposeUrl, data, 'post'),
  disposeDetail: (data) => sendAjax(pathParams(urls.disposeDetailUrl, data), { 1: 1 }, 'get')




}

module.exports = Api;