import request from '@/utils/request'

// 查询砍价活动列表
export function getBargainActivityPage(params) {
  return request({
    url: '/promotion/bargain-activity/page',
    method: 'get',
    params
  })
}

// 查询砍价活动详情
export function getBargainActivity(id) {
  return request({
    url: '/promotion/bargain-activity/get?id=' + id,
    method: 'get'
  })
}

// 新增砍价活动
export function createBargainActivity(data) {
  return request({
    url: '/promotion/bargain-activity/create',
    method: 'post',
    data
  })
}

// 修改砍价活动
export function updateBargainActivity(data) {
  return request({
    url: '/promotion/bargain-activity/update',
    method: 'put',
    data
  })
}

// 关闭砍价活动
export function closeBargainActivity(id) {
  return request({
    url: '/promotion/bargain-activity/close?id=' + id,
    method: 'put'
  })
}

// 删除砍价活动
export function deleteBargainActivity(id) {
  return request({
    url: '/promotion/bargain-activity/delete?id=' + id,
    method: 'delete'
  })
}
