const valid = require('../../utils/valid')

// pages/menu/menu.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 菜单内容部分
    menuList: [],
    // 当前侧边导航栏下标
    currentNavIndex: 0,
    toView: '',
    // 购物车
    shopcartData: [],

    userId: '',

    isLogin: true
  },

  // 监听页面加载
  onShow() {
    // 判断用户是否登录
    this.isLoginFun();

    this.data.userId = wx.getStorageSync('userId');
    wx.showLoading({
      title: '加载中...',
      mask: false
    })

    // 获取菜单数据
    wx.cloud.callFunction({
      name: 'get_menu'
    }).then(res => {
      // wx.hideLoading();

      // 调用函数，并使用 then 方法处理 Promise 的返回结果
      this.getCurShopcartData().then(() => {
        wx.hideLoading();
        // 处理菜单数据 有和购物车同用户并同个菜品的则替换
        let data = res.result.data;
        let menu = [];

        // 在 Promise 成功时执行后续代码
        // console.log('所有菜品', res.result.data);
        // console.log('购物车的数据', this.data.shopcartData);

        // 如果有一样的，就把菜单的数据替换成购物车的
        for (let m = 0; m < data.length; m++) {
          for (let n = 0; n < this.data.shopcartData.length; n++) {
            if (data[m].id === this.data.shopcartData[n].id) {
              data[m] = { ...this.data.shopcartData[n] };
            }
          }
        }

        // 创建7个类别的对象
        for (let i = 0; i < data.length; i++) {
          if (i > 0 && data[i].type === data[i - 1].type) {
            continue;
          }
          menu[data[i].type - 1] = {};
          menu[data[i].type - 1].title = data[i].title;
          menu[data[i].type - 1].id = 't-' + data[i].type;
          menu[data[i].type - 1].content = [];
        }

        // 把每个类别的菜谱放进相应的数组
        for (let j = 0; j < data.length; j++) {
          for (let k = 0; k < menu.length; k++) {
            if (data[j].type - 1 == k) {
              menu[k].content.push(data[j]);
            }
          }
        }
        this.setData({
          menuList: [...menu],
          userId: this.data.userId
        })

      }).catch(err => {
        // 在 Promise 失败时处理错误
        console.error('获取购物车数据失败', err);
      });

    }).catch(err => {
      console.log('err', err);
    })
  },
  // 跳转到搜索页面
  toSearchPage(e) {
    const keyword = e.detail.value;
    console.log('keyword', keyword);
    wx.navigateTo({
      url: '/pages/searchResult/searchResult?keyword=' + keyword
    })
  },
  // 获取搜索结果
  onSearch(e) {
    const keyword = e.detail.value;
    console.log('keyword', keyword);
  },

  // 菜单部分
  // 点击侧边导航栏
  onClickNav(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentNavIndex: index,
      // 滚动到相应的id区域
      toView: this.data.menuList[index].id
    });
  },
  // 滚动内容区
  onContentScroll(e) {
    const scrollTop = e.detail.scrollTop;

    let oneItems = [];
    wx.createSelectorQuery().selectAll('.one-item').boundingClientRect(rects => {
      oneItems = [...rects];
      let startHeight = 0;
      for (let i = 0; i < oneItems.length; i++) {
        if (i == 0) {
          startHeight = 0;
        } else {
          startHeight += oneItems[i - 1].height;
        }
        let endHeight = startHeight + oneItems[i].height;

        if (scrollTop >= startHeight && scrollTop < endHeight) {
          // console.log('i',i);
          this.setData({
            // 侧边导航栏高亮
            currentNavIndex: i
          })
        }
      }

    }).exec();

  },

  // 获取购物车的数据
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

  // 改变菜单数量
  onChangeCount(event) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    let count = event.detail;
    // 菜谱id
    let id = event.currentTarget.dataset.id;
    // 菜品名字
    let stdname = event.currentTarget.dataset.stdname;
    // 侧边栏下标
    let sliderIndex = event.currentTarget.dataset.sliderIndex;
    // 每个分类里菜品的下标
    let index = event.currentTarget.dataset.index;

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
            // console.log('this.data.shopcartData', this.data.shopcartData);

            break;
          }
        }

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

        // console.log('改变数量后购物车的数据222', this.data.shopcartData);
        // console.log('获取的菜品信息', res.result.data[0]);

      }).catch(err => {
        console.log('err', err);
      })

    }).catch(err => {
      console.log('err', err);
    })

  },

  // 用户是否登录
  isLoginFun() {
    // 判断用户是否登录
    this.data.userId = wx.getStorageSync('userId');
    this.data.isLogin = Boolean(this.data.userId);
    this.setData({
      userId: this.data.userId,
      isLogin: this.data.isLogin
    })
    
    // console.log('this.data.userId', this.data.userId);
    // console.log('this.data.isLogin', this.data.isLogin);

    // 判断用户是否登录
    // 用户未登录
    if (!this.data.isLogin) {
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

})