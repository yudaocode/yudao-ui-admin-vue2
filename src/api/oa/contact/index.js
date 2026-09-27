import request from '@/utils/request'

// 查询我的联系人分页
export function getMyContactPage(params) {
  return request({ url: '/oa/contact/my-page', method: 'get', params })
}

// 查询共享给我的联系人分页
export function getReceivedContactPage(params) {
  return request({ url: '/oa/contact/received-page', method: 'get', params })
}

// 查询我共享的联系人分页
export function getSharedContactPage(params) {
  return request({ url: '/oa/contact/shared-page', method: 'get', params })
}

// 查询联系人详情
export function getContact(id) {
  return request({ url: '/oa/contact/get', method: 'get', params: { id } })
}

// 新增联系人
export function createContact(data) {
  return request({ url: '/oa/contact/create', method: 'post', data })
}

// 修改联系人
export function updateContact(data) {
  return request({ url: '/oa/contact/update', method: 'put', data })
}

// 删除联系人
export function deleteContact(id) {
  return request({ url: '/oa/contact/delete', method: 'delete', params: { id } })
}

// 删除接收到的共享联系人
export function deleteReceivedContact(contactId) {
  return request({ url: '/oa/contact/delete-received', method: 'delete', params: { contactId } })
}

// 共享联系人
export function shareContact(contactId, userIds) {
  return request({ url: '/oa/contact/share', method: 'post', data: { contactId, userIds } })
}

// 处理联系人共享
export function handleContactShare(contactId, categoryId) {
  return request({ url: '/oa/contact/handle-share', method: 'put', data: { contactId, categoryId } })
}
