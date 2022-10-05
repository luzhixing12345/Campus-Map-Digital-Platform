
const app = getApp();


Page({
    data: {
      latitude: 30.536764456043922,
      longitude: 114.36191729394477,
      current_position : {},
      markers_id : [], // 获取到的标记点 _id
      enable_add_marker : false, // 能否添加标记 false->不能添加
      use_select : false, // 是否使用筛选
      display_marker_info : false, // 是否显示标记点信息
      enable_search_list : false, //是否显示搜索候选列表
      searchResult : [],
      searchName : "",

      //五大类筛选对应的布尔值（初始值默认均为true）
      switch_food:true,
      switch_learning:true,
      switch_work:true,
      switch_notify:true,
      switch_group:true,
    },
    onLoad() {
      this.getAllMarkers();
      this.setData({
        userInfo : app.globalData.userInfo
      })
    },

    // 筛选标记点 TODO
    selectMarker() {

      console.log("select marker here")
      var that = this;
      this.setData({
        use_select : !that.data.use_select
      })
    },

    // 将数据库查找出的数据转化为markers的形式
    // https://developers.weixin.qq.com/miniprogram/dev/component/map.html
    toMarkerFormat(data) {
      var res = [];
      var markers_id = [];
      for (var i=0;i<data.length;i++) {
        var temp = {};
        temp.id = i;
        temp.latitude = data[i].position.latitude;
        temp.longitude = data[i].position.longitude;
        markers_id.push(data[i]._id)
        res.push(temp);
      }
      this.setData({
        markers_id : markers_id
      })
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
      // const _ = wx.cloud.database().command;
      wx.cloud.database().collection("marker").where({
        visiable : true
      }).get({
        success(res) {
          // console.log(res.data);
          var markers = that.toMarkerFormat(res.data);
          console.log(markers)
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
    // 展示标记点的信息
    showMarkerInfo(marker_id) {
      wx.cloud.database().collection("marker").doc(marker_id).get({
        success(res) {
          console.log(res)
        }
      })
    },

    // 点击标记点
    clickMarkers(e) {
      // console.log("点击标记点了")
      // console.log(e)
      var marker_index = e.detail.markerId;
      var marker_id = this.data.markers_id[marker_index];
      this.showMarkerInfo(marker_id);
      this.setData({
        display_marker_info : true
      })

    },

    calloutTap(e) {
      console.log("@callout:",e);
    },
    
    moveToMarker:(e)=>{//将地图中心移至指定经纬度
      var targetLatitude = e.currentTarget.dataset.index.resultLatitude;
      var targetLongitude = e.currentTarget.dataset.index.resultLongitude; 
      let mpCtx = wx.createMapContext('myMap');
      mpCtx.moveToLocation({
        latitude:targetLatitude,
        longitude:targetLongitude,
        success(res) {
          console.log("已经移至地图中心");
        },
        fail(res) {
          console.log("调用失败");
        }
      })
    },

    showSearchResultList(){//显示搜索结果列表和取消按钮
      this.setData({
        enable_search_list : true,
      })
    },

    notShowSearchResultList(){//不显示搜索结果列表
      this.setData({
        enable_search_list : false,
      })
    },

    doTheSearch(){//根据地点名执行搜索
      // console.log("doTheSearch");
      var placeName = this.data.searchName;
      // console.log(placeName);
      const db = wx.cloud.database();
      const _ = db.command;
      db.collection("marker").where(
        _.or([//模糊查询
          {
            // i	大小写不敏感
            // m	跨行匹配；让开始匹配符 ^ 或结束匹配符 $ 时除了匹配字符串的开头和结尾
            // 外，还匹配行的开头和结尾
            // s	让 . 可以匹配包括换行符在内的所有字符
            faculty :  db.RegExp({
              regexp:".*" + placeName + ".*",//正则表达式
              options:'i',
            })
          },
          {
            name :  db.RegExp({
              regexp:".*" + placeName + ".*",//正则表达式
              options:'i',
            })
          }
        ])).get({
        success:(res) => {
          var list = [];
          for (var i=0;i<res.data.length;i++) {
            var targetName = res.data[i].faculty+res.data[i].name;
            var targetLatitude = res.data[i].position.latitude;
            var targetLongitude = res.data[i].position.longitude;
            // console.log(targetName);
            // console.log(targetLatitude);
            // console.log(targetLongitude);
            var place = {
              resultName:targetName,
              resultLatitude:targetLatitude,
              resultLongitude:targetLongitude
            }
            list.push(place);
            // console.log(place);
          }
          this.setData({
            searchResult : list
          })
        },
        fail:(err) => {
          console.log("查询失败");
        }
      })
    },
    capturePlaceName(options){//捕获要搜索的地点名
      let name = options.detail.value;
      console.log("要搜索的地点是"+name);
      this.setData({
        searchName:name
      })
    },

    //筛选开关对应响应事件
    switchChange_work(){
      var that = this;
      this.setData({
        switch_work:!that.data.switch_work
      });
      console.log("办事筛选:"+this.data.switch_work);
    },
    switchChange_learning(){
      var that = this;
      this.setData({
        switch_learning:!that.data.switch_learning
      });
      console.log("学习筛选:"+this.data.switch_learning);
    },
    switchChange_food(){
      var that = this;
      this.setData({
        switch_food:!that.data.switch_food
      });
      console.log("餐饮筛选:"+this.data.switch_food);
    },
    switchChange_notify(){
      var that = this;
      this.setData({
        switch_notify:!that.data.switch_notify
      });
      console.log("通知筛选:"+this.data.switch_notify);
    },
    switchChange_group(){
      var that = this;
      this.setData({
        switch_group:!that.data.switch_group
      });
      console.log("群组筛选:"+this.data.switch_group);
    }
  })
  