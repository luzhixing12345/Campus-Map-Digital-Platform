
const app = getApp();

Page({

    data: {
        
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
})