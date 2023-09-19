// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let userLoginStatus = await db.collection('food_login_status').where({
    user_id: event.userId,
    token: event.token
  }).get()

  if (userLoginStatus.data.length === 0) {
    return {
      msg: '请先登录',
      isLogin: false,
      code: 0
    }
  } else {
    return {
      isLogin: true,
      code: 1
    }
  }

}