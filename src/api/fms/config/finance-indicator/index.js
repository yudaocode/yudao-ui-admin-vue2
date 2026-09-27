import request from '@/utils/request'

/** FMS 财务指标 API */
export const FmsFinanceIndicatorApi = {
  // 查询财务指标详情
  getFinanceIndicator(accountSetId, id) {
    return request({
      url: '/fms/config/finance-indicator/get',
      method: 'get',
      params: { accountSetId, id }
    })
  },

  // 查询财务指标列表
  getFinanceIndicatorList(accountSetId) {
    return request({
      url: '/fms/config/finance-indicator/list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 新增财务指标
  createFinanceIndicator(data) {
    return request({ url: '/fms/config/finance-indicator/create', method: 'post', data })
  },

  // 修改财务指标
  updateFinanceIndicator(data) {
    return request({ url: '/fms/config/finance-indicator/update', method: 'put', data })
  },

  // 删除财务指标
  deleteFinanceIndicator(accountSetId, id) {
    return request({
      url: '/fms/config/finance-indicator/delete',
      method: 'delete',
      params: { accountSetId, id }
    })
  }
}
