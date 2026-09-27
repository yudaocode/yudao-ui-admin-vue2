import request from '@/utils/request'

// MES 供应商 API
export const MdVendorApi = {
  // 查询供应商分页
  getVendorPage: async(params) => {
    return await request({ url: '/mes/md-vendor/page', method: 'get', params })
  },

  // 查询供应商详情
  getVendor: async(id) => {
    return await request({ url: '/mes/md-vendor/get?id=' + id, method: 'get' })
  },

  // 新增供应商
  createVendor: async(data) => {
    return await request({ url: '/mes/md-vendor/create', method: 'post', data })
  },

  // 修改供应商
  updateVendor: async(data) => {
    return await request({ url: '/mes/md-vendor/update', method: 'put', data })
  },

  // 删除供应商
  deleteVendor: async(id) => {
    return await request({ url: '/mes/md-vendor/delete?id=' + id, method: 'delete' })
  },

  // 导出供应商 Excel
  exportVendor: async(params) => {
    return await request({
      url: '/mes/md-vendor/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  // 下载供应商导入模板
  importTemplate: async() => {
    return await request({
      url: '/mes/md-vendor/get-import-template',
      method: 'get',
      responseType: 'blob'
    })
  }
}
