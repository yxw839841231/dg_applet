const regeneratorRuntime = require('runtime.js');
const request = require('request.js');

const db = wx.cloud.database()
const _ = db.command



/**
 * 获取分享明细
 * @param {} openId 
 * @param {*} date 
 */
function getShareDetailList(openId, date) {
  return db.collection('dg_share_detail')
    .where({
      shareOpenId: openId,
      date: date
    })
    .limit(5)
    .get()
}

/**
 * 获取会员信息
 * @param {} openId 
 */
function getMemberInfo(openId) {
  return db.collection('dg_member')
    .where({
      openId: openId
    })
    .limit(1)
    .get()
}

/**
 * 获取会员列表
 * @param {*} applyStatus 
 * @param {*} page 
 */
function getMemberInfoList(page, applyStatus) {
  return db.collection('dg_member')
    .where({
      applyStatus: applyStatus
    })
    .orderBy('modifyTime', 'desc')
    .skip((page - 1) * 10)
    .limit(10)
    .get()
}

/**
 * 获取积分明细列表
 * @param {*} page 
 * @param {*} openId 
 */
function getPointsDetailList(page, openId) {
  return db.collection('dg_point_detail')
    .where({
      openId: openId
    })
    .orderBy('createTime', 'desc')
    .skip((page - 1) * 20)
    .limit(20)
    .get()
}



/**
 * 获取消息列表
 * @param {*} page 
 */
function getNoticeLogsList(page, openId) {
  return db.collection('dg_logs')
    .orderBy('timestamp', 'desc')
    .skip((page - 1) * 10)
    .limit(10)
    .get()
}

/**
 * 获取版本发布日志
 * @param {*} page 
 */
function getReleaseLogsList(page) {
  return db.collection('dg_logs')
    .where({
      key: 'releaseLogKey'
    })
    .orderBy('timestamp', 'desc')
    .skip((page - 1) * 10)
    .limit(10)
    .get()
}




/**
 * 获取收藏、点赞列表
 * @param {} page 
 */
function getPostRelated(where, page) {
  return db.collection('dg_posts_related')
    .where(where)
    .orderBy('createTime', 'desc')
    .skip((page - 1) * 10)
    .limit(10)
    .get()
}


/**
 * 新增用户收藏文章
 */
function addPostCollection(data) {
  return wx.cloud.callFunction({
    name: 'postsService',
    data: {
      openId: data.openId,
      action: "addPostCollection",
      postId: data.postId,
      postTitle: data.postTitle,
      postUrl: data.postUrl,
      postDigest: data.postDigest,
      type: data.type
    }
  })
}

/**
 * 取消喜欢或收藏
 */
function deletePostCollectionOrZan(postId, type, openId) {
  return wx.cloud.callFunction({
    name: 'postsService',
    data: {
      action: "deletePostCollectionOrZan",
      postId: postId,
      type: type,
      openId: openId
    }
  })
}


/**
 * 新增用户点赞
 * @param {} data 
 */
function addPostZan(data) {
  return wx.cloud.callFunction({
    name: 'postsService',
    data: {
      action: "addPostZan",
      openId: data.openId,
      postId: data.postId,
      postTitle: data.postTitle,
      postUrl: data.postUrl,
      postDigest: data.postDigest,
      type: data.type
    }
  })
}


/**
 * 校验评论合法性
 */
function checkPostComment(content) {
  return wx.cloud.callFunction({
    name: 'postsService',
    data: {
      action: "checkPostComment",
      content: content
    }
  })
}


/**
 * 验证是否是管理员
 */
function checkAuthor() {
  return wx.cloud.callFunction({
    name: 'adminService',
    data: {
      action: "checkAuthor"
    }
  })
}

/**
 * 查询可用的formId数量
 */
function querySubscribeCount(templateId) {
  return wx.cloud.callFunction({
    name: 'messageService',
    data: {
      action: "querySubscribeCount",
      templateId: templateId
    }
  })
}

function getTemplateList() {
  return wx.cloud.callFunction({
    name: 'messageService',
    data: {
      action: "getTemplateList"
    }
  })
}

function addSubscribeCount(templateIds) {
  return wx.cloud.callFunction({
    name: 'messageService',
    data: {
      action: "addSubscribeCount",
      templateIds: templateIds
    }
  })
}

