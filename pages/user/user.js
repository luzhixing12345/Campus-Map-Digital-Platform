const app = getApp()
var count = 0

Page({
  data: {
      
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo,
      avatarUrl : app.globalData.userInfo.avatarUrl
   })
  },
  onLoad() {
      wx.setStorageSync('userInfo', app.globalData.userInfo)
      // wx.cloud.database().collection('user').where({
      //   _openid : app.globalData.userInfo.
      // })
      // console.log(app.globalData.userInfo)

  }

    
})