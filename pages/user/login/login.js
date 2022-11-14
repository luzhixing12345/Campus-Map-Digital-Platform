const app = getApp()

// var sameAccountId = false;

Page({
  data: {
    logo_info: "武汉大学校园地图数字平台",
    avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    nickName: "",
    theme: wx.getSystemInfoSync().theme,
    getAvatarUrl: false,
    getNickName: false,
    time: 0
  },

    // 获取用户登录信息
    login() {
      var that = this;
      wx.getUserProfile({
        desc: '展示信息',
        success: (res) => {
          wx.cloud.callFunction({
            name: 'login',
            data: {},
            success(ress) {
              app.globalData.userInfo = {};
              app.globalData.userInfo.avatarUrl = that.data.avatarUrl;
              app.globalData.userInfo.nickName = that.data.nickName;
              app.globalData.userInfo._openid = ress.result.openid;
              wx.cloud.database().collection('user').where({
                _openid: app.globalData.userInfo._openid
              }).get({
                success(r) {
                  if (r.data.length == 0) {
                    // 尚未注册
                    that.registerNewUser(app.globalData.userInfo);
                  } else {
                    app.globalData.userInfo._id = r.data[0]._id;
                    wx.setStorageSync('userInfo', app.globalData.userInfo)
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
  

  // 注册新用户 以及 获取用户的 _id
  registerNewUser(userInfo) {
    wx.cloud.database().collection('user').add({
      data: {
        _openid: userInfo._openid,
        personal_info: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          introduction: "这个人很神秘，什么也没有说",
        }, // 个人详细信息
        likes: {comments:[],markers:[]}, // 所有点赞的marker
        collections: [], // 所有收藏的marker
      },
      success(res) {
        app.globalData.userInfo._id = res._id
        wx.setStorageSync('userInfo', app.globalData.userInfo)
      }
    })
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
      getAvatarUrl:true
    })
  },

  handleInput(e) {
    clearTimeout(this.data.time)
    var that = this;
    this.data.time = setTimeout(() => {
      that.captureNickName(e.detail.value)
    }, 1000)
  },

  captureNickName(name) {
    if (name.length>10 ) {
      wx.showModal({
        title: "昵称过长", // 提示的标题
        content: "昵称应小于10字符", // 提示的内容
        showCancel: false, // 是否显示取消按钮，默认true
        confirmText: "确定", // 确认按钮的文字，最多4个字符
        confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
      })
      return;
    }
    if (name.trim() == '') {
      wx.showModal({
        title: "昵称不应为空", // 提示的标题
        showCancel: false, // 是否显示取消按钮，默认true
        confirmText: "确定", // 确认按钮的文字，最多4个字符
        confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
      })
      return;
    }
    this.setData({
      nickName: name,
      getNickName:true
    })
  },

  onLoad: function (options) {
    // console.log(app.globalData.userInfo);
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

})