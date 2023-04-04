var that;
const app = getApp();
import Api from '../../config/api';
import CustomPage from '../../CustomPage';
CustomPage({

  data: {
    detail: {
      id: 1,
      createTime: "2023-03-31 14:56:56",
      args: { "info": { "age": "33", "sex": "1", "name": "李竞", "cardNo": "430321********2211", "height": "173.0", "weight": "66.0", "createTime": "2023-03-29 03:09:22" }, "num1": 1562.5, "num2": "513.00", "num3": "285.00", "num4": 112, "num5": 100, "num6": "356.25", "num7": "89.06", "num8": "178.12", "num9": "581.25", "based": 25, "gsNum": "487.04", "num10": "145.31", "num11": "1453.10", "num12": "7.22", "num13": "316.94", "num14": 3.2, "num15": 50, "num16": 30, "num17": 50, "num18": 10, "num19": 10, "num20": 10, "num21": 10, "num22": 10, "num23": 2513, "num24": "104.71", "num25": "58.59", "num26": 3, "scale": "10.42", "sumSugar": "937.50" }
    },
    
  },
  async onLoad(options) {
    that = this;
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
        canPrint: true
      });
    }
  },
  onUnload() {
    wx.closeBLEConnection({ 
      deviceId: app.BLEInformation.deviceId,
      success(res){
        console.log(res);
      }
    })
  },
})