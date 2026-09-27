import request from '@/utils/request'

// 查询公告列表
export function getNoticePage(params) {
  return request({
    url: '/system/notice/page',
    method: 'get',
    params
  })
}

// 查询公告详细
export function getNotice(id) {
  return request({
    url: '/system/notice/get?id=' + id,
    method: 'get'
  })
}

// 新增公告
export function createNotice(data) {
  return request({
    url: '/system/notice/create',
    method: 'post',
    data
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
export function deleteNotice(id) {
  return request({
    url: '/system/notice/delete?id=' + id,
    method: 'delete'
  })
}

// 批量删除公告
export function deleteNoticeList(ids) {
  return request({
    url: '/system/notice/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}

// 推送公告
export function pushNotice(id) {
  return request({
    url: '/system/notice/push?id=' + id,
    method: 'post'
  })
}
