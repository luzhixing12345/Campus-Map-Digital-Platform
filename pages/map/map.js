
const app = getApp();

Page({
    data: {
      latitude: 30.541093,
      longitude: 114.360734,
      current_position : {},
      enable_add_marker : false, // 能否添加标记 false->不能添加
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
    handleUserInput() {
      var that = this;
      wx.navigateTo({
        url: 'marker/addNewMarker/addNewMarker',
        success(res) {
          res.eventChannel.emit('position',{
            latitude : that.data.current_position.latitude,
            longitude : that.data.current_position.longitude
          })
        }
      })
    },

    // 点击加号准备添加新标记点
    readyToAddMarker() {
      this.setData({
        enable_add_marker : true
      })
    },


    // 取消添加标记点
    cancelToAddMarker() {
      this.setData({
        enable_add_marker : false
      })
    },

    // 获取所有标记点
    // TODO: 分类
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
      // 未点击加号，不处理
      if(!this.data.enable_add_marker) return;
      console.log("录入标记点信息")
      this.setData({
        enable_add_marker : false
      })
      // 获取经纬度
      var latitude = e.detail.latitude;
      var longitude = e.detail.longitude;
      this.setData({
        current_position : {
          latitude : latitude,
          longitude : longitude
        }
      })
      this.handleUserInput();
    },

    addMarkerInfo() {
      
      wx.showLoading({
        title: '正在添加新标记点信息',
      })
      wx.cloud.database().collection("marker").add({
        data : marker_data,
        success(res) {
          console.log(res);
          wx.showToast({
            title: '新标记点已添加',
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
  