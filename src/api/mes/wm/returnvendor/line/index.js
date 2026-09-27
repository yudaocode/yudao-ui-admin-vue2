import request from '@/utils/request'
// MES 供应商退货单行 API
export const WmReturnVendorLineApi = {
  // 查询供应商退货单行分页
  getReturnVendorLinePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/return-vendor-line/page', params })
  },
  // 查询供应商退货单行详情
  getReturnVendorLine: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/return-vendor-line/get?id=' + id })
  },
  // 新增供应商退货单行
  createReturnVendorLine: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/return-vendor-line/create', data })
  },
  // 修改供应商退货单行
  updateReturnVendorLine: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/return-vendor-line/update', data })
  },
  // 删除供应商退货单行
  deleteReturnVendorLine: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/return-vendor-line/delete?id=' + id })
  }
}

