const db = wx.cloud.database()
const utils = require('../../utils/utils')
const valid = require('../../utils/valid');

// pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    listData: [
      {
        title: '订单',
        type: 'dy'
      },
      {
        title: '卡卷包',
        type: 'kjb'
      },
      {
        title: '积分商城',
        type: 'jfsc'
      },
      {
        title: '消息中心',
        type: 'xxzx'
      },
      {
        title: '关注公众号',
        type: 'gzgzh'
      },
      {
        title: '客服中心',
        type: 'kfzx'
      },
      {
        title: '门店查询',
        type: 'mdcx'
      },
    ],
    // 当前登录用户信息
    curLoginInfo: {
      phone: '',
      imgUrl: ''
    },
    userId: '',
    isLogin: false
  },

  // 请先登录
  toLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 退出登录
  async clickSelect(e) {
    let curThis = this;
    let type = e.currentTarget.dataset.type;

    this.data.userId = wx.getStorageSync('userId');
    this.data.isLogin = Boolean(this.data.userId);
    this.setData({
      userId: this.data.userId,
      isLogin: this.data.isLogin
    })

    // 判断用户是否登录
    if (!this.data.isLogin) {
      wx.showToast({
        title: '您还未登录',
        icon: "error",
      })
      return
    }

    // 我的订单
    if (type === 'dy') {
      wx.navigateTo({
        url: '../allOrder/allOrder',
      })
    }

    // 退出登录
    if (type === 'tcdl') {
      wx.showModal({
        title: '确定退出登录？',
        content: '',
        success(res) {
          if (res.confirm) {
            // console.log('用户点击确定')
            curThis.setData({
              curLoginInfo: {}
            })
            let l = curThis.data.listData.pop();
            // 删除退出登录按钮
            curThis.setData({
              listData: curThis.data.listData
            })

            // 清空所有本地存储数据
            wx.clearStorageSync();

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
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

    // console.log('this.data.userId', this.data.userId);
    // console.log('this.data.isLogin', this.data.isLogin);

    if (!this.data.isLogin) {
      return
    } else {
      let tcdl = {
        title: '退出登录',
        type: 'tcdl'
      }
      // 添加退出登录按钮
      if (this.data.listData.length === 7) {
        this.data.listData.push(tcdl);
        this.setData({
          listData: this.data.listData
        })
      }
    }

    // 获取当前登录的用户
    let cur = await utils.getCurLoginInfo(this.data.userId)
    // console.log('当前登录用户的信息', cur);

    this.data.curLoginInfo.phone = cur.phone;
    this.data.curLoginInfo.imgUrl = cur.imgUrl;
    this.setData({
      curLoginInfo: this.data.curLoginInfo,
    })

    console.log('this.data.curLoginInfo', this.data.curLoginInfo);
  },
})