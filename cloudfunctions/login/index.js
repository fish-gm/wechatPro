// 云函数入口文件
const cloud = require('wx-server-sdk')
//引入md5模块
const md5 = require('md5');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {

  // 查询电话号码是否存在，如果存在则校验密码是否正确，如果不存在，则注册并登录成功
  // 根据电话号码查询用户数据
  let userData = await db.collection('food_user').where({
    phone: event.phone
  }).get();

  console.log('查询的用户数据', userData);

  //密码加盐 加密
  let salt = 'tye5';
  let password = md5(salt + event.password);

  //生成token
  let token = 'u' + Math.random().toString().slice(2) + new Date().getTime();

  // 如果长度为0 说明获取不到 用户没有注册
  if (userData.data.length === 0) {
    // 把用户的数据添加到 food_user 集合
    let user = await db.collection('food_user').add({
      data: {
        phone: event.phone,
        password,
        imgUrl: event.imgUrl
      }
    })
    if (user._id) {
      // 注册成功
      console.log('注册成功');
      let status = await db.collection('food_login_status').add({
        data: {
          user_id: user._id,
          token
        }
      })

      return {
        msg: '注册并登录成功',
        userId: user._id,
        token,
        code: 1
      }

    }
    else {
      return {
        msg: '注册失败',
        code: 0
      }
    }
  }
  // 校验密码
  else {
    if (password === userData.data[0].password) {
      // await db.collection('food_login_status').add({
      //   data: {
      //     user_id: userData.data[0]._id,
      //     token
      //   }
      // })

      // 更新 token 值
      let d = await db.collection('food_login_status').where({
        user_id: userData.data[0]._id,
      }).update({
        data: {
          token
        }
      })

      return {
        msg: '登录成功',
        userId: userData.data[0]._id,
        token,
        code: 1
      }

    } else {
      console.log('不相等');
      return {
        msg: '密码错误',
        code: 0
      }
    }
  }
}