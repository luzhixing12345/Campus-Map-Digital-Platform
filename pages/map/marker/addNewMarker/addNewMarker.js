const app = getApp();

Page({

  data: {
    facultyArray: ['文理学部', '工学部', '信息学部'],
    facultyIndex: 0,
    typeArray: ['办事', '学习', '餐饮', '通知', '群组'],
    typeArray_en: ['work', 'learning', 'food', 'notify', 'group'],
    typeIndex: 0,


    countPic : 9, // 最多9图
    showImgUrl: "",
    uploadImgUrl: '',
  },

  onLoad: function (options) {
    var that = this;
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('position', function (data) {
      that.setData({
        position : data
      })
    })
  },
  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    const db = wx.cloud.database();
    //TODO:实现表单数据的提交
    var that = this;
    var markerName = e.detail.value.name;
    if (typeof markerName == "undefined" || markerName == null || markerName == "") {
      wx.showModal({
        content: '提交失败：请输入地名！',
        title: '提示',
        showCancel: false,
        success: (result) => {},
        fail: (res) => {},
        complete: (res) => {},
      })
      return;
    }
    db.collection('marker').add({
      data: {
        faculty: that.data.facultyArray[e.detail.value.faculty],
        name: e.detail.value.name,
        type: that.data.typeArray_en[e.detail.value.type],
        position: db.Geo.Point(that.data.position.longitude, that.data.position.latitude),
        visiable: true,
      },
      success: (res) => {
        console.log(res);
        console.log("创建成功");
      }
    })


    //提交后显示弹窗
    wx.showModal({
      content: '提交成功',
      title: '提示',
      showCancel: false,
      success: (result) => {
        if (result.confirm) {
          wx.navigateBack({
            delta: 0,
            success: (res) => {},
            fail: (res) => {},
            complete: (res) => {},
          })
        }
      },
      fail: (res) => {},
      complete: (res) => {},
    })

  },

  bindFacultyChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      facultyIndex: e.detail.value
    })
  },

  bindTypeChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      typeIndex: e.detail.value
    })
  },


  myEventListener: function (e) {
    console.log("上传的图片结果集合")
    console.log(e.detail.picsList)
    this.setData({
      picList: e.detail.picsList
    })
  },

  uploadimg: function () {
    var that = this;
    wx.chooseImage({ //从本地相册选择图片或使用相机拍照
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        //将图片变为base64编码
        // if (res.tempFilePaths[0].length <= 600) {
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePaths[0], //选择图片返回的相对路径
          encoding: 'base64', //编码格式
          success: res1 => {
            //成功的回调
            if (res1.data.length > 500000) {
              wx.showModal({
                title: "图片太大", // 提示的标题
                content: "您上传的图片超过600KB，本站暂时未有自动压缩功能，可以自行发QQ或截屏，来进行人工压缩，感谢您的配合！",
                showCancel: true, // 是否显示取消按钮，默认true
                cancelColor: "#000000", // 取消按钮的文字颜色，必须是16进制格式的颜色字符串
                confirmText: "确定", // 确认按钮的文字，最多4个字符
                confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
              })
            } else {
              var base64Image = res1.data.replace(/[\r\n]/g, '') // 后台返回的base64数据
              var imgData = base64Image.replace(/[\r\n]/g, '') // 将回车换行换为空字符''
              that.setData({
                imageBase64: imgData,
                //前台显示
                img: res.tempFilePaths
              })
            }
          }
        })
      }
    })
  },

})