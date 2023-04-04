var that;
const app = getApp();
import Api from '../../config/api';
import CustomPage from '../../CustomPage';
import tsc from "../../utils/print/tsc.js";
CustomPage({
  data: {
    detail:{

    },
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
    show:false
  },
  onLoad(options) {
    that = this;
    app.BLEInformation.platform = app.getPlatform();
  },

  onReady() {
    getApp().watch(function (value) {
      console.log(value);
      if (value.login && value.auth) {

        that.showInfo();
      }
    })
  },
  async showInfo() {
    let res = await Api.patientDetail({
      id: that.data.options.id
    })
    that.setData({
      info: res.data,
      canPrint: true
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
        detail: res.data,
        show:true,
        modalPrint:true
      })
    } else {
      that.showTips(res.msg);
    }
  },
  
  onUnload() {
    wx.closeBLEConnection({ deviceId: app.BLEInformation.deviceId })
  },
})