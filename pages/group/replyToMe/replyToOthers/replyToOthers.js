// pages/group/replyToMe/replyToOthers/replyToOthers.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName : '丁真珍珠',
    postTime : '2022/10/10 15:15:15',
    postText : '武大的同学们你们好，我是丁真珍珠。疫情期间，请大家出示自己的健康码，让我测一测你们的码。谢谢同学们的配合，我随后会为大家送上我最新代言的锐克五代电子烟。',
    commentData : [
      {
        replyerName : '武大王源',
        replyerAvartar : '/images/WHU_logo.png',
        replyTime : '2022/10/10 15:15:15',
        replyContent : '感觉不如传统香烟。。。好抽'
      },
      {
        replyerName : '武大柯洁',
        replyerAvartar : '/images/WHU_logo.png',
        replyTime : '2022/10/10 15:15:15',
        replyContent : '弈！悟！'
      },
      {
        replyerName : '武大otto',
        replyerAvartar : '/images/WHU_logo.png',
        replyTime : '2022/10/10 15:15:15',
        replyContent : '感觉不如口味王'
      },
      {
        replyerName : '武大孙笑川',
        replyerAvartar : '/images/WHU_logo.png',
        replyTime : '2022/10/10 15:15:15',
        replyContent : '凭什么测我的码？测测你的！'
      },
      {
        replyerName : '武大若',
        replyerAvartar : '/images/WHU_logo.png',
        replyTime : '2022/10/10 15:15:15',
        replyContent : '卧槽，bin！'
      },
      {
        replyerName : 'csf',
        replyerAvartar : '/images/WHU_logo.png',
        replyTime : '2022/10/10 15:15:15',
        replyContent : '1！5！'
      },
      {
        replyerName : 'lzx',
        replyerAvartar : '/images/WHU_logo.png',
        replyTime : '2022/10/10 15:15:15',
        replyContent : '?'
      }
    ],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  /**
   * 捕获评论输入值 
   */
  captureComment(e){
    let content = e.detail.value;
    console.log("要发布的评论是"+content);
    this.setData({
      commentContent : content
    })
  },

  /**
   * 发布评论 
   */
  postComment(e){
    console.log("发布评论"+this.data.commentContent);
    //TODO:将评论内容上传到数据库



    //弹窗确认并且清零输入框
    wx.showModal({
      content: '评论发布成功',
      title: '提示',
      showCancel : false,
      success: (result) => {},
      fail: (res) => {},
      complete: (res) => {},
    })
    this.setData({
      commentContent : ''
    })
  }
})