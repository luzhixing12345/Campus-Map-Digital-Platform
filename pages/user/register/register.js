
const app = getApp()

// var sameAccountId = false;

Page({
  data: {
      logo_info : "武汉大学校园地图数字平台"
  },
  onshow() {
  },
  getUserProfile(e) {

    var that = this;
    wx.getUserProfile({
      desc: '展示信息',
      success: (res) => {
        console.log(res)
        that.setData({
          userInfo: res.userInfo
        })
        wx.showToast({
          title: '已授权',
          duration: 500
        })
        // 加入全局变量
        app.globalData.userInfo = res.userInfo
        console.log(app.globalData.userInfo)
        wx.switchTab({
          url: '/pages/user/user',
        })
      }
    })
  },

  onLoad: function(options){
    console.log(app.globalData.userInfo);
    this.setData({
        userInfo: app.globalData.userInfo
    })
  },

})
