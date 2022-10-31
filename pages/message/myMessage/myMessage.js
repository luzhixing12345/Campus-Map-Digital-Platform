// pages/group/replyToMe/replyToMe.js
const app = getApp();
var timeUtil = require("../../utils/time");

Page({

  onLoad(options) {
    this.setData({
      userName : app.globalData.userInfo.nickName,
    })

    var that = this;
    const db = wx.cloud.database();
    db.collection('comment').where({
      _openid : app.globalData.userInfo._openid,
    }).get({
      success:(res)=>{
        var tempList = [];
        var dataList = res.data;
        for(var i = 0; i < dataList.length; ++i){
          var tempcfc = dataList[i].cfc;
          var oriCmt = dataList[i].content;
          var oriCmtId = dataList[i]._id;
          for(var j = 0; j < tempcfc.length; ++j){
            var temp = {};
            temp.replyContent = tempcfc[j].content;
            temp.replyTime = timeUtil.displayRelativeTime(tempcfc[j].time);
            temp.replyerName = tempcfc[j].userInfo.nickName;
            temp.replyerAvatarUrl = tempcfc[j].userInfo.avatarUrl;
            temp.originComment = (oriCmt.length>10)?(oriCmt.substring(0,10)+'...'):(oriCmt);
            temp.originCommentId = oriCmtId;
            tempList.push(temp);
          }  
        }
        that.setData({
          replyList : tempList,
        })
        
      },
      fail:(res)=>{
        console.log('查询失败');
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //跳转到回复他人的页面
  reply(e){
    wx.navigateTo({
      url: '../replyToMe/replyToOthers/replyToOthers',
      success:(res)=>{
        res.eventChannel.emit('acceptDataFromReplyToMe',{
          commentId : e.currentTarget.dataset.commentid,
        })
      }
    })
  }
})