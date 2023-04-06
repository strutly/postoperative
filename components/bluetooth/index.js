// components/bluetooth/index.js
const app = getApp();

import tsc from "../../utils/print/tsc.js";
import drawQrcode from "../../utils/webapp.qcode";
Component({
  properties: {
    detail: {
      type: Object,
      value: {},
      observer: '_detailChange'
    },
    btnMsg: {
      type: String,
      value: "准备打印"
    },
    modalPrint: {
      type: Boolean,
      value: false
    },
    clooseBtn: {
      type: String,
      value: "modalStatus"
    }
  },
  data: {
    modalBluetooth: false,
    connectFlag: false,
    bluetoothIndex: -1,
    sendContent: "",
    looptime: 0,
    currentTime: 1,
    lastData: 0,
    oneTimeData: 20,
    returnResult: "",
    canvasWidth: 80,
    canvasHeight: 80,
    buffSize: [],
    buffIndex: 0,
    printNum: [],
    printNumIndex: 0,
    printerNum: 1,
    currentPrint: 1,
    isReceiptSend: false,
    isLabelSend: false
  },

  methods: {
    _detailChange(newVal) {
      let that = this;
      console.log(newVal);
      if (newVal.id) {
        that.setData({
          sumSugar:that.sum(newVal.args.num8,newVal.args.num11),
          qCode: drawQrcode.drawImg("/pages/index/detail?id=" + newVal.id, {
            typeNumber: 4,          // 密度
            errorCorrectLevel: 'L', // 纠错等级
            size: 200,              // 白色边框
          })
        })
      }
    },
    modalStatus(e) {
      console.log(e)
      let name = e.currentTarget.dataset.name;
      this.setData({
        ['modal' + name]: !this.data['modal' + name]
      })
    },
    home() {
      wx.reLaunch({
        url: '/pages/index/index',
      })
    },
    showTips(msg = "出错了~", errorType = "error") {
      this.setData({
        errorMsg: msg,
        errorType: errorType,
        errorShow: true
      })
    },
    //计算总和
    sum(...args) {
      let sum = args.reduce((val, oldVal) => {
        let n = Number(val), m = Number(oldVal);
        return n += m;
      });
      return sum.toFixed(2);
    },
    async checkPrintStatus() {
      let that = this;
      let bluetooth = wx.getStorageSync('bluetooth');
      let flag = that.data.connectFlag;
      console.log(bluetooth);
      /**
       * 之前有连接 现在没连接
       *  
       **/
      if (bluetooth && !flag) {
        await that.BLEConnection(bluetooth);
      }
      /**
       * 之前没连接 或者现有已经连接了
       */
      that.setData({
        modalPrint: true
      })
    },
    searchModal() {
      let that = this;
      that.setData({
        modalPrint: false,
        modalBluetooth: true
      })
      that.startSearch();
    },
    async startSearch() {
      let that = this;
      try {
        let openBluetoothAdapterRes = await wx.openBluetoothAdapter();
        console.log(openBluetoothAdapterRes);
        try {
          let res = await wx.getBluetoothAdapterState();
          console.log(res);
          if (res.available) {
            if (res.discovering) {
              wx.stopBluetoothDevicesDiscovery({
                success: function (res) {
                  console.log(res)
                }
              })
            }
            that.checkPemission();
          } else {
            that.showTips("本机蓝牙不可用")
          }
        } catch (error) {
          console.log(error);
          that.showTips("蓝牙状态获取失败,请重试!");
        }
      } catch (error) {
        that.showTips("蓝牙初始化失败，请打开蓝牙")
      }
    },
    checkPemission() {  //android 6.0以上需授权地理位置权限
      let that = this;
      console.log("checkPemission")
      var platform = app.BLEInformation.platform
      console.log(platform)
      if (platform == "android") {
        if (app.getSystem().substring(app.getSystem().length - (app.getSystem().length - 8), app.getSystem().length - (app.getSystem().length - 8) + 1) > 5) {
          wx.getSetting({
            success: function (res) {
              console.log(res)
              if (!res.authSetting['scope.userLocation']) {
                wx.authorize({
                  scope: 'scope.userLocation',
                  complete: function (res) {
                    that.getBluetoothDevices()
                  }
                })
              } else {
                that.getBluetoothDevices()
              }
            }
          })
        } else {
          that.getBluetoothDevices();
        }
      } else {
        that.getBluetoothDevices();
      }
    },
    async getBluetoothDevices() {  //获取蓝牙设备信息
      let that = this;
      console.log("start search")
      wx.showLoading({
        title: '蓝牙搜索中~',
      })
      that.setData({
        isScanning: true
      });
      try {
        await wx.startBluetoothDevicesDiscovery();
        setTimeout(async () => {
          let res = await wx.getBluetoothDevices();
          let devices = [];
          for (var i = 0; i < res.devices.length; ++i) {
            if (res.devices[i].name != "未知设备") {
              devices.push(res.devices[i])
            }
          }
          that.setData({
            devices: devices,
            isScanning: false
          })
          wx.hideLoading();
        }, 3000);
      } catch (error) {
        that.showTips("蓝牙搜索太频繁~")
        wx.hideLoading();
      }
    },

    async connect(e) {
      let that = this;
      console.log(e)
      //停止搜索蓝牙
      await wx.stopBluetoothDevicesDiscovery();
      let index = e.currentTarget.dataset.index;
      let devices = that.data.devices;
      let bluetooth = devices[index];
      that.BLEConnection(bluetooth);
    },
    //根据蓝牙id连接蓝牙
    async BLEConnection(bluetooth) {
      let that = this;
      await wx.openBluetoothAdapter();
      try {
        let res = await wx.createBLEConnection({
          deviceId: bluetooth.deviceId
        });
        console.log("wx.createBLEConnection");
        console.log(res);
        if (res.errCode == 0 || res.errCode == -1) {
          that.setData({
            devices: [bluetooth],
            bluetoothIndex: 0,
            connectFlag: true,
            serviceId: 0,
            writeCharacter: false,
            readCharacter: false,
            notifyCharacter: false,
            modalPrint: true
          })
          wx.setStorageSync('bluetooth', bluetooth);
          app.BLEInformation.deviceId = bluetooth.deviceId;
          that.getBLEDeviceServices(bluetooth.deviceId);
        }
      } catch (error) {
        console.log("err")
        console.log(error);
        that.showTips('连接失败');
      }
    },
    //获取蓝牙低功耗设备所有服务
    async getBLEDeviceServices(deviceId) {
      let that = this;
      console.log(app.BLEInformation.deviceId);
      try {
        let res = await wx.getBLEDeviceServices({
          deviceId: deviceId
        });
        that.setData({
          services: res.services
        })
        that.getCharacteristics(deviceId);
      } catch (error) {
        that.showTips("获取蓝牙服务失败");
      }
    },
    //获取蓝牙低功耗设备某个服务中所有特征 
    async getCharacteristics(deviceId) {
      let that = this;
      var list = that.data.services;
      var num = that.data.serviceId;
      var write = that.data.writeCharacter;
      var read = that.data.readCharacter;
      var notify = that.data.notifyCharacter;
      let res = await wx.getBLEDeviceCharacteristics({
        deviceId: deviceId,
        serviceId: list[num].uuid
      });
      try {
        console.log(res);
        for (var i = 0; i < res.characteristics.length; ++i) {
          var properties = res.characteristics[i].properties;
          var item = res.characteristics[i].uuid;
          if (!notify) {
            if (properties.notify) {
              app.BLEInformation.notifyCharaterId = item
              app.BLEInformation.notifyServiceId = list[num].uuid
              notify = true
            }
          }
          if (!write) {
            if (properties.write) {
              app.BLEInformation.writeCharaterId = item
              app.BLEInformation.writeServiceId = list[num].uuid
              write = true
            }
          }
          if (!read) {
            if (properties.read) {
              app.BLEInformation.readCharaterId = item
              app.BLEInformation.readServiceId = list[num].uuid
              read = true
            }
          }
        }
        if (!write || !notify || !read) {
          num++
          that.setData({
            writeCharacter: write,
            readCharacter: read,
            notifyCharacter: notify,
            serviceId: num
          })
          if (num == list.length) {
            that.showToast("找不到该读写的特征值")
          } else {
            that.getCharacteristics(deviceId)
          }
        }
      } catch (error) {
        that.showToast("获取特征出错");
      }
    },
    async print() {
      let that = this;
      that.checkPrintStatus();
      let detail = that.data.detail;
      console.log(detail);
      var command = tsc.jpPrinter.createNew();
      command.setSize(78, 61.5);
      command.setGap(0);
      command.setCls();

      let x = 80, y = 80;

      command.setText(x, y + 30, "TSS24.BF2", 1, 1, detail.args.info.name);

      command.setText(x + 100, y + 30, "TSS24.BF2", 1, 1, detail.args.info.sex == 1 ? "男" : "女");

      command.setText(x + 150, y + 30, "TSS24.BF2", 1, 1, detail.args.info.age + "岁");
      //二维码
      command.setQR(x + 330, y, "L", 4, "A", "/pages/index/detail?id=" + detail.id);
      //日期
      command.setText(x, y + 80, "TSS24.BF2", 1, 1, detail.createTime);


      //总能量
      command.setText(x, y + 170, "TSS24.BF2", 1, 1, "总能量");
      command.setText(x + 280, y + 170, "TSS24.BF2", 1, 1, detail.args.num1);
      command.setText(x + 420, y + 170, "TSS24.BF2", 1, 1, "Kcal");
      //总液体量
      command.setText(x, y + 205, "TSS24.BF2", 1, 1, "总液体量");
      command.setText(x + 280, y + 205, "TSS24.BF2", 1, 1, detail.args.num23);
      command.setText(x + 440, y + 205, "TSS24.BF2", 1, 1, "ml");

      //热氮比
      command.setText(x, y + 240, "TSS24.BF2", 1, 1, "热氮比");
      command.setText(x + 280, y + 240, "TSS24.BF2", 1, 1, detail.args.scale);
      //输液速度
      command.setText(x, y + 275, "TSS24.BF2", 1, 1, "输液速度");
      command.setText(x + 280, y + 275, "TSS24.BF2", 1, 1, detail.args.num24);
      command.setText(x + 420, y + 275, "TSS24.BF2", 1, 1, "ml/h");
      //总葡萄糖
      command.setText(x, y + 310, "TSS24.BF2", 1, 1, "总葡萄糖");

      let sumSugar = that.sum(detail.args.num8, detail.args.num11);
      console.log(sumSugar);

      command.setText(x + 280, y + 310, "TSS24.BF2", 1, 1, sumSugar);

      command.setText(x + 440, y + 310, "TSS24.BF2", 1, 1, "ml");

      //胰岛素用量
      command.setText(x, y + 345, "TSS24.BF2", 1, 1, "胰岛素用量");
      command.setText(x + 280, y + 345, "TSS24.BF2", 1, 1, detail.args.gsNum);
      command.setText(x + 440, y + 345, "TSS24.BF2", 1, 1, "IU");

      command.setPagePrint();

      that.prepareSend(command.getData())
    },
    prepareSend(buff) {  //准备发送，根据每次发送字节数来处理分包数量
      let that = this;
      console.log(buff)
      //一次发送的数据量
      var time = that.data.oneTimeData;
      //计算需要循环发送的次数
      var looptime = parseInt(buff.length / time);
      var lastData = parseInt(buff.length % time);
      that.setData({
        looptime: looptime + 1,
        lastData: lastData,
        currentTime: 1,
      })
      that.Send(buff)
    },
    async Send(buff) {
      let that = this;
      wx.showLoading({
        title: '打印中,请稍后~',
        mask: true
      })
      var currentTime = that.data.currentTime;
      var loopTime = that.data.looptime;
      var lastData = that.data.lastData;
      var onTimeData = that.data.oneTimeData;
      var buf, dataView;
      for (let index = currentTime; index <= loopTime; index++) {
        if (index < loopTime) {
          buf = new ArrayBuffer(onTimeData)
          dataView = new DataView(buf)
          for (var i = 0; i < onTimeData; ++i) {
            dataView.setUint8(i, buff[(index - 1) * onTimeData + i])
          }
        } else {
          buf = new ArrayBuffer(lastData)
          dataView = new DataView(buf)
          for (var i = 0; i < lastData; ++i) {
            dataView.setUint8(i, buff[(index - 1) * onTimeData + i])
          }
        }
        await wx.writeBLECharacteristicValue({
          deviceId: app.BLEInformation.deviceId,
          serviceId: app.BLEInformation.writeServiceId,
          characteristicId: app.BLEInformation.writeCharaterId,
          value: buf
        })
      }
      wx.hideLoading();
    },
    closeConnect() {
      let that = this;
      console.log("断开链接")
      wx.closeBLEConnection({
        deviceId: app.BLEInformation.deviceId,
        success: function (res) {
          console.log("cloose")
          console.log(res);
          that.setData({
            connectFlag: false,
            bluetoothIndex: -1
          })
        },
      })
    },
    changeBluetooth() {
      let that = this;
      that.setData({
        modalPrint: false,
        modalBluetooth: true
      })
    },
  }
})
