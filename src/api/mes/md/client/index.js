import request from '@/utils/request'

// MES 客户 API
export const MdClientApi = {
  // 查询客户分页
  getClientPage: async(params) => {
    return await request({ url: '/mes/md-client/page', method: 'get', params })
  },

  // 查询客户详情
  getClient: async(id) => {
    return await request({ url: '/mes/md-client/get?id=' + id, method: 'get' })
  },

  // 新增客户
  createClient: async(data) => {
    return await request({ url: '/mes/md-client/create', method: 'post', data })
  },

  // 修改客户
  updateClient: async(data) => {
    return await request({ url: '/mes/md-client/update', method: 'put', data })
  },

  // 删除客户
  deleteClient: async(id) => {
    return await request({ url: '/mes/md-client/delete?id=' + id, method: 'delete' })
  },

  // 导出客户 Excel
  exportClient: async(params) => {
    return await request({
      url: '/mes/md-client/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  // 下载客户导入模板
  importTemplate: async() => {
    return await request({
      url: '/mes/md-client/get-import-template',
      method: 'get',
      responseType: 'blob'
    })
  }
}