/**
 * 查询可用的formId数量
 */
function addFormIds(formIds) {
  return wx.cloud.callFunction({
    name: 'messageService',
    data: {
      action: "addFormIds",
      formIds: formIds
    }
  })
}

/**
 * 发送评论通知
 * @param {} nickName 
 * @param {*} comment 
 * @param {*} blogId 
 */
function sendTemplateMessage(nickName, comment, blogId) {
  return wx.cloud.callFunction({
    name: 'messageService',
    data: {
      action: "sendTemplateMessage",
      nickName: nickName,
      message: comment,
      blogId: blogId,
      tOpenId: ""
    }
  })
}

/**
 * 新增版本日志
 * @param {} log 
 */
function addReleaseLog(log, title) {
  return wx.cloud.callFunction({
    name: 'adminService',
    data: {
      action: "addReleaseLog",
      log: log,
      title: title
    }
  })
}


/**
 * 获取广告配置
 */
function getAdvertConfig(req) {

  return wx.cloud.callFunction({
    name: 'adminService',
    data: {
      action: "getAdvertConfig",
      openId: req
    }
  })
}

/**
 * 更新广告配置
 */
function upsertAdvertConfig(advert) {
  return wx.cloud.callFunction({
    name: 'adminService',
    data: {
      action: "upsertAdvertConfig",
      advert: advert
    }
  })
}

/**
 * 新增签到
 */
function addSign(info) {
  return wx.cloud.callFunction({
    name: 'memberService',
    data: {
      action: "addSign",
      info: info
    }
  })
}

/**
 * 新增积分
 */
function addPoints(taskType, info) {
  return wx.cloud.callFunction({
    name: 'memberService',
    data: {
      action: "addPoints",
      taskType: taskType,
      info: info
    }
  })
}

/**
 * 分享得积分
 * @param {*} info 
 */
function addShareDetail(info) {
  return wx.cloud.callFunction({
    name: 'memberService',
    data: {
      action: "addShareDetail",
      info: info
    }
  })
}

/**
 * 申请VIP
 * @param {}}  
 */
function applyVip(info) {
  return wx.cloud.callFunction({
    name: 'memberService',
    data: {
      action: "applyVip",
      info: info
    }
  })
}

/**
 * 审核vip
 * @param {}}  
 */
function approveApplyVip(id, apply, openId) {
  return wx.cloud.callFunction({
    name: 'adminService',
    data: {
      action: "approveApplyVip",
      id: id,
      apply: apply,
      openId: openId
    }
  })
}


/**
 * 获取签到详情
 */
function getSignedDetail(openId, year, month) {
  return wx.cloud.callFunction({
    name: 'memberService',
    data: {
      action: "getSignedDetail",
      openId: openId,
      year: year,
      month: month
    }
  })
}




/**
 * 根据配置id删除
 */
function deleteConfigById(id) {
  return wx.cloud.callFunction({
    name: 'adminService',
    data: {
      action: "deleteConfigById",
      id: id
    }
  })
}


module.exports = {
  getPostRelated: getPostRelated,
  addPostCollection: addPostCollection,
  addPostZan: addPostZan,
  deletePostCollectionOrZan: deletePostCollectionOrZan,
  checkAuthor: checkAuthor,
  addFormIds: addFormIds,
  deleteConfigById: deleteConfigById,
  querySubscribeCount: querySubscribeCount,
  sendTemplateMessage: sendTemplateMessage,
  addReleaseLog: addReleaseLog,
  getReleaseLogsList: getReleaseLogsList,
  getNoticeLogsList: getNoticeLogsList,
  getTemplateList: getTemplateList,
  addSubscribeCount: addSubscribeCount,
  checkPostComment: checkPostComment,
  upsertAdvertConfig: upsertAdvertConfig,
  getAdvertConfig: getAdvertConfig,
  addSign: addSign,
  getMemberInfo: getMemberInfo,
  getSignedDetail: getSignedDetail,
  addPoints: addPoints,
  applyVip: applyVip,
  approveApplyVip: approveApplyVip,
  getMemberInfoList: getMemberInfoList,
  addShareDetail: addShareDetail,
  getShareDetailList: getShareDetailList,
  getPointsDetailList: getPointsDetailList
}