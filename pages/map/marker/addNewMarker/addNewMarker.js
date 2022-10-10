
const app = getApp();

Page({

    data: {
        facultyArray : ['文理学部','工学部','信息学部'],
        facultyIndex : 0,

        typeArray : ['办事','学习','餐饮','通知','群组'],
        typeIndex : 0,
    },

    onLoad: function (options) {
        var that = this;
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.on('position', function(data) {
            console.log(data);
            that.setData({
                position : data
            })
          })
    },
    formSubmit(e) {
        console.log('form发生了submit事件，携带数据为：', e.detail.value)

        //TODO:实现表单数据的提交



        //提交后显示弹窗
        wx.showModal({
            content: '提交成功',
            title: '提示',
            showCancel : false,
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

    bindFacultyChange(e){
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            facultyIndex: e.detail.value
        })
    },

    bindTypeChange(e){
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            typeIndex: e.detail.value
        })
    }
})