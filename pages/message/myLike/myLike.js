
const app = getApp()
Page({
  data : {
    likes_markers : [],
    likes_comments : []
  },
  onLoad() {
    wx.showLoading({
      title: '正在加载',
      mask: true,
    })
    this.getUserlikes();
  },

  // 获取用户所用的点赞信息
  // 点赞信息有两种： 点赞的marker和点赞的评论
  getUserlikes() {
    var that = this;
    wx.cloud.database().collection('user').doc(app.globalData.userInfo._id).get({
      success(res) {
        that.getlikesInfo_markers(res.data.likes);
        that.getlikesInfo_comments(res.data.likes);
      }
    })
  },

  // 获取收藏的marker的信息
  getlikesInfo_markers(likes_id) {
    
    var that = this;
    const _ = wx.cloud.database().command;
    wx.cloud.database().collection('marker').where({
      _id: _.in(likes_id.markers)
    }).get({
      success(res) {
        that.setData({
          likes_markers : res.data
        })
        wx.hideLoading();
      }
    })
  },

  getlikesInfo_comments(likes_id){
    var that = this;
    const _ = wx.cloud.database().command;
    wx.cloud.database().collection('comment').where({
      _id: _.in(likes_id.comments)
    }).get({
      success(res) {
        that.setData({
          likes_comments : res.data
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
  },

  jumpToComment(e) {
    var comment_id = e.currentTarget.dataset.id;
    var marker_id = e.currentTarget.dataset.markerid;
    app.globalData.marker_id = marker_id;
    app.globalData.comment_id = comment_id;
    app.globalData.comment_jump = true;
    wx.switchTab({
      url: '../../map/map',
    })
  }
})