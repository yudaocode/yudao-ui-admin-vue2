import request from '@/utils/request'

// 查询消息模板列表
export function getMessageTemplateList(query) {
  return request({
    url: '/mp/message-template/list',
    method: 'get',
    params: query
  })
}

// 删除消息模板
export function deleteMessageTemplate(id) {
  return request({
    url: '/mp/message-template/delete?id=' + id,
    method: 'delete'
  })
}

// 同步公众号模板
export function syncMessageTemplate(accountId) {
  return request({
    url: '/mp/message-template/sync?accountId=' + accountId,
    method: 'post'
  })
}

// 发送消息模板
export function sendMessageTemplate(data) {
  return request({
    url: '/mp/message-template/send',
    method: 'post',
    data: data
  })
}

