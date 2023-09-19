const utils = require('../../utils/utils.js')

// pages/pay/pay.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    waitData: [],
    userId: '',
    isLogin: false,
    totalPrice: 0,
    show: false,
    curLoginInfo: {
      phone: '',
      imgUrl: ''
    },
    inputPassword: '',
    password: '123456',
  },
  // 获取当前用户的待付款数据
  async getCurPayData() {
    return new Promise((resolve, reject) => {
      // 获取当前用户的购物车数据
      wx.cloud.callFunction({
        name: 'get_wait_data',
        data: {
          userId: this.data.userId
        }
      }).then(res => {
        // console.log('待付款数据', res);
        this.setData({
          waitData: [...res.result.data]
        });
        resolve(); // 成功时调用 resolve
      }).catch(err => {
        console.log('err', err);
        reject(err); // 失败时调用 reject
      });
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
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
      return
    }

    // 获取当前登录的用户
    let cur = await utils.getCurLoginInfo(this.data.userId)
    this.data.curLoginInfo.phone = cur.phone;
    this.data.curLoginInfo.imgUrl = cur.imgUrl;
    this.setData({
      curLoginInfo: this.data.curLoginInfo,
    })

    // 获取待付款的数据
    this.getCurPayData().then(() => {
      wx.hideLoading();
      console.log(this.data.waitData);

      for (let i = 0; i < this.data.waitData.length; i++) {
        this.data.totalPrice += Number(this.data.waitData[i].count) * Number(this.data.waitData[i].price);
      }

      this.setData({
        totalPrice: this.data.totalPrice
      })

    }).catch(err => {
      console.log('err', err);
    })
  },

  // 删除订单
  async del(e) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 菜谱id
    let id = e.currentTarget.dataset.id;

    for (let i = 0; i < this.data.waitData.length; i++) {
      // 如果存在id 则更新数据
      if (this.data.waitData[i].id === id) {
        // 数据库删除菜品
        await wx.cloud.callFunction({
          name: 'del_wait_pay',
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

        this.data.waitData.splice(i, 1);
        this.data.totalPrice -= Number(this.data.waitData[i].price) * Number(this.data.waitData[i].count);
        console.log('this.data.totalPrice', this.data.totalPrice);

        this.setData({
          waitData: this.data.waitData,
          totalPrice: this.data.totalPrice
        })

        break;
      }
    }
  },

  // 点击付款
  pay() {
    this.setData({ show: true });

  },
  onClose() {
    this.setData({ show: false });
  },
  // 输入密码
  iptPassword(event) {
    let curThis = this;
    // console.log('event.detail', event.detail.value.length);
    // console.log('event.detail', event.detail.value);
    if (event.detail.value.length === 6) {
      wx.showLoading({
        title: "支付中...",
        mask: true
      })

      setTimeout(async () => {
        if (event.detail.value === this.data.password) {
          this.setData({
            show: false,
            inputPassword: ''
          });

          // 放到已支付数据
          for (let i = 0; i < this.data.waitData.length; i++) {
            console.log(111);
            await wx.cloud.callFunction({
              name: 'add_already_pay',
              data: {
                oneMenu: this.data.waitData[i]
              }
            }).then(res => {
              console.log('添加 res', res);
            }).catch(err => {
              console.log('添加 err', err);
            })
          }

          // 清空待付款数据
          // 数据库删除菜品
          await wx.cloud.callFunction({
            name: 'del_wait_pay',
            data: {
              userId: this.data.userId,
            }
          }).then(res => {
            this.data.waitData.length = 0;
            this.setData({
              waitData: this.data.waitData,
              totalCount: 0,
              totalPrice: 0
            })

            console.log('数据库删除菜品 res', res);
          }).catch(err => {
            console.log('数据库删除菜品 err', err);
          })

          wx.hideLoading()
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 800
          })

          // 转到订单页面
          setTimeout(() => {
            wx.navigateTo({
              url: '../order/order',
            })
          }, 800)

        } else {
          wx.hideLoading()
          curThis.setData({
            show: false,
            inputPassword: ''
          });
          wx.showModal({
            title: '支付密码错误，请重试',
            content: '',
            success(res) {
              if (res.confirm) {
                // console.log('用户点击确定')
                curThis.setData({
                  show: true,
                  inputPassword: ''
                });
              } else if (res.cancel) {
                curThis.setData({
                  inputPassword: ''
                });
                // 转到待付款页面
                console.log('用户点击取消')

                curThis.setData({
                  inputPassword: ''
                });

              }
            }
          })
        }
      }, 1000)

    }
  }

})