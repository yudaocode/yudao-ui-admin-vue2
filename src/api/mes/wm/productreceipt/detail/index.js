import request from '@/utils/request'
// MES 产品入库单明细 API
export const WmProductReceiptDetailApi = {
  // 查询产品入库单明细列表
  getProductReceiptDetailList: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/product-receipt-detail/list', params })
  },
  // 根据行项目ID查询产品入库单明细列表
  getProductReceiptDetailListByLineId: async(lineId) => {
    return await request({ method: 'get',
      url: '/mes/wm/product-receipt-detail/list-by-line',
      params: { lineId }
    })
  },
  // 查询产品入库单明细详情
  getProductReceiptDetail: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/product-receipt-detail/get?id=' + id })
  },
  // 新增产品入库单明细
  createProductReceiptDetail: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/product-receipt-detail/create', data })
  },
  // 修改产品入库单明细
  updateProductReceiptDetail: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/product-receipt-detail/update', data })
  },
  // 删除产品入库单明细
  deleteProductReceiptDetail: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/product-receipt-detail/delete?id=' + id })
  }
}

