
const app = getApp();

Page({
    data: {
      latitude: 30.541093,
      longitude: 114.360734,
    },
    onLoad() {
      this.getAllMarkers();
      this.setData({
        userInfo : app.globalData.userInfo
      })
    },

    // 将数据库查找出的数据转化为markers的形式
    // https://developers.weixin.qq.com/miniprogram/dev/component/map.html
    toMarkerFormat(data) {
      var res = [];
      for (var i=0;i<data.length;i++) {
        var temp = {};
        temp.id = data[i]._id;
        temp.latitude = data[i].position.latitude;
        temp.longitude = data[i].position.longitude;
        res.push(temp);
      }
      return res;
    },

    // 用户点击地图中一个没有标记的点之后调用addNewMarker添加新标记点信息
    // return null 表示用户取消
    // return object 为存入数据库的输入
    getMarkerDataInput() {
      
    },

    // 获取所有的标记点 : 标记点本身可见 + 标间点不可见但是对小组成员可见
    // TODO : 指定小组成员可见 (visiable: true)
    // TOOD : 需要测试
    getAllMarkers() {
      var  that = this;
      const _ = wx.cloud.database().command;
      wx.cloud.database().collection("marker").where({
        visiable : true
      }).get({
        success(res) {
          console.log(res.data);
          var markers = that.toMarkerFormat(res.data);
          that.setData({
            markers : markers
          })
        }
      })
    },

    // 点击地图中的某个点添加标记
    addNewMarker(e) {
      console.log(e)
      // console.log(e.detail)
      var latitude = e.detail.latitude;
      var longitude = e.detail.longitude;

      var marker_data = this.getMarkerDataInput();
      if (marker_data == null) {
        // 用户取消
        return;
      }
      wx.cloud.database().collection("marker").add({
        data : marker_data,
        success(res) {
          console.log(res);
          wx.showToast({
            title: '标记点已添加',
            icon: 'success',
          })
        }
      })
    },


    // 点击标记点
    clickMarkers(e) {
      console.log("点击标记点了")
      console.log(e)
    },

    calloutTap(e) {
      console.log("@callout:",e);
    },

    

  })
  