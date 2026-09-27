import request from '@/utils/request'

// 查询我发布的公告分页
export function getPublishedAnnouncementPage(params) {
  return request({ url: '/oa/announcement/published-page', method: 'get', params })
}

// 查询接收的公告分页
export function getReceivedAnnouncementPage(params) {
  return request({ url: '/oa/announcement/received-page', method: 'get', params })
}

// 查询公告详情
export function getAnnouncement(id) {
  return request({ url: '/oa/announcement/get?id=' + id, method: 'get' })
}

// 新增公告
export function createAnnouncement(data) {
  return request({ url: '/oa/announcement/create', method: 'post', data })
}

// 修改公告
export function updateAnnouncement(data) {
  return request({ url: '/oa/announcement/update', method: 'put', data })
}

// 删除发布的公告
export function deleteAnnouncement(id) {
  return request({ url: '/oa/announcement/delete?id=' + id, method: 'delete' })
}

// 删除接收的公告
export function deleteReceivedAnnouncement(id) {
  return request({ url: '/oa/announcement/delete-received?id=' + id, method: 'delete' })
}

// 标记公告为已读
export function updateAnnouncementReadStatus(id) {
  return request({ url: '/oa/announcement/update-read-status?id=' + id, method: 'put' })
}

// 转发公告给直属下属
export function forwardAnnouncement(id) {
  return request({ url: '/oa/announcement/forward?id=' + id, method: 'post' })
}
