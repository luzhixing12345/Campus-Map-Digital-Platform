
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
        // console.log(res)
        that.setData({
          userInfo: res.userInfo
        })
        // 加入全局变量
        app.globalData.userInfo = res.userInfo
        // 调用云函数拿到_openid保存在app.globalData.userInfo中
        wx.cloud.callFunction({
          name : 'login',
          data : {},
          success(ress) {
            // console.log(ress)
            app.globalData.userInfo._openid = ress.result.openid;
          }
        })
        
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
