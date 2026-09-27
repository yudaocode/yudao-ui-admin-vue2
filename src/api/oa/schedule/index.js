import request from '@/utils/request'

// 查询所选范围内的日程分页
export function getSchedulePage(params) {
  return request({ url: '/oa/schedule/page', method: 'get', params })
}

// 查询我的日程分页
export function getMySchedulePage(params) {
  return request({ url: '/oa/schedule/my-page', method: 'get', params })
}

// 查询共享给我的日程分页
export function getReceivedSchedulePage(params) {
  return request({ url: '/oa/schedule/received-page', method: 'get', params })
}

// 查询日程详情
export function getSchedule(id) {
  return request({ url: '/oa/schedule/get?id=' + id, method: 'get' })
}

// 标记本人已阅读日程
export function updateScheduleReadStatus(id) {
  return request({ url: '/oa/schedule/update-read-status?id=' + id, method: 'put' })
}

// 新增日程
export function createSchedule(data) {
  return request({ url: '/oa/schedule/create', method: 'post', data })
}

// 修改日程
export function updateSchedule(data) {
  return request({ url: '/oa/schedule/update', method: 'put', data })
}

// 删除日程
export function deleteSchedule(id) {
  return request({ url: '/oa/schedule/delete?id=' + id, method: 'delete' })
}
