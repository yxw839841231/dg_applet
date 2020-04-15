/**
 * 个人文章操作枚举
 */
var postRelatedType = {
    COLLECTION: 1,
    ZAN: 2,
    properties: {
        1: {
            desc: "收藏"
        },
        2: {
            desc: "点赞"
        }
    }
};

var subcributeTemplateId ="EHzwVxsjMc6Dg7JxYCEv0pAYqO7zhuF2LS-7i-6tsUA"

module.exports = {

    postRelatedType: postRelatedType,
    moneyUrl:"https://image.dgjava.com/%E8%B5%9E%E8%B5%8F_1585759065817.png",//打赏码
    wechatUrl:"https://image.dgjava.com/xcx50_1586744365757.jpg-zjoin.image",//联系方式
    env:'',//云环境ID
    subcributeTemplateId:subcributeTemplateId,
    host:"",//你的博客域名
    token:""//你的博客授权token
}