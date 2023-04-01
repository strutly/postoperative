var that;
const app = getApp();
import Api from '../../config/api';
import CustomPage from '../../CustomPage';
import tsc from "../../utils/print/tsc.js";
import drawQrcode from "../../utils/webapp.qcode";
CustomPage({
  data: {
    info: {
      name: "测试人员",
      sex: 1,
      age: 65,
      height: 168,
      weight: 62.5
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
    nums: { "num1": 0, "num2": 0, "num3": 0, "num4": 0, "num5": 0, "num6": 0, "num7": 0, "num8": 0, "num9": 0, "num10": 0, "num11": 0, "num12": 0, "num13": 0, "num14": 0, "num15": 0, "num16": 0, "num17": 0, "num18": 0, "num19": 0, "num20": 0, "num21": 0, "num22": 0, "num23": 0, "num24": 0, "num25": 0, "num26": 0 },
    args: [25, 28, 32],
    argIndex: 0,
    imgs: []
  },
  onLoad(options) {
    that = this;
    app.BLEInformation.platform = app.getPlatform();
  },

  onReady(){
    getApp().watch(function (value) {
      console.log(value);
      if (value.login && value.auth) {
        
        that.showInfo();
      }
    })
  },
  async showInfo(){
    let res = await Api.patientDetail({
      id:that.data.options.id
    })
    that.setData({
      info:res.data,
      canPrint:true
    })
    that.setNums(0);
  },


  pickerChange(e) {
    let index = e.detail.value;
    that.setData({
      argIndex: index
    });
    that.setNums(index);
  },
  setNums(index) {
    let args = that.data.args;
    let weight = that.data.info.weight;
    let arg = args[index];
    //总能量  总能量需求=体重×参数（25/28/32）
    let num1 = weight * arg;
    /* 脂肪乳总能量=总能量需求×40%，单位Kcal
    脂肪乳(20%)能量=脂肪乳总能量-尤文脂肪乳能量，即为脂肪乳总能量-112
    */
    let num2 = (num1 * 0.4 - 112).toFixed(2);
    //脂肪乳(20%)能量/1.8
    let num3 = (num2 / 1.8).toFixed(2);
    //尤文脂肪乳能量=112
    let num4 = 112;
    //液体量=100，固定值
    let num5 = 100;
    //葡萄糖总能量需求=总能量需求-脂肪乳总能量
    let sumSugar = (num1 * 0.6).toFixed(2);
    //50%GS供能=葡萄糖总能量需求×38%，单位Kcal
    let num6 = (sumSugar * 0.38).toFixed(2);
    //50%GS克数=50%GS供能/4
    let num7 = (num6 / 4).toFixed(2);
    //50%GS量=50%GS克数×2
    let num8 = (num7 * 2).toFixed(2);
    //10%GS供能=葡萄糖总能量需求-50%GS供能
    let num9 = (sumSugar - num6).toFixed(2);
    //10%GS克数=10%GS供能/4
    let num10 = (num9 / 4).toFixed(2);
    //10%GS量=10%GS克数×10
    let num11 = (num10 * 10).toFixed(2);

    //氨基酸计算部分

    //热氮比=总能量需求/150，不显示
    let scale = (num1 / 150).toFixed(2);

    //10%GS克数=10%GS供能/4
    let num12 = (scale - 3.2).toFixed(2);
    //10%GS量=10%GS克数×10
    let num13 = (num12 / 0.02278).toFixed(2);

    //丙氨酰谷氨酰胺=3.2，固定值
    let num14 = 3.2;
    //氨基酸(双肽)=热氮比-丙氨酰谷氨酰胺

    //液体量=50
    let num15 = 50;
    //氯化钾(15%)=4.5，固定值，单位g
    //液体量=30，固定值，单位ml
    let num16 = 30;

    //氯化钠(10%)=5，固定值，单位g
    //液体量=50   
    let num17 = 50;
    //水乐维他液体量=10，固定值，单位ml
    let num18 = 10;
    //维他利匹特液体量=10，固定值，单位ml
    let num19 = 10;

    //格利福斯液体量=10，固定值，单位ml
    let num20 = 10;
    //安达美液体量=10，固定值，单位ml
    let num21 = 10;
    //潘南金液体量=10，固定值，单位ml
    let num22 = 10;
    //液体总量
    let num23 = parseInt(that.sum(num3, num5, num8, num11, num13, num15, num16, num17, num18, num19, num20, num21, num22));
    //营养液泵入速度=液体总量/24，单位ml/h
    let num24 = (num23 / 24).toFixed(2);
    //胰岛素用量= GS量/4，单位IU
    let num25 = (sumSugar / 16).toFixed(2);
    //胰岛素泵入速度
    let num26 = 3;

    //GS量
    let sumGs = that.sum(num8, num11, num13);

    //胰岛素用量= GS量/4，单位IU
    let gsNum = (sumGs / 4).toFixed(2);

    let nums = { sumSugar, num1, num2, num3, num4, num5, num6, num7, num8, num9, num10, num11, num12, num13, num14, num15, num16, num17, num18, num19, num20, num21, num22, num23, num24, num25, num26, scale, gsNum };
    that.setData({
      nums: nums
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
  async editEnd(e) {

    let info = that.data.info;
    let nums = that.data.nums;
    let args = that.data.args;
    let argIndex = that.data.argIndex;
    let based = args[argIndex];
    let formData = { args: { ...nums, based, info: info }, patientId: info.id };
    let res = await Api.disposeAdd(formData);
    console.log(res);
    if (res.code == 0) {
      that.setData({
        detail:res.data,
        qCode: drawQrcode.drawImg("/pages/index/detail?id=" + res.data.id, {
          typeNumber: 4,          // 密度
          errorCorrectLevel: 'L', // 纠错等级
          size: 200,              // 白色边框
        })

      })
      that.checkPrintStatus();
    } else {
      that.showTips(res.msg);
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
      bluetoothIndex:connectFlag?index:-1
    })

    if(connectFlag){
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

    //框框
    command.setBox(x - 10, y - 10, x + 530, y + 400, 3);
    //线条
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
      mask:true
    })
    var currentTime = that.data.currentTime;
    var loopTime = that.data.looptime;
    var lastData = that.data.lastData;
    var onTimeData = that.data.oneTimeData;
    var buf,dataView;
    
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
    console.log(new Date().getTime()-s);
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
  changeBluetooth(){
    that.setData({
      modalPrint:false,
      modalBluetooth:true
    })
  }
})