// pages/group/replyToMe/replyToMe.js
const app = getApp();

Page({
  data:{
    comments_array : [],
  },
  onLoad(options) {
    wx.showLoading({
      title: '正在加载',
      mask: true,
    })
    this.getUserComment();
  },

  getUserComment() {
    var that = this;
    wx.cloud.database().collection('comment').where({
      _openid : app.globalData.userInfo._openid,
    }).get({
      success(res) {
        console.log(res.data);
        var comments_with_cfc = []
        for (var i=0;i<res.data.length;i++) {
          if (res.data[i].cfc.length!=0){
            comments_with_cfc.push(res.data[i]);
          }
        }
        console.log(comments_with_cfc)
        that.setData({
          comments_array :comments_with_cfc,
        })
        wx.hideLoading();
      }
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