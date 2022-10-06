const cloud = require('wx-server-sdk');

cloud.init({env:cloud.DYNAMIC_CURRENT_ENV});

exports.main = async(even,context) => {
  const db = cloud.database();
  //获取数据的总个数
  let count = await db.collection('marker').where({visiable:true}).count()
  count = count.total;
  console.log("长度为"+count);
  //通过for循环做多次请求，并把多次请求的数据放到一个数组
  let all = []
  for (let i = 0;i < count;i += 100) {
    let list = await db.collection('marker').where({
      visiable:true
    }).skip(i).get();
    all = all.concat(list.data);
  }
  //把组装好的数据一次性返回
  return all;
}