const regeneratorRuntime = require('../../../utils/runtime.js');
const util = require('../../../utils/util.js');
const config = require('../../../utils/config.js');
const request = require('../../../utils/request.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    posts: [],
    page: 1,
    nodata: false,
    nomore: false,
    classify: "",
    image:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this;
    let classify = options.classify;
    that.setData({
      image: options.image,
      classify: classify
    })
    await this.getPostsList(classify)
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
    await this.getPostsList(that.data.classify)
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    await this.getPostsList(this.data.classify)
  },

  /**
   * 获取文章列表
   */
  getPostsList: async function (filter) {
    wx.showLoading({
      title: '加载中...',
    })
    let that = this
    let page = that.data.page
    if (that.data.nomore) {
      wx.hideLoading()
      return
    }

    let postUrl = config.host + "/api/content/categories/" + filter + "/posts";
    let params = {
      page: page - 1,
      size: 10,
      sort: 'updateTime,asc',
    }
    request.requestGetApi(postUrl, config.token, params, this,
      function (res, selfObj) {
        var list = res.data.content;
        for (let i = 0; i < list.length; ++i) {
          list[i].createTime = util.customFormatTime(list[i].createTime, 'Y.M.D');
        }
        if (res.data.length === 0) {
          that.setData({
            nomore: true
          })
          if (page === 1) {
            that.setData({
              nodata: true
            })
          }
        } else {
          that.setData({
            page: page + 1,
            posts: that.data.posts.concat(list),
          })
        }
        wx.hideLoading()
      },
      /**
       * 文章列表请求--接口调用失败处理
       */
      function (res, selfObj) {
        console.error('failPostList', res)
      }
    );
    
    wx.hideLoading()
  },
  bindPostDetail: function (e) {
    let blogId = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + blogId
    })
  }

})