import request from '@/utils/request'

// WMS 仓库 API
export const WarehouseApi = {
  // 查询仓库分页
  getWarehousePage: async(params) => {
    return await request({ url: '/wms/warehouse/page', method: 'get', params })
  },

  // 查询仓库精简列表
  getWarehouseSimpleList: async() => {
    return await request({ url: '/wms/warehouse/simple-list', method: 'get' })
  },

  // 查询仓库详情
  getWarehouse: async(id) => {
    return await request({ url: '/wms/warehouse/get?id=' + id, method: 'get' })
  },

  // 新增仓库
  createWarehouse: async(data) => {
    return await request({ url: '/wms/warehouse/create', method: 'post', data })
  },

  // 修改仓库
  updateWarehouse: async(data) => {
    return await request({ url: '/wms/warehouse/update', method: 'put', data })
  },

  // 删除仓库
  deleteWarehouse: async(id) => {
    return await request({ url: '/wms/warehouse/delete?id=' + id, method: 'delete' })
  },

  // 导出仓库
  exportWarehouse: async(params) => {
    return await request({
      url: '/wms/warehouse/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  }
}
