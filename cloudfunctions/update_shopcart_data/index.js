// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  // console.log('event.id', event.id);
  // console.log('event.userId', event.userId);
  // console.log('event.count', event.count);

  // 已有菜单 更新菜单的数量
  return db.collection('food_menu_shopcart').where({
    id: event.id,
    userId: event.userId
  }).update({
    data: {
      count: event.count
    }
  })

}