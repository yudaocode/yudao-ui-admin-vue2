import request from '@/utils/request'

// 全量同步远端邮件索引，不受列表分页条件影响
export function syncMailMessageList(accountId) {
  return request({ url: '/oa/mail-message/sync', method: 'post', params: { accountId }, timeout: 300000 })
}

// 获得邮件分页
export function getMailMessagePage(params) {
  return request({ url: '/oa/mail-message/page', method: 'get', params })
}

// 获得邮件详情
export function getMailMessage(id) {
  return request({ url: '/oa/mail-message/get', method: 'get', params: { id }, timeout: 60000 })
}

// 修改已读状态
export function updateMailMessageRead(id, readStatus) {
  return request({ url: '/oa/mail-message/update-read', method: 'put', params: { id, readStatus }, timeout: 60000 })
}

// 恢复已删除邮件到收件箱
export function restoreMailMessage(id) {
  return request({ url: '/oa/mail-message/restore', method: 'put', params: { id } })
}

// 删除邮件
export function deleteMailMessage(id) {
  return request({ url: '/oa/mail-message/delete', method: 'delete', params: { id }, timeout: 60000 })
}

// 保存草稿
export function saveMailMessageDraft(data) {
  return request({
    url: '/oa/mail-message/save-draft',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  })
}

// 发送邮件，不自动重试
export function sendMailMessage(data) {
  return request({
    url: '/oa/mail-message/send',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  })
}

// 获得写信预填数据
export function getMailMessageCompose(id, mode) {
  return request({ url: '/oa/mail-message/compose', method: 'get', params: { id, mode }, timeout: 60000 })
}

// 下载本人邮件附件
export function downloadMailMessageAttachment(id, part) {
  return request({ url: '/oa/mail-message/attachment', method: 'get', params: { id, part }, responseType: 'blob', timeout: 60000 })
}
