const app = getApp()
var count = 0

Page({
  data: {
      
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo,
   })
  },
  onLoad() {
  },

    
})