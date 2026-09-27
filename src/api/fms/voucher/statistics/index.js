import request from '@/utils/request'

// FMS 凭证汇总 API
export const FmsVoucherStatisticsApi = {
  // 查询凭证汇总列表
  getVoucherStatisticsList(params) {
    return request({ url: '/fms/voucher/statistics/list', method: 'get', params })
  },

  // 导出凭证汇总 Excel
  exportVoucherStatistics(params) {
    return request({
      url: '/fms/voucher/statistics/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  }
}
