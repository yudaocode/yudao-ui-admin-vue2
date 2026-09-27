import request from '@/utils/request'
// MES 供应商退货单 API
export const WmReturnVendorApi = {
  // 查询供应商退货单分页
  getReturnVendorPage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/return-vendor/page', params })
  },
  // 查询供应商退货单详情
  getReturnVendor: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/return-vendor/get?id=' + id })
  },
  // 新增供应商退货单
  createReturnVendor: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/return-vendor/create', data })
  },
  // 修改供应商退货单
  updateReturnVendor: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/return-vendor/update', data })
  },
  // 删除供应商退货单
  deleteReturnVendor: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/return-vendor/delete?id=' + id })
  },
  // 提交供应商退货单
  submitReturnVendor: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/return-vendor/submit?id=' + id })
  },
  // 执行拣货
  stockReturnVendor: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/return-vendor/stock?id=' + id })
  },
  // 取消供应商退货单
  cancelReturnVendor: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/return-vendor/cancel?id=' + id })
  },
  // 完成供应商退货单（执行退货）
  finishReturnVendor: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/return-vendor/finish?id=' + id })
  },
  // 校验供应商退货单数量（每行明细数量之和是否等于行退货数量）
  checkReturnVendorQuantity: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/return-vendor/check-quantity?id=' + id })
  },
  // 导出供应商退货单 Excel
  exportReturnVendor: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: '/mes/wm/return-vendor/export-excel', params })
  }
}

