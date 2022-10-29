// pages/group/replyToMe/replyToOthers/replyToOthers.js
var timeUtil = require('../../../utils/time')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  updateComment(){
    const db = wx.cloud.database();
    var that = this;
    db.collection('comment').doc(this.data.commentId).get({
      success:(res)=>{
        var cmtctt = res.data.content;
        var cmtusravt = res.data.userInfo.avatarUrl;
        var cmtusrnam = res.data.userInfo.nickName;
        var cmtusrid = res.data.userInfo._openid;
        var cmttim = timeUtil.displayRelativeTime(res.data.time);
        var cmtlike = res.data.like;
        var cmtdislike = res.data.dislike;
        var cmtcfc = res.data.cfc;
        var tempList = [];
        for(var i = 0; i < cmtcfc.length; ++i){
          var temp = {};
          temp.avatarUrl = cmtcfc[i].userInfo.avatarUrl;
          temp.nickName = cmtcfc[i].userInfo.nickName;
          temp.time = timeUtil.displayRelativeTime(cmtcfc[i].time);
          temp.content = cmtcfc[i].content;
          temp.like = cmtcfc[i].like;
          temp.dislike = cmtcfc[i].dislike;
          temp.index = i;
          temp.isLiked = false;
          tempList.push(temp);
        }
        that.setData({
          commentContent : cmtctt,
          commentUserAvatarUrl : cmtusravt,
          commentUserName : cmtusrnam,
          commentUserId : cmtusrid,
          commentTime : cmttim,
          commentLike : cmtlike,
          commentDislike : cmtdislike,
          commentCfcList : tempList,
        })
      },
      fail:(res)=>{
        console.log('查询失败');
        console.log(res);
      }, 
    });

    db.collection('like').where({
      _openid : app.globalData.userInfo._openid,
      'post.postType' : 'cmt',
      'post.postId' : that.data.commentId
    }).count().then((res)=>{
      if(res.total==0){
        that.setData({
          commentIsLiked : false,
        })
      }
      else if(res.total>0){
        that.setData({
          commentIsLiked : true,
        })
      }
    });

    db.collection('like').where({
      _openid :app.globalData.userInfo._openid,
      'post.postId' : that.data.commentId,
      'post.postType' : 'cfc',
    }).get({
      success:(res)=>{
        var resList = res.data;
        for(var i=0; i<resList.length; ++i){
          var cfcIndex = resList[i].post.postIndex;
          that.setData({
            ['commentCfcList['+cfcIndex+'].isLiked'] : true,
          })
        }
      },//实际测试，这里有一定的更新延迟，后面应当要解决这个问题
      fail:(res)=>{
        console.log(res);
      }
    })
  },
  onLoad:function(options){
    var that = this;
    const eC = this.getOpenerEventChannel();
    eC.on('acceptDataFromReplyToMe',function(data){
      that.setData({
        commentId : data.commentId,
      });
    })
    this.updateComment();
    
    
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
      yourCommentContent : content
    })
  },

  /**
   * 发布评论 
   */
  postComment(e){
    console.log("发布评论"+this.data.yourCommentContent);
    //TODO:将评论内容上传到数据库
    const db = wx.cloud.database();
    const _ = db.command;
    
    var temp = {};
    temp.content = this.data.yourCommentContent;
    temp.dislike = 0;
    temp.like = 0;
    temp.time = new Date();
    temp.userInfo = app.globalData.userInfo;

    var that = this;
    db.collection('comment').doc(this.data.commentId).update({
      data : {
        cfc : _.push(temp)
      },
      success:(res)=>{
        console.log('查询成功');
        that.updateComment();
      },
      fail:()=>{
        console.log('查询失败');
      }
    })
    this.setData({
      yourCommentContent : ''
    })
  },
  cmtTapLike(e){
    console.log('cmtlike');
    const db = wx.cloud.database();
    const  _ = db.command;
    var that = this;
    db.collection('comment').doc(this.data.commentId).update({
      data:{
        like : _.inc(1)
      },
      success:(res)=>{
        console.log('更新成功');
        that.setData({
          commentLike : that.data.commentLike + 1,
          commentIsLiked : !that.data.commentIsLiked,
        })
      },
      fail:()=>{
        console.log('更新失败');
      },
    })

    //post 赋值
    var temp = {};
    temp.postType = 'cmt';
    temp.postId = that.data.commentId;
    temp.postIndex = 0;
    temp.postContent = (that.data.commentContent.length>10)?(that.data.commentContent.substring(0,10)+'...'):that.data.commentContent;

    db.collection('like').add({
      data : {
        originUserid : that.data.commentUserId,
        time : new Date(),
        post : temp,
        isChecked : false,
        userInfo : app.globalData.userInfo,
      },
      success:(res)=>{
        console.log('db add success');
      },
      fail:()=>{
        console.log('db add success');
      },
    })
    // this.updateComment();
  },
  cmtTapLiked(e){
    //TODO:减少数值，并且like减1
    console.log('cmt liked');
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    db.collection('comment').doc(this.data.commentId).update({
      data:{
        like : _.inc(-1),
      },
      success:(res)=>{
        that.setData({
          commentLike : that.data.commentLike - 1,
          commentIsLiked : !that.data.commentIsLiked,
        })
      },
      fail:(res)=>{
        console.log(res);  
      },
    })
    // this.updateComment();
  },
  cmtTapDislike(e){
    const db = wx.cloud.database();
    const  _ = db.command;
    var that = this;
    db.collection('comment').doc(this.data.commentId).update({
      data:{
        dislike : _.inc(1)
      },
      success:(res)=>{
        console.log('更新成功');
        that.setData({
          commentDislike : that.data.commentDislike + 1,
        })
      },
      fail:()=>{
        console.log('更新失败');
      },
    })

  },
  cfcTapLike(e){
    console.log('cfclike');
    const db = wx.cloud.database();
    const  _ = db.command;
    var that = this;
    var index = e.currentTarget.dataset.index;
    var item = 'cfc.' + index + '.like';
    var array_item = 'commentCfcList['+index+'].like';
    var array_item_bool = 'commentCfcList['+index+'].isLiked';
    db.collection('comment').doc(this.data.commentId).update({
      data:{
         [item] : _.inc(1)
      },
      success:(res)=>{
        console.log('更新成功');
        that.setData({
          [array_item] : that.data.commentCfcList[index].like + 1,
          [array_item_bool] : !that.data.commentCfcList[index].isLiked,
        })
      },
      fail:()=>{
        console.log('更新失败');
      },
    })

    //post 赋值
    var temp = {};
    temp.postType = 'cfc';
    temp.postId = that.data.commentId;
    temp.postIndex = index;
    temp.postContent = (that.data.commentCfcList[index].content.length>10)?(that.data.commentCfcList[index].content.substring(0,10)+'...'):that.data.commentCfcList[index].content;

    db.collection('like').add({
      data : {
        originUserid : that.data.commentUserId,
        time : new Date(),
        post : temp,
        isChecked : false,
        userInfo : app.globalData.userInfo,
      },
      success:(res)=>{
        console.log('db add success');
      },
      fail:()=>{
        console.log('db add success');
      },
    })
    // this.updateComment();
  },
  cfcTapLiked(e){
    //TODO: like-1
    // console.log('cfc like-1');
    var index = e.currentTarget.dataset.index;
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    var array_item = 'commentCfcList['+index+'].like';
    var array_item_bool = 'commentCfcList['+index+'].isLiked';
    db.collection('comment').doc(this.data.commentId).update({
      data:{
        ['cfc.'+index+'.like'] : _.inc(-1),
      },
      success:(res)=>{
        that.setData({
          [array_item] : that.data.commentCfcList[index].like - 1,
          [array_item_bool] : !that.data.commentCfcList[index].isLiked,
        })
      },
      fail:(res)=>{
        console.log(res);  
      },
    })
    // this.updateComment();
  },
  cfcTapDislike(e){
    const db = wx.cloud.database();
    const  _ = db.command;
    var that = this;
    var index = e.currentTarget.dataset.index;
    var item = 'cfc.' + index + '.dislike';
    var array_item = 'commentCfcList['+index+'].dislike';
    db.collection('comment').doc(this.data.commentId).update({
      data:{
         [item] : _.inc(1)
      },
      success:(res)=>{
        console.log('更新成功');
        that.setData({
          [array_item] : that.data.commentCfcList[index].dislike + 1,
        })
      },
      fail:()=>{
        console.log('更新失败');
      },
    })
  }
})