import request from '@/utils/request'

export function getSeckillActivityPage(params) {
  return request({ url: '/promotion/seckill-activity/page', method: 'get', params })
}

export function getSeckillActivityListByIds(ids) {
  return request({ url: '/promotion/seckill-activity/list-by-ids?ids=' + ids, method: 'get' })
}

export function getSeckillActivity(id) {
  return request({ url: '/promotion/seckill-activity/get?id=' + id, method: 'get' })
}

export function createSeckillActivity(data) {
  return request({ url: '/promotion/seckill-activity/create', method: 'post', data })
}

export function updateSeckillActivity(data) {
  return request({ url: '/promotion/seckill-activity/update', method: 'put', data })
}

export function closeSeckillActivity(id) {
  return request({ url: '/promotion/seckill-activity/close?id=' + id, method: 'put' })
}

export function deleteSeckillActivity(id) {
  return request({ url: '/promotion/seckill-activity/delete?id=' + id, method: 'delete' })
}
