import request from '@/utils/request'

// 查询当前租户启用邮箱及归属人姓名
export function getSimpleMailAccountList() {
  return request({ url: '/oa/mail-account/simple-list', method: 'get' })
}

// 查询本人账号列表
export function getMailAccountList(status) {
  return request({ url: '/oa/mail-account/list', method: 'get', params: { status } })
}

// 查询本人账号
export function getMailAccount(id) {
  return request({ url: '/oa/mail-account/get', method: 'get', params: { id } })
}

// 绑定本人账号
export function createMailAccount(data) {
  return request({ url: '/oa/mail-account/create', method: 'post', data })
}

// 修改本人账号
export function updateMailAccount(data) {
  return request({ url: '/oa/mail-account/update', method: 'put', data })
}

// 设置默认账号
export function updateMailAccountDefault(id) {
  return request({ url: '/oa/mail-account/update-default', method: 'put', params: { id } })
}

// 移除绑定
export function deleteMailAccount(id) {
  return request({ url: '/oa/mail-account/delete', method: 'delete', params: { id } })
}

// 测试连接，不发送邮件
export function testMailAccountConnection(id) {
  return request({ url: '/oa/mail-account/test-connection', method: 'post', params: { id }, timeout: 60000 })
}
