import request from '@/utils/request'
// MES 供应商退货明细 API
export const WmReturnVendorDetailApi = {
  // 查询供应商退货明细列表（按行编号）
  getReturnVendorDetailListByLineId: async(lineId) => {
    return await request({ method: 'get',
      url: '/mes/wm/return-vendor-detail/list-by-line',
      params: { lineId }
    })
  },
  // 查询供应商退货明细详情
  getReturnVendorDetail: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/return-vendor-detail/get?id=' + id })
  },
  // 新增供应商退货明细
  createReturnVendorDetail: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/return-vendor-detail/create', data })
  },
  // 修改供应商退货明细
  updateReturnVendorDetail: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/return-vendor-detail/update', data })
  },
  // 删除供应商退货明细
  deleteReturnVendorDetail: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/return-vendor-detail/delete?id=' + id })
  }
}

