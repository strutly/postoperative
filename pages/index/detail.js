var that;
const app = getApp();
import Api from '../../config/api';
import CustomPage from '../../CustomPage';
import tsc from "../../utils/print/tsc.js";
import drawQrcode from "../../utils/webapp.qcode";
CustomPage({

  data: {
    detail: {
      id:1,
      createTime:"2023-03-31 14:56:56",
      args:{"info": {"age": "33", "sex": "1", "name": "李竞", "cardNo": "430321********2211", "height": "173.0", "weight": "66.0", "createTime": "2023-03-29 03:09:22"}, "num1": 1562.5, "num2": "513.00", "num3": "285.00", "num4": 112, "num5": 100, "num6": "356.25", "num7": "89.06", "num8": "178.12", "num9": "581.25", "based": 25, "gsNum": "487.04", "num10": "145.31", "num11": "1453.10", "num12": "7.22", "num13": "316.94", "num14": 3.2, "num15": 50, "num16": 30, "num17": 50, "num18": 10, "num19": 10, "num20": 10, "num21": 10, "num22": 10, "num23": 2513, "num24": "104.71", "num25": "58.59", "num26": 3, "scale": "10.42", "sumSugar": "937.50"}
    },
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
    isLabelSend: false,
    modalPrint: false
  },
  async onLoad(options) {
    that = this;
    app.BLEInformation.platform = app.getPlatform();
  },
  onReady() {
    getApp().watch(function (value) {
      console.log(value);
      if (value.login && value.auth) {

        that.showDetail();
      }
    })
  },
  async showDetail() {
    let id = that.data.options.id;
    if (!id) return that.showTips("参数错误,请重新进入");
    let res = await Api.disposeDetail({
      id: id
    })
    if (res.code == 0) {
      that.setData({
        detail: res.data,
        canPrint:true,
        qCode: drawQrcode.drawImg("/pages/index/detail?id=" + id, {
          typeNumber: 4,          // 密度
          errorCorrectLevel: 'L', // 纠错等级
          size: 200,              // 白色边框
        })
      });
    }
  },
  async checkPrintStatus() {
    let bluetooth = wx.getStorageSync('bluetooth');
    console.log(bluetooth);
    if (bluetooth) {
      await that.BLEConnection(bluetooth.deviceId);
      let connectFlag = that.data.connectFlag;
      that.setData({
        modalBluetooth: !connectFlag,
        modalPrint: connectFlag
      })
    } else {
      that.setData({
        modalBluetooth: true
      })
    }
  },
  async startSearch() {
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
    console.log("checkPemission")
    var platform = app.BLEInformation.platform
    console.log(platform)
    if (platform == "ios") {
      app.globalData.platform = "ios"
      that.getBluetoothDevices()
    } else if (platform == "android") {
      app.globalData.platform = "android"
      console.log(app.getSystem().substring(app.getSystem().length - (app.getSystem().length - 8), app.getSystem().length - (app.getSystem().length - 8) + 1))
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
      }
    }
  },
  async getBluetoothDevices() {  //获取蓝牙设备信息
    console.log("start search")
    wx.showLoading({
      title: '蓝牙搜索中~',
    })
    that.setData({
      isScanning: true
    });
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
  },

  async connect(e) {
    console.log(e)
    //停止搜索蓝牙
    await wx.stopBluetoothDevicesDiscovery();
    let index = e.currentTarget.dataset.index;

    let devices = that.data.devices;
    let bluetooth = devices[index];

    await that.BLEConnection(bluetooth.deviceId);
    let connectFlag = that.data.connectFlag;
    that.setData({
      modalPrint: connectFlag,
      bluetoothIndex: connectFlag ? index : -1
    })

    if (connectFlag) {
      wx.setStorageSync('bluetooth', bluetooth);
    }

  },
  //根据蓝牙id连接蓝牙
  async BLEConnection(deviceId) {
    await wx.openBluetoothAdapter();
    try {
      await wx.createBLEConnection({
        deviceId: deviceId
      });
      that.setData({
        connectFlag: true,
        serviceId: 0,
        writeCharacter: false,
        readCharacter: false,
        notifyCharacter: false
      })
      app.BLEInformation.deviceId = deviceId;
      that.getBLEDeviceServices(deviceId);
    } catch (error) {
      console.log(error)
      that.showTips('连接失败');
    }
  },
  //获取蓝牙低功耗设备所有服务
  async getBLEDeviceServices(deviceId) {
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
    that.checkPrintStatus();
    let detail = that.data.detail;
    console.log(detail);
    let systemInfo = wx.getSystemInfoSync();
    console.log(systemInfo);
    var canvasWidth = systemInfo.screenWidth;
    var canvasHeight = systemInfo.screenWidth * 0.77;

    var command = tsc.jpPrinter.createNew();
    command.setSize(78, 61.5);
    command.setGap(0);
    command.setCls();
    let x = 50, y = 80;
    command.setText(x, y, "TSS24.BF2", 1, 1, detail.args.info.name);
    command.setText(x + 100, y, "TSS24.BF2", 1, 1, detail.args.info.sex == 1 ? "男" : "女");
    command.setText(x + 150, y, "TSS24.BF2", 1, 1, detail.args.info.age + "岁");
    //二维码



    command.setQR(x + 330, y, "L", 6, "A", "/pages/index/detail?id=" + detail.id);
    //日期
    command.setText(x, y + 60, "TSS24.BF2", 1, 1, detail.createTime);


    command.setBox(x - 10, y - 10, x + 530, y + 400, 3);

    command.setBar(x, y + 205, 3, 5);


    //总能量
    command.setText(x, y + 220, "TSS24.BF2", 1, 1, "总能量");
    command.setText(x + 300, y + 220, "TSS24.BF2", 1, 1, detail.args.num1);
    command.setText(x + 450, y + 220, "TSS24.BF2", 1, 1, "Kcal");
    //总液体量
    command.setText(x, y + 250, "TSS24.BF2", 1, 1, "总液体量");
    command.setText(x + 300, y + 250, "TSS24.BF2", 1, 1, detail.args.num23);
    command.setText(x + 450, y + 250, "TSS24.BF2", 1, 1, "ml");

    //热氮比
    command.setText(x, y + 280, "TSS24.BF2", 1, 1, "热氮比");
    command.setText(x + 300, y + 280, "TSS24.BF2", 1, 1, detail.args.scale);
    //输液速度
    command.setText(x, y + 310, "TSS24.BF2", 1, 1, "输液速度");
    command.setText(x + 300, y + 310, "TSS24.BF2", 1, 1, "----");
    //总葡萄糖
    command.setText(x, y + 340, "TSS24.BF2", 1, 1, "总葡萄糖");
    command.setText(x + 300, y + 340, "TSS24.BF2", 1, 1, "----");

    //胰岛素用量
    command.setText(x, y + 370, "TSS24.BF2", 1, 1, "胰岛素用量");
    command.setText(x + 300, y + 370, "TSS24.BF2", 1, 1, detail.args.gsNum);
    command.setText(x + 450, y + 370, "TSS24.BF2", 1, 1, "IU");

    wx.canvasGetImageData({
      canvasId: 'edit_area_canvas',
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      success: function (res) {
        command.setBitmap(60, 0, 0, res)
      },
      complete: function () {
        command.setPagePrint()
        that.setData({
          isLabelSend: true
        })
        that.prepareSend(command.getData())
      }
    })
  },
  prepareSend(buff) {  //准备发送，根据每次发送字节数来处理分包数量
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
    wx.showLoading({
      title: '打印中,请稍后~',
      mask: true
    })
    var currentTime = that.data.currentTime;
    var loopTime = that.data.looptime;
    var lastData = that.data.lastData;
    var onTimeData = that.data.oneTimeData;
    var buf, dataView;

    let s = new Date().getTime();

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
      console.log("第" + index + "次发送数据大小为：" + buf.byteLength);
      await wx.writeBLECharacteristicValue({
        deviceId: app.BLEInformation.deviceId,
        serviceId: app.BLEInformation.writeServiceId,
        characteristicId: app.BLEInformation.writeCharaterId,
        value: buf
      })
    }
    wx.hideLoading();
    console.log(new Date().getTime() - s);
  },
  closeConnect() {
    wx.closeBLEConnection({
      deviceId: app.BLEInformation.deviceId,
      success: function (res) {
        that.setData({
          bluetoothIndex: -1
        })
      },
    })
  },
  changeBluetooth() {
    that.setData({
      modalPrint: false,
      modalBluetooth: true
    })
  }
})