// app.js
App({
    onLaunch() {
      wx.cloud.init({
        env:"cloud1-0giy05gz218ffca8"
      })
      if(wx.getStorageSync('userInfo')){
        this.globalData.userInfo = wx.getStorageSync('userInfo')
        console.log('get storage')
        wx.switchTab({
            url: '/pages/map/map',
          })
      }
      console.log("no storage found")
    },
    globalData: {
      userInfo: null
    }
  })
  