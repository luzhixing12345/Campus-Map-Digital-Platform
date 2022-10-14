// component/uploadImages/index.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    count: { //最多选择图片的张数，默认9张
      type: Number,
      value: 9
    },
    uploadUrl: { //图片上传的服务器路径
      type: String,
      value: ''
    },
    showUrl: { //图片的拼接路径
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    detailPics: [], //上传的结果图片集合
  },


  /**
   * 组件的方法列表
   */
  methods: {

    uploadDetailImage: function (e) { //这里是选取图片的方法
      var that = this;
      var pics = [];
      var detailPics = that.data.detailPics;
      if (detailPics.length >= that.data.count) {
        wx.showToast({
          title: '最多选择' + that.data.count + '张！',
        })
        return;
      }
      wx.chooseImage({
        count: that.data.count, // 最多可以选择的图片张数，默认9
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
        success: function (res) {
          var imgs = res.tempFilePaths;
          for (var i = 0; i < imgs.length; i++) {
            pics.push(imgs[i])
          }
          that.uploadimg({
            url: that.data.uploadUrl, //这里是你图片上传的接口
            path: pics, //这里是选取的图片的地址数组
          });
        },
      })

    },

    basename: function (str) {
      var idx = str.lastIndexOf('/')
      idx = idx > -1 ? idx : str.lastIndexOf('\\')
      if (idx < 0) {
        return str
      }
      return str.substring(idx + 1);
    },

    //多张图片上传
    uploadimg: function (data) {
      wx.showLoading({
        title: '上传中...',
        mask: true,
      })
      var that = this,
        i = data.i ? data.i : 0,
        success = data.success ? data.success : 0,
        fail = data.fail ? data.fail : 0;


      wx.cloud.uploadFile({

        filePath: data.path[i],
        cloudPath: this.basename(data.path[i]),
        success: (resp) => {
          wx.hideLoading();
          success++;

          var str = resp.data //返回的结果，可能不同项目结果不一样
          // var pic = JSON.parse(str);
          var pic_name = resp.fileID;
          console.log(data.path[i]);

          var detailPics = that.data.detailPics;
          detailPics.push(pic_name)
          that.setData({
            detailPics: detailPics
          })
        },
        fail: (res) => {
          fail++;
          console.log('fail:' + i + "fail:" + fail);
        },
        complete: () => {
          i++;
          if (i == data.path.length) { //当图片传完时，停止调用     
            console.log('执行完毕');
            console.log('成功：' + success + " 失败：" + fail);
            var myEventDetail = {
              picsList: that.data.detailPics
            } // detail对象，提供给事件监听函数
            var myEventOption = {} // 触发事件的选项
            that.triggerEvent('myevent', myEventDetail, myEventOption)//结果返回调用的页面
          } else { //若图片还没有传完，则继续调用函数
            data.i = i;
            data.success = success;
            data.fail = fail;
            that.uploadimg(data);//递归，回调自己
          }
        }
      });
    },



  }
})