// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar: '',
    showPic: false,

    // 验证登录
    LoginUserInfo: {
      phone: '',
      password: ''
    },
    isOpenPassword: false
  },
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      // 类型
      sizeType: ['image'],
      // 来源
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles;
        console.log(tempFiles[0]);
        this.setData({
          // 将图片数据放入数组
          avatar: tempFiles[0].tempFilePath,
          showPic: true
        });
      }
    })
  },

  // 是否显示密码
  showPassword() {
    this.setData({
      isOpenPassword: !this.data.isOpenPassword
    })
  },

  register(e) {
    const userLoginMsg = e.detail.value;
    userLoginMsg.imgUrl = this.data.avatar;

    // 手机校验
    let phoneReg = /^1[3-9]\d{9}$/g;
    if (!phoneReg.test(userLoginMsg.phone)) {
      wx.showToast({
        title: '手机格式错误',
        icon: 'error',
        duration: 800
      })
      return;
    }
    // 密码校验
    const passwordPattern = /^[A-Za-z]\w{5,15}$/;
    if (!passwordPattern.test(userLoginMsg.password)) {
      wx.showToast({
        title: '密码格式错误',
        icon: 'error',
        duration: 800
      })
      return;
    }

    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 登录/注册
    wx.cloud.callFunction({
      name: 'login',
      data: {
        ...userLoginMsg
      }
    }).then(res => {
      wx.hideLoading('res.result.code', res.result.code);
      if (res.result.code == 1) {
        // console.log('res.result', res.result);
        // 保存 token 和 userId 到本地
        let token = res.result.token;
        let userId = res.result.userId;
        wx.setStorageSync('token', token);
        wx.setStorageSync('userId', userId);

        wx.showToast({
          title: res.result.msg,
          icon: 'success',
          duration: 800
        })
        setTimeout(() => {
          console.log('登录成功，转到菜单页面');
          wx.switchTab({
            url: '/pages/menu/menu'
          })
        }, 800)
        // 清空表单数据
        this.setData({
          LoginUserInfo: {
            phone: '',
            password: ''
          },
        })
        // wx.reLaunch({
        //   url: '../my/my',
        // })

      } else {
        wx.showToast({
          title: res.result.msg,
          icon: 'error',
          duration: 800
        })
        this.data.LoginUserInfo.password = '';
        this.setData({
          LoginUserInfo: this.data.LoginUserInfo
        })
      }
    }).catch(err => {
      console.log('err', err);
    })

  },

})