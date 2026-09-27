import request from '@/utils/request'

// WMS 往来企业 API
export const MerchantApi = {
  // 查询往来企业分页
  getMerchantPage: async(params) => {
    return await request({ url: '/wms/merchant/page', method: 'get', params })
  },

  // 查询往来企业精简列表
  getMerchantSimpleList: async(params) => {
    return await request({ url: '/wms/merchant/simple-list', method: 'get', params })
  },

  // 查询往来企业详情
  getMerchant: async(id) => {
    return await request({ url: '/wms/merchant/get?id=' + id, method: 'get' })
  },

  // 新增往来企业
  createMerchant: async(data) => {
    return await request({ url: '/wms/merchant/create', method: 'post', data })
  },

  // 修改往来企业
  updateMerchant: async(data) => {
    return await request({ url: '/wms/merchant/update', method: 'put', data })
  },

  // 删除往来企业
  deleteMerchant: async(id) => {
    return await request({ url: '/wms/merchant/delete?id=' + id, method: 'delete' })
  },

  // 导出往来企业
  exportMerchant: async(params) => {
    return await request({
      url: '/wms/merchant/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  }
}
