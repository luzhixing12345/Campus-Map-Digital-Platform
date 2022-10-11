
const app = getApp();

Page({

    data: {
        facultyArray : ['文理学部','工学部','信息学部'],
        facultyIndex : 0,

        typeArray : ['办事','学习','餐饮','通知','群组'],
        typeArray_en : ['work','learning','food','notify','group'],
        typeIndex : 0,
    },

    onLoad: function (options) {
        var that = this;
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.on('position', function(data) {
            //查重，确保同一组经纬度不会重叠
            const db = wx.cloud.database();
            db.collection('marker').where({
                position : db.Geo.Point(data.longitude,data.latitude)
            }).get({
                success : (res)=>{
                    //不存在经纬度相同的地点
                    if(res.data.length == 0){
                        console.log(data);
                        that.setData({
                            position : data
                        })
                    }
                    //存在经纬度相同的地点
                    else{
                        wx.showModal({
                            content: '该地点已被标记',
                            title: '提示',
                            showCancel : false,
                            success: (result) => {},
                            fail: (res) => {},
                            complete: (res) => {},
                        })
                    }
                },
                fail : (res) =>{
                    console.log("查询失败");
                }
            })
            
            
          })
    },
    formSubmit(e) {
        console.log('form发生了submit事件，携带数据为：', e.detail.value)
        const db = wx.cloud.database();
        //TODO:实现表单数据的提交
        var that = this;
        var markerName = e.detail.value.name;
        if(typeof markerName == "undefined" || markerName == null || markerName == ""){
            wx.showModal({
                content: '提交失败：请输入地名！',
                title: '提示',
                showCancel : false,
                success: (result) => {},
                fail: (res) => {},
                complete: (res) => {},
            })
            return;
        }
        db.collection('marker').add({
            data : {
                faculty : that.data.facultyArray[e.detail.value.faculty],
                name : e.detail.value.name,
                type : that.data.typeArray_en[e.detail.value.type],
                position : db.Geo.Point(that.data.position.longitude,that.data.position.latitude),
                visiable : true,
            },
            success:(res)=>{
                console.log(res);
                console.log("创建成功");
            }
        })


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