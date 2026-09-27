import request from '@/utils/request'

/** CRM 业绩目标对象类型 */
export const PerformanceConfigObjectTypeEnum = Object.freeze({
  DEPT: 2,
  USER: 3
})

// 业绩目标设置 API
export const PerformanceConfigApi = {
  // 查询业绩目标设置分页
  getPerformanceConfigPage(params) {
    return request({
      url: '/crm/performance-config/page',
      method: 'get',
      params
    })
  },

  // 获得业绩目标设置详情
  getPerformanceConfig(id) {
    return request({
      url: '/crm/performance-config/get?id=' + id,
      method: 'get'
    })
  },

  // 新增业绩目标设置
  createPerformanceConfig(data) {
    return request({
      url: '/crm/performance-config/create',
      method: 'post',
      data
    })
  },

  // 修改业绩目标设置
  updatePerformanceConfig(data) {
    return request({
      url: '/crm/performance-config/update',
      method: 'put',
      data
    })
  },

  // 删除业绩目标设置
  deletePerformanceConfig(id) {
    return request({
      url: '/crm/performance-config/delete?id=' + id,
      method: 'delete'
    })
  }
}
