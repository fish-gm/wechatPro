// pages/comeUpSoon/comeUpSoon.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jjsxData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showLoading({
      title:'加载中...'
    })

    this.getjjsxData().then(() => {
      wx.hideLoading()
      console.log('this.data.jjsxData', this.data.jjsxData);
    }).catch(err => {
      wx.hideLoading()
      console.log('err => ', err);
    })
  },

  // 获取即将上新数据
  async getjjsxData() {
    return new Promise((resolve, reject) => {
      // 获取当前用户的购物车数据
      wx.cloud.callFunction({
        name: 'get_come_up',
      }).then(res => {
        // console.log('数据', res);
        this.setData({
          jjsxData: [...res.result.data]
        });
        resolve(); // 成功时调用 resolve
      }).catch(err => {
        console.log('err', err);
        reject(err); // 失败时调用 reject
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

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