const regeneratorRuntime = require('../../utils/runtime.js');
const request = require('../../utils/request.js');
const config = require('../../utils/config.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classifyList: [],
    page:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function(options) {
    await this.getClassifyList()
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function() {
    let that = this;
    that.setData({
      classifyList: []
    })
    await this.getClassifyList()
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

    /**
   * 获取专题集合
   * @param {*} e 
   */
  getClassifyList: async function () {
    wx.showLoading({
      title: '加载中...',
    })
    let that = this
    let page = that.data.page
    if (that.data.nomore) {
      wx.hideLoading()
      return
    }
    let postUrl = config.host+"/api/content/categories";
    let params ={
      page: page - 1,
      size: 10,
      sort: 'updateTime,asc',
    }
    request.requestGetApi(postUrl,config.token,params, this, 
      function (res) {
        var list = res.data;
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
            classifyList: res.data,
            nomore: true,
            page: page + 1
          })
        }
        wx.hideLoading()
      },
      /**
       * 文章列表请求--接口调用失败处理
       */
      function (res) {
        console.error('failPostList', res)
      }
    );
  },

  /**
   * 跳转至专题详情
   * @param {} e 
   */
  openTopicPosts:async function(e){
    let classify = e.currentTarget.dataset.tname;
    wx.navigateTo({
      url: './albumlist/albumlist?classify=' + classify+"&image="+e.currentTarget.dataset.image
    })
  }
})