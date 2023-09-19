// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  // 菜品加入购物车
  return db.collection('food_menu_shopcart').add({
    data: {
      userId: event.oneMenu.userId,
      a: event.oneMenu.a,
      collect_count_text: event.oneMenu.collect_count_text,
      collect_status: event.oneMenu.collect_status,
      collect_users: event.oneMenu.collect_users,
      count: event.oneMenu.count,
      events: event.oneMenu.events,
      fc: event.oneMenu.fc,
      gif: event.oneMenu.gif,
      id: event.oneMenu.id,
      img: event.oneMenu.img,
      n: event.oneMenu.n,
      p: event.oneMenu.p,
      ph: event.oneMenu.ph,
      price: event.oneMenu.price,
      pw: event.oneMenu.pw,
      recall: event.oneMenu.recall,
      stdname: event.oneMenu.stdname,
      title: event.oneMenu.title,
      trim_title: event.oneMenu.trim_title,
      type: event.oneMenu.type,
      vc: event.oneMenu.vc,
      vfurl: event.oneMenu.vfurl,
      vu: event.oneMenu.vu
    }
  })
}