import request from '@/utils/request'

// 查询限时折扣活动列表
export function getDiscountActivityPage(params) {
  return request({
    url: '/promotion/discount-activity/page',
    method: 'get',
    params
  })
}

// 查询限时折扣活动详情
export function getDiscountActivity(id) {
  return request({
    url: '/promotion/discount-activity/get?id=' + id,
    method: 'get'
  })
}

// 新增限时折扣活动
export function createDiscountActivity(data) {
  return request({
    url: '/promotion/discount-activity/create',
    method: 'post',
    data
  })
}

// 修改限时折扣活动
export function updateDiscountActivity(data) {
  return request({
    url: '/promotion/discount-activity/update',
    method: 'put',
    data
  })
}

// 关闭限时折扣活动
export function closeDiscountActivity(id) {
  return request({
    url: '/promotion/discount-activity/close?id=' + id,
    method: 'put'
  })
}

// 删除限时折扣活动
export function deleteDiscountActivity(id) {
  return request({
    url: '/promotion/discount-activity/delete?id=' + id,
    method: 'delete'
  })
}
