import request from '@/utils/request'

/** FMS 财务参数 API */
export const FmsFinanceParameterApi = {
  // 查询财务参数
  getFinanceParameter(accountSetId) {
    return request({
      url: '/fms/config/finance-parameter/get',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 修改财务参数
  updateFinanceParameter(data) {
    return request({ url: '/fms/config/finance-parameter/update', method: 'put', data })
  }
}
