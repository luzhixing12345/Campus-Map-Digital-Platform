// pages/group/systemNotify/systemNotify.js
const app = getApp()
Page({

  onLoad() {
    this.getAllNotification();
  },

  // 获取该用户的所有系统消息
  getAllNotification() {
    var that = this;
    wx.cloud.database().collection('systemNotification').where({
      "userOpenid" : app.globalData.userInfo._openid
    }).get({
      success(res) {
        console.log(res);
        var notification = [];
        for (var i=0;i<res.data.length;i++) {
          var temp = {};
          // 发布
          if (res.data[i].type == 'add') {
            temp.head = "标记点" +res.data[i].content + "发布成功";
            temp.body = '您刚刚成功发布了一个标记点信息，快来看看吧~';
            temp.marker_id = res.data[i].marker_id;
          } else {
            // 删除
            temp.head = "标记点" + res.data[i].content + "删除成功";
            temp.body = '感谢您的参与';
            temp.marker_id = ''
          }
          notification.push(temp);
        }
        that.setData({
          system_info : notification
        })
      }
    })
  },

  jumpToMarker(e) {
    // console.log(e)
    var marker_id = e.currentTarget.dataset.id;
    app.globalData.marker_id = marker_id; // 设置一个全局变量解决wx.switchTab不能传参
    app.globalData.marker_jump = true; // 是否跳转到该marker
    wx.switchTab({
      url: '../../map/map'
    })
  }
})
