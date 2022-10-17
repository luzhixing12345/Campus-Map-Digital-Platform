// 用于判断地点坐标是否相同或者过于靠近

const latitude_distance = 0.00020882330516158731;
const longitude_distance = 0.00016163343116204487;

function checkMarkerDistance(all_markers,new_marker) {
  for (var i=0; i<all_markers.length;i++) {
    if ( Math.abs(all_markers[i].latitude-new_marker.latitude)<=latitude_distance
      && Math.abs(all_markers[i].longitude-new_marker.longitude)<=longitude_distance
    ) return false;
  }
  return true;
}


module.exports = {
  checkMarkerDistance: checkMarkerDistance
}