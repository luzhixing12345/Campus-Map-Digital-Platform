
Page({

    data: {
    },

    onLoad(e){
        var markerLatitude = e.markerLatitude;
        var markerLongitude = e.markerLongitude;
        console.log("[" + markerLatitude +","+ markerLongitude + "]" );
        this.setData({
            latitude:markerLatitude,
            longitude:markerLongitude
        })
    }

})