var that;
import Api from '../../config/api';
import CustomPage from '../../CustomPage';
CustomPage({
  data: {
    list:[]
  },
  onLoad(options) {
    that = this;
  },
  onReady() {
    console.log("onReady")
    getApp().watch(function (value) {
      console.log(value);
      if (value.login && value.auth) {
        that.getList("",1);
      }
    })
  },
  async getList(name,pageNum){
    let res = await Api.disposePage({
      name:name,
      pageNum:pageNum
    });
    let list = that.data.list||[];
    that.setData({
      list:list.concat(res.data.content),
      endline:res.data.last,
      pageNum: pageNum,
      name:name
    })
  },
  onReachBottom() {
    let endline = that.data.endline;
    let name = that.data.name;
    if(!endline){
      let pageNum = that.data.pageNum + 1;
      that.getList(name,pageNum);
    }
  },
  submit(e){
    console.log(e);
    let name = e.detail.value;
    let oldName = that.data.name;
    if(name || oldName){
      that.setData({
        list:[]
      })
      that.getList(name,1);
    }
  }
  
})