import request from '@/utils/request'

// 公众号消息模板 API
export const MessageTemplateApi = {
  // 查询消息模板列表
  getMessageTemplateList(params) {
    return request({
      url: '/mp/message-template/list',
      method: 'get',
      params
    })
  },
  // 删除消息模板
  deleteMessageTemplate(id) {
    return request({
      url: '/mp/message-template/delete?id=' + id,
      method: 'delete'
    })
  },
  // 同步公众号模板
  syncMessageTemplate(accountId) {
    return request({
      url: '/mp/message-template/sync?accountId=' + accountId,
      method: 'post'
    })
  },
  // 发送消息模板
  sendMessageTemplate(data) {
    return request({
      url: '/mp/message-template/send',
      method: 'post',
      data
    })
  }
}
