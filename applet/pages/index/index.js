const api = require('../../utils/api.js');
const regeneratorRuntime = require('../../utils/runtime.js');
const app = getApp();
const request = require('../../utils/request.js');
const util = require('../../utils/util.js');
const config = require('../../utils/config.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    posts: [],
    page: 1,
    filter: "",
    nodata: false,
    nomore: false,
    defaultSearchValue: "",
    navItems: [{
      name: '最新',
      index: 1
    }, {
      name: '热门',
      index: 2
    }, {
      name: '标签',
      index: 3
    }],
    tabCur: 1,
    scrollLeft: 0,
    showHot: false,
    showLabels: false,
    hotItems: ["浏览最多 ", "评论最多", "点赞最多", "收藏最多"],
    hotCur: 0,
    labelList: [],
    labelCur: "全部",
    whereItem: ['', 'createTime', ''], //下拉查询条件
    showLogin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this
    //有openid跳授权计算积分
    if (options.openid) {
      let shareOpenId = options.openid
      app.checkUserInfo(function (userInfo, isLogin) {
        if (!isLogin) {
          that.setData({
            showLogin: true
          })
        } else {
          that.setData({
            userInfo: userInfo
          });
        }
      });

      if (that.data.userInfo) {
        let info = {
          shareOpenId: shareOpenId,
          nickName: app.globalData.userInfo.nickName,
          avatarUrl: app.globalData.userInfo.avatarUrl
        }
        await api.addShareDetail(info)
      }
    }
    await that.getPostsList('', 'createTime')
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function () {
    let that = this;
    let page = 1
    that.setData({
      page: page,
      posts: [],
      filter: "",
      nomore: false,
      nodata: false,
      defaultSearchValue: ""
    })
    await this.getPostsList("")
    await wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    let whereItem = this.data.whereItem
    let filter = this.data.filter
    await this.getPostsList(whereItem[0], whereItem[1], whereItem[2])
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 点击文章明细
   */
  bindPostDetail: function (e) {
    let blogId = e.currentTarget.id;
    wx.navigateTo({
      url: '../detail/detail?id=' + blogId
    })
  },
  /**
   * 搜索功能
   * @param {} e 
   */
  bindconfirm: async function (e) {
    let that = this;
    let page = 1
    that.setData({
      page: page,
      posts: [],
      filter: e.detail.value,
      nomore: false,
      nodata: false,
      whereItem: [e.detail.value, 'createTime', '']
    })
    await this.getPostsList(e.detail.value, 'createTime')
  },

  /**
   * tab切换
   * @param {} e 
   */
  tabSelect: async function (e) {
    let that = this;
    let tabCur = e.currentTarget.dataset.id
    switch (tabCur) {
      case 1: {
        that.setData({
          tabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
          nomore: false,
          nodata: false,
          showHot: false,
          showLabels: false,
          defaultSearchValue: "",
          posts: [],
          page: 1,
          whereItem: ['', 'createTime', '']
        })

        await that.getPostsList("", 'createTime')
        break
      }
      case 2: {
        that.setData({
          posts: [],
          tabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
          showHot: true,
          showLabels: false,
          defaultSearchValue: "",
          page: 1,
          nomore: false,
          nodata: false,
          whereItem: ['', 'visits', '']
        })
        await that.getPostsList("", "visits")
        break
      }
      case 3: {
        that.setData({
          tabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
          showHot: false,
          showLabels: true,
        })

        let task = await that.getPostsList("", 'createTime')
        // let labelList =  api.getLabelList()

        await request.requestGetApi(
          config.host + "/api/content/tags",
          config.token, {}, this,
          function (res, selfObj) {
            that.setData({
              labelList: res.data
            })
            task
          },
          /**
           * 文章列表请求--接口调用失败处理
           */
          function (res, selfObj) {
            console.error('failPostList', res)
          });



        break
      }
    }
  },

  /**
   * 热门按钮切换
   * @param {*} e 
   */
  hotSelect: async function (e) {
    let that = this
    let hotCur = e.currentTarget.dataset.id
    let orderBy = "createTime"
    switch (hotCur) {
      //浏览最多
      case 0: {
        orderBy = "visits"
        break
      }
      //评论最多
      case 1: {
        orderBy = "comments"
        break
      }
      //点赞最多
      case 2: {
        orderBy = "likes"
        break
      }
      //收藏最多
      case 3: {
        orderBy = "enshrine"
        break
      }
    }
    that.setData({
      posts: [],
      hotCur: hotCur,
      defaultSearchValue: "",
      page: 1,
      nomore: false,
      nodata: false,
      whereItem: ['', orderBy, '']
    })
    await that.getPostsList("", orderBy)
  },

  /**
   * 标签按钮切换
   * @param {*} e 
   */
  labelSelect: async function (e) {
    let that = this
    let labelCur = e.currentTarget.dataset.id

    that.setData({
      posts: [],
      labelCur: labelCur,
      defaultSearchValue: "",
      page: 1,
      nomore: false,
      nodata: false,
      whereItem: ['', 'createTime', labelCur == "全部" ? "" : labelCur]
    })

    await that.getPostsList("", "createTime", labelCur == "全部" ? "" : labelCur)
  },

  /**
   * 返回
   */
  navigateBack: function (e) {
    wx.switchTab({
      url: '../index/index'
    })
  },

  /**
   * 获取文章列表
   */
  getPostsList: async function (filter, orderBy, label) {
    wx.showLoading({
      title: '加载中...',
    })
    let that = this
    let page = that.data.page
    if (that.data.nomore) {
      wx.hideLoading()
      return
    }


    let postUrl = config.host + "/api/content/posts";
    var params;
    if (that.data.filter) {
      postUrl += "/search?sort=createTime%2Cdesc&keyword=" + that.data.filter;
      request.requestPostApi(postUrl, config.token, {}, this,
        function (res, selfObj) {
          // console.warn(res.data.content);
          var list = res.data.content;
          for (let i = 0; i < list.length; ++i) {
            list[i].createTime = util.customFormatTime(list[i].createTime, 'Y.M.D');
          }
          if (list.length === 0) {
            that.setData({
              nomore: true
            })
            if (page === 0) {
              that.setData({
                nodata: true
              })
            }
          } else {
            that.setData({
              nomore: true,
              page: page + 1,
              posts: that.data.posts.concat(list),
            })
          }
          if (res.data.content != "") {
            that.setData({
              postList: res.data.content,
              moreFlag: false,
              pages: res.data.pages,
            });
          } else {
            that.setData({
              postList: res.data.content,
              moreFlag: true,
              pages: res.data.pages,
            });
          }
        },
        /**
         * 文章列表请求--接口调用失败处理
         */
        function (res, selfObj) {
          console.error('failPostList', res)
        }
      );
    } else if (label) {
      let postUrl = config.host + "/api/content/tags/" + label + "/posts";
      request.requestGetApi(postUrl, config.token, {}, this,
        function (res, selfObj) {
          // console.warn(res.data.content);
          var list = res.data.content;
          for (let i = 0; i < list.length; ++i) {
            list[i].createTime = util.customFormatTime(list[i].createTime, 'Y.M.D');
          }
          if (list.length === 0) {
            that.setData({
              nomore: true
            })
            if (page === 0) {
              that.setData({
                nodata: true
              })
            }
          } else {
            that.setData({
              nomore: true,
              page: page + 1,
              posts: that.data.posts.concat(list),
            })
          }
          if (res.data.content != "") {
            that.setData({
              postList: res.data.content,
              moreFlag: false,
              pages: res.data.pages,
            });
          } else {
            that.setData({
              postList: res.data.content,
              moreFlag: true,
              pages: res.data.pages,
            });
          }
        },
        /**
         * 文章列表请求--接口调用失败处理
         */
        function (res, selfObj) {
          console.error('failPostList', res)
        }
      );

    } else {

      params = {
        page: page - 1,
        size: 10,
        sort: that.data.whereItem[1] + ',desc',
      }
      request.requestGetApi(postUrl, config.token, params, this,
        function (res, selfObj) {
          var list = res.data.content;
          for (let i = 0; i < list.length; ++i) {
            list[i].createTime = util.customFormatTime(list[i].createTime, 'Y.M.D');
          }
          if (list.length === 0) {
            that.setData({
              nomore: true
            })
            if (page === 1) {
              that.setData({
                nodata: true
              })
            }
          } else {
            if (page == res.data.pages) {
              that.setData({
                nomore: true
              });
            }
            that.setData({
              page: page + 1,
              posts: that.data.posts.concat(list),
            })
          }

          if (res.data.content != "") {
            that.setData({
              postList: res.data.content,
              moreFlag: false,
              pages: res.data.pages,
            });
          } else {
            that.setData({
              postList: res.data.content,
              moreFlag: true,
              pages: res.data.pages,
            });
          }
        },
        /**
         * 文章列表请求--接口调用失败处理
         */
        function (res, selfObj) {
          console.error('failPostList', res)
        });
    }

    wx.hideLoading()
  }
})