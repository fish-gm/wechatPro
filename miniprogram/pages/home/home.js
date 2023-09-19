const utils = require('../../utils/utils.js');
const valid = require('../../utils/valid');

// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeData: [
      {
        title: '即将上新',
        icon: 'cloud://cloud1-7guvebew67fef0e5.636c-cloud1-7guvebew67fef0e5-1320647370/food_home_type/关注.svg',
        type: 'jjsx'
      },
      {
        title: '笔记',
        icon: 'cloud://cloud1-7guvebew67fef0e5.636c-cloud1-7guvebew67fef0e5-1320647370/food_home_type/笔记.svg',
        type: 'bj'
      },
      {
        title: '视频',
        icon: 'cloud://cloud1-7guvebew67fef0e5.636c-cloud1-7guvebew67fef0e5-1320647370/food_home_type/视频.svg',
        type: 'sp'
      },
      {
        title: '活动',
        icon: 'cloud://cloud1-7guvebew67fef0e5.636c-cloud1-7guvebew67fef0e5-1320647370/food_home_type/活动.svg',
        type: 'hd'
      },
    ],

    userId: '',
    curLoginInfo: {
      phone: '',
      imgUrl: ''
    },
    isLogin: false
  },

  // 到店取餐
  toOrder() {
    if (this.data.isLogin) {
      console.log('用户已经登录');
      wx.switchTab({
        url: '/pages/menu/menu'
      })
    }
    // 用户未登录
    else {
      console.log('转到登录界面');
      wx.showLoading({
        title: '请先登录',
        mask: true,
      })
      setTimeout(() => {
        // 跳转到登录页面
        wx.navigateTo({
          url: '../login/login'
        })
        wx.hideLoading();
      }, 1000)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    this.data.userId = wx.getStorageSync('userId');
    this.data.isLogin = Boolean(this.data.userId);
    this.setData({
      userId: this.data.userId,
      isLogin: this.data.isLogin
    })

    wx.showLoading({
      title: '加载中...',
      mask: 'true'
    })

    if (!this.data.isLogin) {
      wx.hideLoading();
      return
    }

    // 获取当前登录的用户
    let cur = await utils.getCurLoginInfo(this.data.userId)
    wx.hideLoading();

    this.data.curLoginInfo.phone = cur.phone;
    this.data.curLoginInfo.imgUrl = cur.imgUrl;
    this.setData({
      curLoginInfo: this.data.curLoginInfo,
      userId: this.data.userId
    })
  },

  // 点击类型
  clickType(e) {
    let type = e.currentTarget.dataset.type;
    // 即将上新
    if (type === 'jjsx') {
      wx.navigateTo({
        url: '../comeUpSoon/comeUpSoon',
      })
    }

    // 用户点评
    // if (type === 'yhdp') {
      // wx.navigateTo({
      //   url: '../comment/comment',
      // })
    // }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.hideLoading();
  },
})