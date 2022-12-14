const app = getApp();
var timeUtil = require("../utils/time");
var distance = require("../utils/distance")
// 查重判断的经纬度范围



Page({
  data: {

    time: 0,
    latitude: 30.536761304903035,
    longitude: 114.36192806848169,
    current_position: {},
    markers_id: [], // 获取到的标记点 _id
    enable_add_marker: false, // 能否添加标记 false->不能添加
    use_select: false, // 是否使用筛选
    display_marker_info: false, // 是否显示标记点信息
    enable_search_list: false, //是否显示搜索候选列表
    searchResult: [],
    searchName: "",

    //五大类筛选对应的布尔值（初始值默认均为true）
    switch_food: true,
    switch_learning: true,
    switch_work: true,
    switch_notify: true,
    switch_group: true,

    marker_info: {}, // 标记点信息

    // 用户是否点赞收藏
    liked: false,
    collected: false
  },

  onShow(option) {
    this.jumpToMarker();
    this.jumpToComment();
    this.getAllMarkers();
    // console.log(app.globalData.userInfo)
  },

  onLoad(option) {
    // this.refactorDatabaseMarkerItem();
    // 跳转到此页面即申请权限

    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
          })
        }
      }
    })
    this.mpCtx = wx.createMapContext('myMap');
    this.setData({
      _openid : app.globalData.userInfo._openid
    })
  },

  // 放大预览图片
  preview(e) {
    // console.log(e)
    let picturesUrl = e.currentTarget.dataset.src
    let index = e.currentTarget.dataset.index
    wx.previewImage({
      urls: picturesUrl,
      current: picturesUrl[index]
    })
  },

  // 动画效果
  // animation_name(string) : animation="{{animation_name}}"
  // position(string) : 'up'(向上展开) | 'down'(向下关闭)
  animationAdjust(animation_name, position) {
    var bias = position == 'up' ? -800 : 800;
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'linears',
      delay: 0,
    });
    animation.translateY(bias).step()
    this.setData({
      [animation_name]: animation.export(),
    })
  },

  // marker数据库 表项整体修改
  // 用于开发过程中重构一次数据库表项，使用后记得注释掉
  refactorDatabaseMarkerItem() {
    wx.cloud.database().collection('marker').get({
      success(res) {
        var i;
        for (i = 0; i < res.data.length; i++) {
          var name = res.data[i].creator;
          var id = res.data[i]._id
          var openid = app.globalData.userInfo._openid;
          wx.cloud.database().collection('marker').doc(id).update({
            data: {
              creator: {
                'nickName':name,
                '_openid':openid
              },
            },
          })
        }
      }
      })
  },

  // 筛选标记点 TODO
  selectMarker() {
    var that = this;
    this.setData({
      use_select: !that.data.use_select
    })
  },

  // 将数据库查找出的数据转化为markers的形式
  // https://developers.weixin.qq.com/miniprogram/dev/component/map.html
  toMarkerFormat(data) {
    var res = [];
    var markers_id = [];
    for (var i = 0; i < data.length; i++) {
      var temp = {};
      temp.id = i;
      temp.latitude = data[i].position.coordinates[1];
      temp.longitude = data[i].position.coordinates[0];
      temp.width = 40;
      temp.height = 40;
      temp.iconPath = "../../images/" + data[i].type + ".png";
      markers_id.push(data[i]._id)
      res.push(temp);
    }
    this.setData({
      markers_id: markers_id
    })
    return res;
  },

  // 点击加号准备添加新标记点
  readyToAddMarker() {
    this.setData({
      enable_add_marker: true
    })
  },
  // 取消添加标记点
  cancelToAddMarker() {
    this.setData({
      enable_add_marker: false
    })
  },

  // 获取所有标记点
  // TODO: 分类
  getAllMarkers() {
    var that = this;
    wx.cloud.callFunction({
      name: 'getAll'
    }).then((res) => {
      var newMarkers = that.toMarkerFormat(res.result); //原本是(res.data)
      //但是这里调用了云函数，所以改成了res.result
      // console.log(newMarkers)
      that.setData({
        markers: newMarkers,
        originMarkers: res.result
      })
    })
  },

  // 点击地图中的某个点添加标记
  addNewMarker(e) {
    // 未点击加号，不处理
    if (!this.data.enable_add_marker) return;
    this.setData({
      enable_add_marker: false
    })
    // 获取经纬度
    var latitude = e.detail.latitude;
    var longitude = e.detail.longitude;
    // console.log(latitude,longitude)
    // return;
    // 查重
    if (!distance.checkMarkerDistance(this.data.markers, e.detail)) {
      // 地点过于靠近，提示
      // console.log("#")
      wx.showModal({
        title: "温馨提示", // 提示的标题
        content: "标记的地点距离过近", // 提示的内容
        showCancel: false, // 是否显示取消按钮，默认true
        confirmText: "确定", // 确认按钮的文字，最多4个字符
        confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
      })
      return;
    }
    var db = wx.cloud.database();
    wx.navigateTo({
      url: 'marker/addNewMarker/addNewMarker',
      success(res) {
        res.eventChannel.emit('position', {
          position: db.Geo.Point(e.detail.longitude, e.detail.latitude)
        })
      }
    })
  },


  // 跳转到指定position 处于视野中央
  moveToLocation(latitude, longitude) {

    this.mpCtx.moveToLocation({
      latitude: latitude,
      longitude: longitude
    })
  },
  //将地图中心移至指定经纬度
  moveToMarker(e) {
    var targetLatitude = e.currentTarget.dataset.index.resultLatitude;
    var targetLongitude = e.currentTarget.dataset.index.resultLongitude;

    this.moveToLocation(targetLatitude, targetLongitude)
  },

  showSearchResultList() { //显示搜索结果列表和取消按钮
    this.setData({
      enable_search_list: true,
    })
  },

  notShowSearchResultList() { //不显示搜索结果列表
    this.setData({
      enable_search_list: false,
    })
  },

  doTheSearch() { //根据地点名执行搜索
    var placeName = this.data.searchName;
    const db = wx.cloud.database();
    const _ = db.command;
    db.collection("marker").where(
      _.or([ //模糊查询
        {
          // i	大小写不敏感
          // m	跨行匹配；让开始匹配符 ^ 或结束匹配符 $ 时除了匹配字符串的开头和结尾
          // 外，还匹配行的开头和结尾
          // s	让 . 可以匹配包括换行符在内的所有字符
          faculty: db.RegExp({
            regexp: ".*" + placeName + ".*", //正则表达式
            options: 'i',
          })
        },
        {
          name: db.RegExp({
            regexp: ".*" + placeName + ".*", //正则表达式
            options: 'i',
          })
        }
      ])).get({
      success: (res) => {
        var list = [];
        for (var i = 0; i < res.data.length; i++) {
          var targetName = res.data[i].faculty + res.data[i].name;
          var targetLatitude = res.data[i].position.latitude;
          var targetLongitude = res.data[i].position.longitude;
          var place = {
            resultName: targetName,
            resultLatitude: targetLatitude,
            resultLongitude: targetLongitude
          }
          list.push(place);
          // console.log(place);
        }
        this.setData({
          searchResult: list
        })
      },
      fail: (err) => {
        console.log("查询失败");
      }
    })
  },

  // 页面防抖
  handleInput(e) {
    clearTimeout(this.data.time)
    var that = this;
    this.data.time = setTimeout(() => {
      that.capturePlaceName(e.detail.value)
    }, 1000)
  },


  async capturePlaceName(name) { //捕获要搜索的地点名
    await this.setData({
      searchName: name
    })

    await this.doTheSearch();

  },
  //根据筛选条件更改可视性
  changeMarkerVisibility() {
    var temp = [];
    var that = this;
    var om = that.data.originMarkers;
    for (let i = 0; i < om.length; i++) {
      if (this.data.switch_work && om[i].type == "work") temp.push(om[i]);
      if (this.data.switch_learning && om[i].type == "learning") temp.push(om[i]);
      if (this.data.switch_food && om[i].type == "food") temp.push(om[i]);
      if (this.data.switch_notify && om[i].type == "notify") temp.push(om[i]);
      if (this.data.switch_group && om[i].type == "group") temp.push(om[i]);
    }
    var newMarker = that.toMarkerFormat(temp);
    // console.log(newMarker);
    that.setData({
      markers: newMarker
    })
  },

  //筛选开关对应响应事件
  switchChange_work() {
    var that = this;
    this.setData({
      switch_work: !that.data.switch_work
    });
    console.log("办事筛选:" + this.data.switch_work);
    this.changeMarkerVisibility();
  },
  switchChange_learning() {
    var that = this;
    this.setData({
      switch_learning: !that.data.switch_learning
    });
    console.log("学习筛选:" + this.data.switch_learning);
    this.changeMarkerVisibility();
  },
  switchChange_food() {
    var that = this;
    this.setData({
      switch_food: !that.data.switch_food
    });
    console.log("餐饮筛选:" + this.data.switch_food);
    this.changeMarkerVisibility();
  },
  switchChange_notify() {
    var that = this;
    this.setData({
      switch_notify: !that.data.switch_notify
    });
    console.log("通知筛选:" + this.data.switch_notify);
    this.changeMarkerVisibility();
  },
  switchChange_group() {
    var that = this;
    this.setData({
      switch_group: !that.data.switch_group
    });
    console.log("群组筛选:" + this.data.switch_group);
    this.changeMarkerVisibility();
  },

  // 获取标记点的详细信息保存在marker_info中
  getMarkerInfo(res) {
    // marker表中指保存like collection的数量
    // 具体的点赞和收藏信息保存在user表中s
    this.setData({
      "marker_info._id": res.data._id, // 用于点赞和收藏的信息处理
      "marker_info.name": res.data.name,
      "marker_info.type": res.data.type,
      "marker_info.creator": res.data.creator.nickName,
      "marker_info.faculty": res.data.faculty,
      "marker_info.like_number": res.data.like,
      "marker_info.collection_number": res.data.collection,
      "marker_info.comment_number": res.data.comment,
      "marker_info.description": res.data.description,
      "marker_info.picturesUrl": res.data.picturesUrl,
      "marker_info.creator_openid" : res.data.creator._openid
    })
  },
  
  editMarker() {
    var marker_info = this.data.marker_info;
    this.downMarkerInfo();
    wx.navigateTo({
      url: './marker/editMarker/editMarker',
      success(res) {
        res.eventChannel.emit('marker_info',marker_info)
      }
    })
  },


  async upMarkerInfo(e) {
    // 添加标记点的情况，不处理
    if (this.data.enable_add_marker) return;

    if (typeof(e)=='string') {
      // jump 跳转过来的情况
      var marker_id = e;
      var index = this.data.markers_id.indexOf(e);
      var latitude = this.data.markers[index].latitude;
      var longitude = this.data.markers[index].longitude;
    } else {
      var marker_id = this.data.markers_id[e.markerId];
      var latitude = this.data.markers[e.markerId].latitude;
      var longitude = this.data.markers[e.markerId].longitude;
    }

    // 标记点移动到视野中央
    this.setData({
      marker_id: marker_id
    })
    this.moveToLocation(latitude, longitude);
    const db = wx.cloud.database();
    const res = await db.collection('user').doc(app.globalData.userInfo._id).get();
    this.setData({
      liked: res.data.likes.markers.indexOf(marker_id) != -1,
      collected: res.data.collections.indexOf(marker_id) != -1
    })
    const marker_info = await db.collection('marker').doc(marker_id).get()
    this.getMarkerInfo(marker_info)
    this.animationAdjust('ani', 'up');
  },

  // 降下显示信息
  downMarkerInfo() {
    this.animationAdjust('ani', 'down');
  },

  // 当用户点击marker的喜欢按钮
  clickLikeButton() {
    var that = this;
    var like_status = !this.data.liked; // 改变之后的liked
    this.setData({
      liked: like_status
    })
    // 更新user表
    wx.cloud.database().collection('user').doc(app.globalData.userInfo._id).get({
      success(res) {
        // 喜欢则添加，取消喜欢则删除
        var new_likes = res.data.likes.markers;
        if (like_status) {
          new_likes.push(that.data.marker_info._id);
        } else {
          for (var i = 0; i < new_likes.length; i++) {
            if (new_likes[i] == that.data.marker_info._id) {
              new_likes.splice(i, 1);
              break;
            }
          }
        }
        // 更新用户数据库表
        wx.cloud.database().collection('user').doc(app.globalData.userInfo._id).update({
          data: {
            'likes.markers': new_likes
          }
        })
      }
    })
    // 更新marker表
    wx.cloud.database().collection('marker').doc(that.data.marker_info._id).get({
      success(res) {
        // 喜欢则+1，取消喜欢则-1
        var new_like = like_status ? res.data.like + 1 : res.data.like - 1;
        that.setData({
          'marker_info.like_number': new_like
        })
        wx.cloud.database().collection('marker').doc(that.data.marker_info._id).update({
          data: {
            like: new_like
          }
        })
      }
    })

    // 更新like表TODO
  },

  // 当用户点击评论的喜欢按钮
  clickCommentLikeButton(e) {
    // console.log(e)
    var comment_index = e.currentTarget.dataset.index;
    var that = this;
    var comment = this.data.comment_info[comment_index];
    var like_status = !comment.isLiked; //改变之后的isLiked
    this.setData({
      ['comment_info['+comment_index+'].isLiked'] : like_status,
    })
    //更新user表
    wx.cloud.database().collection('user').doc(app.globalData.userInfo._id).get({
      success(res) {
        var new_likes = res.data.likes.comments;
        if(like_status) {
          new_likes.push(comment._id);
        } else {
          for (var i = 0; i < new_likes.length; i++) {
            if(new_likes[i] == comment._id) {
              new_likes.splice(i,1);
              break;
            }
          }
        }
        //更新用户数据库表
        wx.cloud.database().collection('user').doc(app.globalData.userInfo._id).update({
          data: {
            'likes.comments': new_likes
          }
        })
      }
    })
    //更新comment表
    wx.cloud.database().collection('comment').doc(comment._id).get({
      success(res){
        var new_like = like_status ? res.data.like + 1 : res.data.like - 1;
        that.setData({
          ['comment_info['+comment_index+'].like']: new_like
        })
        wx.cloud.database().collection('comment').doc(comment._id).update({
          data: {
            like: new_like
          }
        })
      }
    })
  },


  // 当用户点击收藏按钮
  clickCollectionButton() {
    var that = this;
    var collection_status = !this.data.collected; // 改变之后的liked
    this.setData({
      collected: collection_status
    })
    // 更新user表
    wx.cloud.database().collection('user').doc(app.globalData.userInfo._id).get({
      success(res) {
        // 喜欢则添加，取消喜欢则删除
        var new_collections = res.data.collections;
        if (collection_status) {
          new_collections.push(that.data.marker_info._id);
        } else {
          for (var i = 0; i < new_collections.length; i++) {
            if (new_collections[i] == that.data.marker_info._id) {
              new_collections.splice(i, 1);
              break;
            }
          }
        }
        // 更新用户数据库表
        wx.cloud.database().collection('user').doc(app.globalData.userInfo._id).update({
          data: {
            collections: new_collections
          }
        })
      }
    })
    // 更新marker表
    wx.cloud.database().collection('marker').doc(that.data.marker_info._id).get({
      success(res) {
        // 喜欢则+1，取消喜欢则-1
        var new_collection = collection_status ? res.data.collection + 1 : res.data.collection - 1;
        that.setData({
          'marker_info.collection_number': new_collection
        })
        wx.cloud.database().collection('marker').doc(that.data.marker_info._id).update({
          data: {
            collection: new_collection
          }
        })
      }
    })
  },


  // ------------------------------------------------------------
  // 以下是对评论信息的处理

  // 开发测试使用
  addCommentForTest() {
    var that = this;
    wx.cloud.database().collection('comment').add({
      data: {
        _marker_id: that.data.marker_id,
        userInfo: app.globalData.userInfo,
        time: new Date(),
        content: "hahaha",
        like: 0,
        dislike: 0,
        cfc: [] // cfc : comment for comment (楼中楼)
      }
    })
  },

  // 更新当前的评论信息
  async updateCommentInfo() {
    var that = this;
    const user_liked_comments = await wx.cloud.database().collection('user').doc(app.globalData.userInfo._id).get();
    wx.cloud.database().collection('comment').where({
      _marker_id: that.data.marker_id
    }).get({
      success(res) {
        var tempList = [];
        for (var i = 0; i < res.data.length; i++) {
          var time = timeUtil.displayRelativeTime(res.data[i].time);
          var temp = {};
          temp.userInfo = res.data[i].userInfo;
          if (temp.userInfo._openid != app.globalData.userInfo._openid) {
            temp.enable_delete = false;
          } else {
            // 同一个人则可以删除
            temp.enable_delete = true;
          }
          temp.content = res.data[i].content;
          temp.like = res.data[i].like;
          temp.time = time;
          temp.cfc = res.data[i].cfc;
          temp._id = res.data[i]._id;
          temp.isLiked = user_liked_comments.data.likes.comments.indexOf(res.data[i]._id) != -1;
          tempList.push(temp);
        }

        that.setData({
          comment_info: tempList,
        })
      }
    })
  },

  // 当用户点击评论按钮,打开所有评论信息
  upCommentInfo() {
    // this.addCommentForTest();
    this.updateCommentInfo();
    this.animationAdjust('comment_ani', 'up');
  },

  // 关闭评论信息
  downCommentInfo() {
    this.animationAdjust('comment_ani', 'down');
  },

  updateCfc(commentId) {
    var that = this;
    wx.cloud.database().collection('comment').doc(commentId).get({
      success: (res) => {
        for (var i = 0; i < res.data.cfc.length; i++) {
          var time = timeUtil.displayRelativeTime(res.data.cfc[i].time);
          res.data.cfc[i].original_time = res.data.cfc[i].time;
          res.data.cfc[i].time = time;
          res.data.cfc[i].enable_delete = res.data.cfc[i].userInfo._openid == app.globalData.userInfo._openid;
        }
        // console.log(res.data.cfc)
        that.setData({
          "cfc_data.cfc": res.data.cfc
        })
      },
    })
  },

  upCfcInfo(e) {
    this.setData({
      cfc_data: e.currentTarget.dataset,
    })
    this.updateCfc(e.currentTarget.dataset.commentid);
    this.animationAdjust('cfc_ani', 'up');
  },

  downCfcInfo() {
    this.animationAdjust('cfc_ani', 'down');
  },

  captureComment(e) {
    let content = e.detail.value;
    // console.log("要发布的评论是" + content);
    this.setData({
      commentContent: content
    })
  },

  /**
   * 发布评论 
   */
  postComment(e) {
    var that = this;
    wx.cloud.database().collection('marker').doc(that.data.marker_id).update({
      data: {
        comment: that.data.marker_info.comment_number + 1
      },
      success(res) {
        that.setData({
          "marker_info.comment_number": that.data.marker_info.comment_number + 1
        })
      }
    })

    wx.cloud.database().collection('comment').add({
      data: {
        _marker_id: that.data.marker_id,
        userInfo: app.globalData.userInfo,
        time: new Date(),
        content: that.data.commentContent,
        like: 0,
        dislike: 0,
        cfc: [] // cfc : comment for comment (楼中楼)
      },
      success: () => {
        that.setData({
          commentContent: ''
        });
        that.updateCommentInfo();
      }
    })
  },

  captureCfc(e) {
    let content = e.detail.value;
    // console.log("要发布的cfc是" + content);
    this.setData({
      cfcContent: content
    })
  },
  //发送楼中楼评论
  postCfc(e) {
    var that = this;
    var temp = {};
    temp.userInfo = app.globalData.userInfo;
    temp.time = new Date();
    temp.content = that.data.cfcContent;
    //TODO：完成对应评论cfc数据的更新
    var commentId = that.data.cfc_data.commentid;
    const db = wx.cloud.database();
    const _ = db.command;

    db.collection("marker").doc(that.data.marker_id).update({
      data: {
        comment: that.data.marker_info.comment_number + 1
      },
      success(res) {
        that.setData({
          "marker_info.comment_number": that.data.marker_info.comment_number + 1
        })
      }
    })

    db.collection('comment').doc(commentId).update({
      data: {
        cfc: _.push(temp)
      },
      success: () => {
        // console.log("success")
        //TODO:刷新楼中楼评论
        that.updateCfc(commentId);
        that.setData({
          cfcContent: ''
        });
      }
    })
  },

  // 处理从消息跳转过来的事件
  jumpToMarker() {
    if (!app.globalData.marker_jump) return;
    app.globalData.marker_jump = false; // 下次不再跳转
    this.upMarkerInfo(app.globalData.marker_id)
  },

  jumpToComment() {
    if (!app.globalData.comment_jump) return;
    app.globalData.comment_jump = false; // 下次不再跳转
    this.upMarkerInfo(app.globalData.marker_id)
    this.upCommentInfo()
  },
  deleteMarker() {
    var that = this;
    wx.showModal({
      title: "准备删除标记", // 提示的标题
      content: "您确认要删除该标记吗？", // 提示的内容
      showCancel: true, // 是否显示取消按钮，默认true
      confirmText: "确定", // 确认按钮的文字，最多4个字符
      confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
      cancelText: "取消",
      cancelColor:"#576B95",
      success(r) {
        if (r.confirm) {
          // 删除
          wx.cloud.database().collection('marker').doc(that.data.marker_info._id).remove()
          wx.cloud.database().collection('systemNotification').add({
            data: {
              marker_id : '',
              userOpenid : app.globalData.userInfo._openid,
              type : 'delete',
              content : that.data.marker_info.name + that.data.marker_info.faculty,
            },
            success(res) {
              wx.showModal({
                title: "删除成功", // 提示的标题
                showCancel: false, // 是否显示取消按钮，默认true
                confirmText: "确定", // 确认按钮的文字，最多4个字符
                confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
                success(rrr) {
                  if (rrr.confirm) {
                    wx.switchTab({
                      url: 'map',
                    })
                  }
                }
              })
            }
          })
        }
      }
    })
  },

  // 删除评论
  deleteComment(e) {
    var index = e.currentTarget.dataset.index;
    var that = this;
    var comment = this.data.comment_info[index];
    var marker_id = this.data.marker_id;
    // console.log(comment)
    // console.log(marker_id)
    wx.showModal({
      title: "准备删除评论", // 提示的标题
      content: "您确认要删除该评论吗？", // 提示的内容
      showCancel: true, // 是否显示取消按钮，默认true
      confirmText: "确定", // 确认按钮的文字，最多4个字符
      confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
      cancelText: "取消",
      cancelColor:"#576B95",
      success(r) {
        if (r.confirm) {
          // 删除comment的信息
          wx.cloud.database().collection('comment').doc(comment._id).remove();
          // 修改marker中评论数
          var new_comment_number = that.data.marker_info.comment_number - comment.cfc.length -1;
          wx.cloud.database().collection('marker').doc(marker_id).update({
            data : {
              comment : new_comment_number
            },
            success() {
              that.setData({
                'marker_info.comment_number' : new_comment_number
              })
              wx.showModal({
                title: "删除成功", // 提示的标题
                showCancel: false, // 是否显示取消按钮，默认true
                confirmText: "确定", // 确认按钮的文字，最多4个字符
                confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
                success(rrr) {
                  if (rrr.confirm) {
                    that.updateCommentInfo();
                  }
                }
              })
            }
          })
        }
      }
    })
  },
  //删除楼中楼的一条评论
  deletecfcComment(e) {
    // console.log(e)
    var index = e.currentTarget.dataset.index;
    var that = this;
    wx.showModal({
      title: "准备删除评论", // 提示的标题
      content: "您确认要删除该评论吗？", // 提示的内容
      showCancel: true, // 是否显示取消按钮，默认true
      confirmText: "确定", // 确认按钮的文字，最多4个字符
      confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
      cancelText: "取消",
      cancelColor:"#576B95",
      success(r) {
        if (r.confirm) {
          // 删除楼中楼的一条评论
          var current_cfc = that.data.cfc_data.cfc;
          current_cfc.splice(index,1)
          for (var i=0;i<current_cfc.length;i++) {
            current_cfc[i].time = current_cfc[i].original_time;
            delete current_cfc[i].enable_delete;
            delete current_cfc[i].original_time;
          }
          // console.log(current_cfc)
          var new_comment_number = that.data.marker_info.comment_number -1;
          wx.cloud.database().collection('marker').doc(that.data.marker_id).update({
            data : {
              comment : new_comment_number
            }
          })
          wx.cloud.database().collection('comment').doc(that.data.cfc_data.commentid).update({
            data : {
              cfc : current_cfc
            },
            success(res) {
              that.setData({
                'marker_info.comment_number' : new_comment_number
              })
              wx.showModal({
                title: "删除成功", // 提示的标题
                showCancel: false, // 是否显示取消按钮，默认true
                confirmText: "确定", // 确认按钮的文字，最多4个字符
                confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
                success(rrr) {
                  if (rrr.confirm) {
                    that.updateCfc(that.data.cfc_data.commentid);
                  }
                }
              })
            }
          })
        }
      }
    })
  }
})