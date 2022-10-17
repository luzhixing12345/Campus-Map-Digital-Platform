const app = getApp();

Page({

  data: {

    time : 0,
    name : "",

    facultyArray: [['文理学部', '工学部', '信息学部']],
    faculty : "文理学部",
    close_faculty_picker : false,
    show_faculty_picker : false,

    typeArray: [['办事', '学习', '餐饮', '通知', '群组']],
    typeArray_en: ['work', 'learning', 'food', 'notify', 'group'],
    type : "办事",
    close_type_picker : false,
    show_type_picker : false,

    countPic : 9, // 最多9图
    showImgUrl: "",
    uploadImgUrl: '',
    picList : [],
  },

  onLoad: function (options) {
    var that = this;
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('position', function (data) {
      that.setData({
        position : data.position
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

  selectFaculty() { 
    if (this.data.close_faculty_picker) return;
    if (!this.data.show_faculty_picker) {
      this.setData({
        show_faculty_picker : true
      })
    }
  },

  async comfirmFaculty(e) {
    // console.log("call confirm")
    this.setData({
      show_faculty_picker : false,
      faculty: e.detail.choosedData
    })
    await this.setData({
      close_faculty_picker : true
    })
  },

  async comfirmType(e) {
    this.setData({
      show_type_picker : false,
      type: e.detail.choosedData
    })
    await this.setData({
      close_type_picker : true
    })
  },

  async cancelFaculty(e) {
    this.setData({
      show_faculty_picker : false
    })
    await this.setData({
      close_faculty_picker : true
    })
  },

  async cancelType(e) {
    this.setData({
      show_type_picker : false
    })
    await this.setData({
      close_type_picker : true
    })
  },

  selectType() {
    if (this.data.close_type_picker) return;
    if (!this.data.show_type_picker) {
      this.setData({
        show_type_picker : true
      })
    }
  },

  captureName(e) {
    var name = e.detail.value;
    this.setData({
      name : name
    })
  },

  // 页面防抖
  handleInput(e) {
    clearTimeout(this.data.time)
    var that = this;
    this.data.time = setTimeout(() => {
      that.setDescription(e.detail.value)
    }, 1000)
  },

  setDescription(value) {
    this.setData({
      description: value
    })
  },

  submitButton() {

    if (this.data.picList.length == 0) {
      wx.showModal({
        title: "温馨提示", // 提示的标题
        content: "请至少添加一张描述图片", // 提示的内容
        showCancel: false, // 是否显示取消按钮，默认true
        confirmText: "确定", // 确认按钮的文字，最多4个字符
        confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
      })
      return;
    }
    if (this.data.name.trim() == '') {
      wx.showModal({
        title: "温馨提示", // 提示的标题
        content: "地点名称不能为空", // 提示的内容
        showCancel: false, // 是否显示取消按钮，默认true
        confirmText: "确定", // 确认按钮的文字，最多4个字符
        confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
      })
      return;
    }
    if (this.data.description.trim() == '') {
      wx.showModal({
        title: "温馨提示", // 提示的标题
        content: "请添加相关的描述信息", // 提示的内容
        showCancel: false, // 是否显示取消按钮，默认true
        confirmText: "确定", // 确认按钮的文字，最多4个字符
        confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
      })
      return;
    }

    // console.log(this.data.name)
    // console.log(this.data.description)
    // console.log(this.data.type)
    // console.log(this.data.faculty)
    // console.log(this.data.picList)
    var that = this;
    wx.cloud.database().collection("marker").add({
      data : {
        name : that.data.name.trim(),
        faculty : that.data.faculty,
        type : that.data.typeArray_en[that.data.typeArray[0].indexOf(that.data.type)],
        description : that.data.description.trim(),
        like : 0,
        collection : 0,
        comment : 0,
        picturesUrl : that.data.picList,
        creator : app.globalData.userInfo.nickName,
        position : that.data.position,
        visiable : true
      },
      success(res) {
        console.log(res);
        wx.showModal({
          title: "温馨提示", // 提示的标题
          content: "上传成功", // 提示的内容
          showCancel: false, // 是否显示取消按钮，默认true
          confirmText: "确定", // 确认按钮的文字，最多4个字符
          confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
          success(r) {
            if (r.confirm) {
              wx.navigateBack({
                delta: 1,
              })
            }
          }
        })

      }
    })
  },

})