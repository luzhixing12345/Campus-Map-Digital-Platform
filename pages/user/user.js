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
  },

  reportErr() {
    wx.navigateTo({
      url: './reportErr/reportErr',
    })
  }

    
})