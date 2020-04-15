// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.Env })
const rp = require('request-promise');
const dateUtils = require('date-utils')
const db = cloud.database()
const _ = db.command
const RELEASE_LOG_KEY = 'releaseLogKey'
const APPLY_TEMPLATE_ID = 'DI_AuJDmFXnNuME1vpX_hY2yw1pR6kFXPZ7ZAQ0uLOY'

// 云函数入口函数
exports.main = async (event, context) => {
  //admin服务都要验证一下权限
  if (event.action !== 'checkAuthor' && event.action !== 'getAdvertConfig') {
    let result = await checkAuthor(event)
    if (!result) {
      return false;
    }
  }

  switch (event.action) {
    case 'checkAuthor': {
      return checkAuthor(event)
    }
    case 'addReleaseLog': {
      return addReleaseLog(event)
    }
   
    case 'deleteConfigById': {
      return deleteConfigById(event)
    }
   
    case 'upsertAdvertConfig': {
      return upsertAdvertConfig(event)
    }
    case 'getAdvertConfig': {
      return getAdvertConfig(event)
    }
    case 'approveApplyVip': {
      return approveApplyVip(event)
    }
    default: break
  }
}

/**
 * 验证
 * @param {} event 
 */
async function checkAuthor(event) {
  let authors = process.env.author
  if (authors.indexOf(event.userInfo.openId) != -1) {
    //if (event.userInfo.openId == process.env.author) {
    return true;
  }
  return false;
}

/**
 * 新增版本日志
 * @param {*} event 
 */
async function addReleaseLog(event) {
  try {
    let collection = 'dg_logs'
    let data = {
      key: RELEASE_LOG_KEY,
      tag: '【' + event.log.releaseName + '版本更新】',
      content: event.log,
      title: event.title,
      icon: 'formfill',
      color: 'blue',
      path: '../release/release',
      timestamp: Date.now(),
      datetime: new Date(Date.now() + (8 * 60 * 60 * 1000)).toFormat("YYYY-MM-DD HH24:MI"),
      openId: '',//为空则为所有用户
      type: 'system'
    }
    await db.collection(collection).add({
      data: data
    })
    return true;
  }
  catch (e) {
    console.info(e)
    return false;
  }

}

/**
 * 获取广告配置
 */
async function getAdvertConfig(event) {
  let key = "advertConfig"
  let collection = "dg_config"

  let result = await db.collection(collection).where({
    key: key
  }).get()

  return result.data[0]
}

/**
 * 新增广告配置
 * @param {*} event 
 */
async function upsertAdvertConfig(event) {
  let key = "advertConfig"
  let collection = "dg_config"
  let result = await db.collection(collection).where({
    key: key
  }).get()
  if (result.data.length > 0) {
    await db.collection(collection).doc(result.data[0]._id).update({
      data: {
        timestamp: Date.now(),
        value: event.advert
      }
    });
    return true
  }
  else {
    await db.collection(collection).add({
      data: {
        key: key,
        timestamp: Date.now(),
        value: event.advert
      }
    });
    return true;
  }
}


/**
 * 根据id删除配置表数据
 * @param {*} event 
 */
async function deleteConfigById(event) {
  try {
    await db.collection('dg_config').doc(event.id).remove()
    return true;
  } catch (e) {
    console.error(e)
    return false;
  }
}

/**
 * 审核会员状态
 * @param {*} event 
 */
async function approveApplyVip(event) {
  try {
    console.info("会员审批")
    console.info(event)
    //申请状态 0:默认 1:申请中 2:申请通过 3:申请驳回
    let applyStatus = 1
    let level = 1
    if (event.apply == 'pass') {
      applyStatus = 2
      level = 5
    }
    else if (event.apply == 'reject') {
      applyStatus = 3
    }
    await db.collection('dg_member').doc(event.id).update({
      data: {
        applyStatus: applyStatus,
        level: level,
        modifyTime: new Date().getTime()
      }
    });

    var templateInfo = await db.collection('dg_subcribute').where({
      openId: event.openId,
      templateId: APPLY_TEMPLATE_ID
    }).limit(1).get()

    console.info(templateInfo)

    if (templateInfo.code) {
      return true;
    }
    if (!templateInfo.data.length) {
      return true;
    }

    await db.collection('dg_subcribute').doc(templateInfo.data[0]['_id']).remove()

    try {
      const result = await cloud.openapi.subscribeMessage.send({
        touser: event.openId,
        page: 'pages/mine/mine',
        data: {
          phrase1: {
            value: event.apply == 'pass' ? "通过" : "驳回"
          },
          thing2: {
            value: "VIP申请"
          },
          thing5: {
            value: event.apply == 'pass' ? "恭喜成为VIP" : "没有打赏记录，不满足条件"
          }
        },
        templateId: APPLY_TEMPLATE_ID
      })
      console.log(result)
    } catch (err) {
      console.log(err)
    }

    return true;
  }
  catch (e) {
    console.error(e)
    return false
  }
}