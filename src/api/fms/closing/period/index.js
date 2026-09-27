import request from '@/utils/request'

// FMS 结账期间 API
export const FmsClosingPeriodApi = {
  // 查询当前会计期间
  getCurrentMonth(accountSetId) {
    return request({
      url: '/fms/closing/period/current-month',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 查询结账概况
  getClosingOverview(params) {
    return request({
      url: '/fms/closing/period/overview',
      method: 'get',
      params
    })
  },

  // 结账
  closePeriod(data) {
    return request({
      url: '/fms/closing/period/close',
      method: 'put',
      data
    })
  },

  // 反结账
  cancelClosePeriod(params) {
    return request({
      url: '/fms/closing/period/cancel',
      method: 'delete',
      params
    })
  }
}
