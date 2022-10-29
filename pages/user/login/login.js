const app = getApp()

// var sameAccountId = false;

Page({
  data: {
    logo_info: "武汉大学校园地图数字平台"
  },
  onshow() {},

  // 注册新用户
  registerNewUser(userInfo) {
    console.log("$register new user")
    wx.cloud.database().collection('user').add({
      data: {
        _openid: userInfo._openid,
        personal_info: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          introduction: "这个人很神秘，什么也没有说",
          entryGrade: "",
          studentID: ""
        }, // 个人详细信息
        likes: [], // 所有点赞的marker
        collections: [], // 所有收藏的marker
        comments: [] // 评论相关信息
      },
      success(res) {
        app.globalData.userInfo._id = res._id
      }
    })
  },

  // 获取用户登录信息
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
          name: 'login',
          data: {},
          success(ress) {
            // console.log(ress)
            app.globalData.userInfo._openid = ress.result.openid;
            wx.setStorageSync('userInfo', app.globalData.userInfo)
            wx.cloud.database().collection('user').where({
              _openid: app.globalData.userInfo._openid
            }).get({
              success(r) {
                if (r.data.length == 0) {
                  // 尚未注册
                  that.registerNewUser(app.globalData.userInfo);
                }
              }
            })
          }
        })
        wx.switchTab({
          url: '/pages/map/map',
        })
      }
    })
  },

  onLoad: function (options) {
    // console.log(app.globalData.userInfo);
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

})