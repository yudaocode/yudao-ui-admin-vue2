import request from '@/utils/request'

export const SeckillConfigApi = {
  getSeckillConfigPage(params) {
    return request({ url: '/promotion/seckill-config/page', method: 'get', params })
  },

  getSimpleSeckillConfigList() {
    return request({ url: '/promotion/seckill-config/list', method: 'get' })
  },

  getSeckillConfig(id) {
    return request({ url: '/promotion/seckill-config/get?id=' + id, method: 'get' })
  },

  createSeckillConfig(data) {
    return request({ url: '/promotion/seckill-config/create', method: 'post', data })
  },

  updateSeckillConfig(data) {
    return request({ url: '/promotion/seckill-config/update', method: 'put', data })
  },

  deleteSeckillConfig(id) {
    return request({ url: '/promotion/seckill-config/delete?id=' + id, method: 'delete' })
  },

  updateSeckillConfigStatus(id, status) {
    return request({
      url: '/promotion/seckill-config/update-status',
      method: 'put',
      data: { id, status }
    })
  }
}
