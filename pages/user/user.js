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

  myLike() {
    wx.navigateTo({
      url: '../message/myLike/myLike',
    })
  },

  myCollection() {
    wx.navigateTo({
      url: '../message/myCollection/myCollection',
    })
  },

  myMessage() {
    wx.navigateTo({
      url: '../message/myMessage/myMessage',
    })
  },

  systemNotify() {
    wx.navigateTo({
      url: '../message/systemNotify/systemNotify',
    })
  }

    
})