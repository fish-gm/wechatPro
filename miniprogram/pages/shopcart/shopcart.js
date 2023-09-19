const valid = require('../../utils/valid')
const db = wx.cloud.database()
const collection = db.collection('food_menu_shopcart');

// pages/shopcart/shopcart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopcartData: [],
    userId: '',
    isLogin: false,
    totalCount: 0,
    totalPrice: 0
  },

  // 改变购物车数量
  changeCount(event) {
    console.log('event.detail', event.detail);
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    let count = event.detail;
    // 菜谱id
    let id = event.currentTarget.dataset.id;

    console.log('count', count);
    console.log('id', id);

    // 获取当前用户购物车的数据
    this.getCurShopcartData().then(() => {
      // console.log('改变数量后购物车的数据111', this.data.shopcartData);

      // 通过菜品id获得菜品信息
      wx.cloud.callFunction({
        name: 'get_one_menu',
        data: {
          id
        }
      }).then(res => {
        let isUpdate = false;

        for (let i = 0; i < this.data.shopcartData.length; i++) {
          // 如果存在id 则更新数据
          if (this.data.shopcartData[i].id === id) {
            console.log('更新');
            isUpdate = true;
            // 数量为 0 删除菜品
            if (count == 0) {
              this.data.shopcartData.splice(i, 1);
              this.setData({
                shopcartData: this.data.shopcartData
              })
              // 数据库删除菜品
              wx.cloud.callFunction({
                name: 'del_shopcart_data',
                data: {
                  id,
                  userId: this.data.userId,
                }
              }).then(res => {
                wx.hideLoading()

                wx.showToast({
                  icon: 'success',
                  duration: 800
                })

                console.log('数据库删除菜品 res', res);
              }).catch(err => {
                wx.hideLoading()
                console.log('数据库删除菜品 err', err);
              })

              console.log('this.data.shopcartData', this.data.shopcartData);


            } else {
              this.data.shopcartData[i].count = count;
              this.setData({
                shopcartData: this.data.shopcartData
              })
              // 更新数量
              wx.cloud.callFunction({
                name: 'update_shopcart_data',
                data: {
                  id,
                  userId: this.data.userId,
                  count,
                }
              }).then(res => {
                wx.hideLoading()
                wx.showToast({
                  icon: 'success',
                  duration: 800
                })
                console.log('更新数量 res', res);
              }).catch(err => {
                wx.hideLoading()
                console.log('更新数量 err', err);
              })
            }

            break;
          }
        }
        // console.log('this.data.shopcartData', this.data.shopcartData);

        // 购物车里没有对应的菜品，则添加
        if (!isUpdate) {
          console.log('添加');
          let oneMenu = res.result.data[0];
          // 更新数量 加入用户id
          oneMenu.count = count;
          oneMenu.userId = this.data.userId;

          wx.cloud.callFunction({
            name: 'add_shopcart_data',
            data: {
              id,
              userId: this.data.userId,
              oneMenu
            }
          }).then(res => {
            wx.hideLoading()
            wx.showToast({
              icon: 'success',
              duration: 800
            })
            console.log('添加 res', res);
          }).catch(err => {
            wx.hideLoading()
            console.log('添加 err', err);
          })
        }

        console.log('改变数量后购物车的数据222', this.data.shopcartData);
        // console.log('获取的菜品信息', res.result.data[0]);

        // 改变购物车的总数量和总价格
        this.data.totalCount = 0;
        this.data.totalPrice = 0;
        for (let i = 0; i < this.data.shopcartData.length; i++) {
          this.data.totalCount += this.data.shopcartData[i].count;
          this.data.totalPrice += Number(this.data.shopcartData[i].count) * Number(this.data.shopcartData[i].price);
        }

        this.setData({
          totalCount: this.data.totalCount,
          totalPrice: this.data.totalPrice
        })

      }).catch(err => {
        console.log('err', err);
      })

    }).catch(err => {
      console.log('err', err);
    })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.data.userId = wx.getStorageSync('userId');
    this.setData({
      isLogin: Boolean(this.data.userId),
      userId: this.data.userId
    })
    // 用户已登录
    if (this.data.userId) {
      //保存记账数据
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
    } else {
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

    // 获取当前用户的购物车数据
    this.getCurShopcartData().then(() => {
      wx.hideLoading();
      console.log('this.data.shopcartData', this.data.shopcartData);

      this.data.totalCount = 0;
      this.data.totalPrice = 0;
      for (let i = 0; i < this.data.shopcartData.length; i++) {
        this.data.totalCount += this.data.shopcartData[i].count;
        this.data.totalPrice += Number(this.data.shopcartData[i].count) * Number(this.data.shopcartData[i].price);
      }

      this.setData({
        totalCount: this.data.totalCount,
        totalPrice: this.data.totalPrice
      })
    }).catch(err => {
      console.log('err', err);
    })

  },

  // 获取当前用户的购物车数据
  async getCurShopcartData() {
    return new Promise((resolve, reject) => {
      // 获取当前用户的购物车数据
      wx.cloud.callFunction({
        name: 'get_shopcart_data',
        data: {
          userId: this.data.userId
        }
      }).then(res => {
        // console.log('购物车数据', res);
        this.setData({
          shopcartData: [...res.result.data]
        });
        resolve(); // 成功时调用 resolve
      }).catch(err => {
        console.log('err', err);
        reject(err); // 失败时调用 reject
      });
    });
  },

  // 清空购物车
  clearShopcart() {
    wx.showLoading({
      title: '清空中...',
    })
    // 数据库删除菜品
    wx.cloud.callFunction({
      name: 'del_shopcart_data',
      data: {
        userId: this.data.userId,
      }
    }).then(res => {
      wx.hideLoading()
      wx.showToast({
        title: '成功清空',
      })
      this.data.shopcartData.length = 0;
      this.setData({
        shopcartData: this.data.shopcartData,
        totalCount: 0,
        totalPrice: 0
      })

      console.log('数据库删除菜品 res', res);
    }).catch(err => {
      console.log('数据库删除菜品 err', err);
    })
  },

  // 去下单
  async toPay() {
    wx.showLoading({
      title: '请稍候',
      mask: true
    })

    // 把菜品加入待付款数据库
    for (let i = 0; i < this.data.shopcartData.length; i++) {
      console.log(111);
      await wx.cloud.callFunction({
        name: 'add_wait_pay',
        data: {
          oneMenu: this.data.shopcartData[i]
        }
      }).then(res => {
        console.log('添加 res', res);
      }).catch(err => {
        console.log('添加 err', err);
      })
    }

    // 数据库删除菜品
    await wx.cloud.callFunction({
      name: 'del_shopcart_data',
      data: {
        userId: this.data.userId,
      }
    }).then(res => {
      wx.hideLoading()
      wx.showToast({
        title: '成功清空',
      })
      this.data.shopcartData.length = 0;
      this.setData({
        shopcartData: this.data.shopcartData,
        totalCount: 0,
        totalPrice: 0
      })

      console.log('数据库删除菜品 res', res);
    }).catch(err => {
      console.log('数据库删除菜品 err', err);
    })

    wx.hideLoading()
    // return
    wx.navigateTo({
      url: '../pay/pay',
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  // onShow() {

  // },

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