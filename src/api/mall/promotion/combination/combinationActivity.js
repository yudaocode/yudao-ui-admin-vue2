import request from '@/utils/request'

// 查询拼团活动列表
export function getCombinationActivityPage(params) {
  return request({
    url: '/promotion/combination-activity/page',
    method: 'get',
    params
  })
}

// 查询拼团活动详情
export function getCombinationActivity(id) {
  return request({
    url: '/promotion/combination-activity/get?id=' + id,
    method: 'get'
  })
}

// 获得拼团活动列表，基于活动编号数组
export function getCombinationActivityListByIds(ids) {
  const list = Array.isArray(ids) ? ids : [ids]
  return request({
    url: '/promotion/combination-activity/list-by-ids?ids=' + list.join(','),
    method: 'get'
  })
}

// 新增拼团活动
export function createCombinationActivity(data) {
  return request({
    url: '/promotion/combination-activity/create',
    method: 'post',
    data
  })
}

// 修改拼团活动
export function updateCombinationActivity(data) {
  return request({
    url: '/promotion/combination-activity/update',
    method: 'put',
    data
  })
}

// 关闭拼团活动
export function closeCombinationActivity(id) {
  return request({
    url: '/promotion/combination-activity/close?id=' + id,
    method: 'put'
  })
}

// 删除拼团活动
export function deleteCombinationActivity(id) {
  return request({
    url: '/promotion/combination-activity/delete?id=' + id,
    method: 'delete'
  })
}
