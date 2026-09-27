import request from '@/utils/request'

// FMS 币别 API
export const FmsCurrencyApi = {
  // 查询币别列表
  getCurrencyList: async(accountSetId) => {
    return await request({
      url: '/fms/config/currency/list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 查询币别精简列表
  getCurrencySimpleList: async(accountSetId) => {
    return await request({
      url: '/fms/config/currency/simple-list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 新增币别
  createCurrency: async(data) => {
    return await request({ url: '/fms/config/currency/create', method: 'post', data })
  },

  // 修改币别
  updateCurrency: async(data) => {
    return await request({ url: '/fms/config/currency/update', method: 'put', data })
  },

  // 删除币别
  deleteCurrency: async(accountSetId, id) => {
    return await request({
      url: '/fms/config/currency/delete',
      method: 'delete',
      params: { accountSetId, id }
    })
  }
}
