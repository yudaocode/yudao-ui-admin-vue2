import request from '@/utils/request'

/** FMS 首页 API */
export const FmsHomeApi = {
  // 查询首页数据
  getHome(accountSetId) {
    return request({
      url: '/fms/home/get',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 查询首页财务指标明细
  getHomeMetricDetail(accountSetId, metricKey) {
    return request({
      url: '/fms/home/metric-detail',
      method: 'get',
      params: { accountSetId, metricKey }
    })
  }
}
