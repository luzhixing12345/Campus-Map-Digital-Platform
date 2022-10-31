
const app = getApp()
Page({
  data : {
    collections :[]
  },
  onLoad() {
    wx.showLoading({
      title: '正在加载',
      mask: true,
    })
    this.getUserCollections();
  },

  // 获取用户所用的收藏信息
  getUserCollections() {
    var that = this;
    wx.cloud.database().collection('user').doc(app.globalData.userInfo._id).get({
      success(res) {
        that.getCollectionsInfo(res.data.collections)
      }
    })
  },

  // 获取收藏的marker的信息
  getCollectionsInfo(collections_id) {
    var that = this;
    const _ = wx.cloud.database().command;
    wx.cloud.database().collection('marker').where({
      _id: _.in(collections_id)
    }).get({
      success(res) {
        that.setData({
          collections : res.data
        })
        wx.hideLoading();
      }
    })
  },

  // 跳转到对应的marker

  jumpToMarker(e) {
    var marker_id = e.currentTarget.dataset.id;
    app.globalData.marker_id = marker_id; // 设置一个全局变量解决wx.switchTab不能传参
    app.globalData.marker_jump = true; // 是否跳转到该marker
    wx.switchTab({
      url: '../../map/map'
    })
  }
})