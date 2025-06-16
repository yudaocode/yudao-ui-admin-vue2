import request from '@/utils/request'

// 查询公告列表
export function listNotice(query) {
  return request({
    url: '/system/notice/page',
    method: 'get',
    params: query
  })
}

// 查询公告详细
export function getNotice(noticeId) {
  return request({
    url: '/system/notice/get?id=' + noticeId,
    method: 'get'
  })
}

// 新增公告
export function addNotice(data) {
  return request({
    url: '/system/notice/create',
    method: 'post',
    data: data
  })
}

// 修改公告
export function updateNotice(data) {
  return request({
    url: '/system/notice/update',
    method: 'put',
    data: data
  })
}

// 删除公告
export function delNotice(noticeId) {
  return request({
    url: '/system/notice/delete?id=' + noticeId,
    method: 'delete'
  })
}

// 批量删除公告
export function delNoticeList(ids) {
  return request({
    url: `/system/notice/delete-batch?ids=${ids.join(',')}`,
    method: 'delete'
  })
}

// 推送公告
export function pushNotice(noticeId) {
  return request({
    url: '/system/notice/push?id=' + noticeId,
    method: 'post'
  })
}
