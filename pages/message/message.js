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
      db.collection('like').where({
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



    myLike(){
      var that = this;
      wx.navigateTo({
        url: 'myLike/myLike',
        success:function(res){
          console.log('refresh');
          const db = wx.cloud.database();
          db.collection('like').where({
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

    myCollection() {
      wx.navigateTo({
        url: 'myCollection/myCollection',
      })
    },

    myMessage() {
      wx.navigateTo({
        url: 'myMessage/myMessage',
      })
    },

    systemNotify(e){
        wx.navigateTo({
          url: 'systemNotify/systemNotify',
        })
    }
})