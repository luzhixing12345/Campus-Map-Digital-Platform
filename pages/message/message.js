// message/message.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
      ifReplyChecked : true,
      ifLikesChecked  : true,
      ifNotifyChecked : true,

      replyUncheckedNum : 0,
      likesUncheckedNum : 0,
      notifyUncheckedNum : 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      var that = this;
      const db = wx.cloud.database();
      db.collection('likeMessage').where({
        isChecked : false,
      }).count().then((res)=>{
        var cnt_likes = res.total;
        var likesCheckedFlag = (cnt_likes == 0)?true:false;
        that.setData({
          ifLikesChecked : likesCheckedFlag,
          likesUncheckedNum : cnt_likes,
        })
      });
      
    },

    replyToMe(e){
        wx.navigateTo({
          url: 'replyToMe/replyToMe',
        })
    },

    receivedLikes(e){
      var that = this;
      wx.navigateTo({
        url: 'receivedLikes/receivedLikes',
        success:function(res){
          console.log('refresh');
          const db = wx.cloud.database();
          db.collection('likeMessage').where({
            isChecked : false,
          }).count().then((res)=>{
            var cnt_likes = res.total;
            var likesCheckedFlag = (cnt_likes == 0)?true:false;
            that.setData({
              ifLikesChecked : likesCheckedFlag,
              likesUncheckedNum : cnt_likes,
            })
          });
        },
      })
    },

    systemNotify(e){
        wx.navigateTo({
          url: 'systemNotify/systemNotify',
        })
    }
})