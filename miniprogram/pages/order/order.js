const utils = require('../../utils/utils.js');


// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    alreadyPayData: [],
    userId: '',
    isLogin: '',
    showComment: false,
    starValue: 0,
    comContent: '',
    curLoginInfo: {
      phone: '',
      imgUrl: ''
    },
  },

  // 获取当前用户的待付款数据
  async getAlreadyPayData() {
    return new Promise((resolve, reject) => {
      // 获取当前用户的购物车数据
      wx.cloud.callFunction({
        name: 'get_already_pay',
        data: {
          userId: this.data.userId
        }
      }).then(res => {
        // console.log('待付款数据', res);
        this.setData({
          alreadyPayData: [...res.result.data]
        });
        resolve(); // 成功时调用 resolve
      }).catch(err => {
        console.log('err', err);
        reject(err); // 失败时调用 reject
      });
    });
  },

  // 点击立即评论 弹出弹窗
  comment(event) {
    this.setData({ showComment: true });
  },

  // 输入评价
  commentIpt(event) {
    let c = event.detail.value;
    this.setData({
      comContent: c
    })
  },

  // 关闭
  onClose() {
    this.setData({ showComment: false });
  },

  // 改变星星数量
  onChangeStar(event) {
    this.setData({
      starValue: event.detail,
    });
  },

  // 提交评价
  async upComment() {
    wx.showLoading({
      title: '提交中...',
    })

    // 存入数据库
    await wx.cloud.callFunction({
      name: 'add_comment',
      data: {
        userId: this.data.userId,
        imgUrl: this.data.curLoginInfo.imgUrl,
        phone: this.data.curLoginInfo.phone,
        starValue: this.data.starValue,
        comContent: this.data.comContent
      }
    }).then(res => {
      wx.hideLoading()
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 800
      })

      console.log('添加 res', res);
      // 跳转到评论页面
      setTimeout(() => {
        wx.navigateTo({
          url: '../comment/comment',
        })

        this.setData({
          starValue: 0,
          comContent: '',
          showComment: false
        })

      }, 800)

    }).catch(err => {
      wx.hideLoading()
      console.log('添加 err', err);
    })

  },

  // 监听页面显示
  async onShow() {
    wx.showLoading({
      title: "加载中..."
    })

    this.data.userId = wx.getStorageSync('userId');
    this.data.isLogin = Boolean(this.data.userId);
    this.setData({
      userId: this.data.userId,
      isLogin: this.data.isLogin
    })

    if (!this.data.isLogin) {
      wx.hideLoading();
      return
    }

    // 获取当前登录的用户
    let cur = await utils.getCurLoginInfo(this.data.userId)

    this.data.curLoginInfo.phone = cur.phone;
    this.data.curLoginInfo.imgUrl = cur.imgUrl;
    this.setData({
      curLoginInfo: this.data.curLoginInfo
    })

    // 获取订单数据
    this.getAlreadyPayData().then(() => {
      wx.hideLoading();
      console.log(this.data.alreadyPayData);


    }).catch(err => {
      console.log('err', err);
    })

  }
})