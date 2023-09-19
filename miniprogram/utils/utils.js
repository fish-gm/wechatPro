// const userId = wx.getStorageSync('userId');
// const token = wx.getStorageSync('token');

// 获取当前登录的用户
async function getCurLoginInfo(userId) {
  // console.log('userId 765757',userId);
  let curLoginInfo = {
    phone: '',
    imgUrl: ''
  }
  await wx.cloud.callFunction({
    name: 'get_current_user',
    data: {
      userId
    }
  }).then(res => {
    res = res.result.data
    if (res.length != 0) {
      // 手机号码中间4位消掉
      var start = res[0].phone.slice(0, 3); // 取前3位
      var end = res[0].phone.slice(9); // 取后2位
      var middle = '******'; // 替代的6位数字
      res[0].phone = start + middle + end;

      curLoginInfo.phone = res[0].phone;
      curLoginInfo.imgUrl = res[0].imgUrl;
    }
  }).catch(err => {
    console.log('err', err);
  })

  return curLoginInfo;
}

// 获取数据库某个用户的全部菜单数据

// 清空数据库某个用户的全部菜单数据


module.exports = {
  getCurLoginInfo: getCurLoginInfo
}