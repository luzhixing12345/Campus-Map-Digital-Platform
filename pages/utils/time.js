
// 用于处理时间相关的函数

function formatTime(date) {
  return {
    year : date.getFullYear(),
    month : date.getMonth() + 1,
    day : date.getDate(),
    hour : date.getHours(),
    minute : date.getMinutes(),
    second : date.getSeconds()
  }
}

// 展示相对现在的时间
function displayRelativeTime(d) {
  var date = formatTime(d);
  var current_date = formatTime(new Date());
  // 同一天之内
  if (current_date.year == date.year 
    && current_date.month == date.month 
    && current_date.day == date.day) {
      if (current_date.hour == date.hour) {
        if (current_date.minute == date.minute) {
          return "1分钟前";
        } else {
          return (current_date.minute - date.minute).toString() + "分钟前";
        }
      } else {
        return (current_date.hour - date.hour).toString() + "小时前";
      }
    }
  else {
    if (current_date.year != date.year || current_date.month != date.month) {
      return date.year.toString() + "年" + date.month.toString() + "月" + date.day.toString() + "日";
    } else {
      if (current_date.day - date.day <= 5) {
        return (current_date.day - date.day).toString() + "日前";
      } else {
        return date.year.toString() + "年" + date.month.toString() + "月" + date.day.toString() + "日";
      }
    }
  }
}
 
module.exports = {
  formatTime: formatTime,
  displayRelativeTime : displayRelativeTime
}