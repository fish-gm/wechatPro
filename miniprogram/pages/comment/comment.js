// pages/comment/comment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    commentData: [],
    userId: '',
    isLogin: false

  },

  // 获取评论数据
  async getCommentData() {
    return new Promise((resolve, reject) => {
      // 获取当前用户的购物车数据
      wx.cloud.callFunction({
        name: 'get_comment',
        data: {
          userId: this.data.userId
        }
      }).then(res => {
        // console.log('待付款数据', res);
        this.setData({
          commentData: [...res.result.data]
        });
        resolve(); // 成功时调用 resolve
      }).catch(err => {
        console.log('err', err);
        reject(err); // 失败时调用 reject
      });
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.setData({
      loading: false,
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
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

    // 获取评价数据
    this.getCommentData().then(() => {
      wx.hideLoading();
       console.log(this.data.commentData);
    }).catch(err => {
      wx.hideLoading();
      console.log('err', err);
    })

  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})