import request from '@/utils/request'

// 新增满减送活动
export function createRewardActivity(data) {
  return request({
    url: '/promotion/reward-activity/create',
    method: 'post',
    data
  })
}

// 更新满减送活动
export function updateRewardActivity(data) {
  return request({
    url: '/promotion/reward-activity/update',
    method: 'put',
    data
  })
}

// 查询满减送活动列表
export function getRewardActivityPage(params) {
  return request({
    url: '/promotion/reward-activity/page',
    method: 'get',
    params
  })
}

// 查询满减送活动详情
export function getReward(id) {
  return request({
    url: '/promotion/reward-activity/get?id=' + id,
    method: 'get'
  })
}

// 删除满减送活动
export function deleteRewardActivity(id) {
  return request({
    url: '/promotion/reward-activity/delete?id=' + id,
    method: 'delete'
  })
}

// 关闭满减送活动
export function closeRewardActivity(id) {
  return request({
    url: '/promotion/reward-activity/close?id=' + id,
    method: 'put'
  })
}
