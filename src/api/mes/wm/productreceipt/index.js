import request from '@/utils/request'
// MES 产品入库单 API
export const WmProductReceiptApi = {
  // 查询产品入库单分页
  getProductReceiptPage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/product-receipt/page', params })
  },
  // 查询产品入库单详情
  getProductReceipt: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/product-receipt/get?id=' + id })
  },
  // 新增产品入库单
  createProductReceipt: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/product-receipt/create', data })
  },
  // 修改产品入库单
  updateProductReceipt: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/product-receipt/update', data })
  },
  // 删除产品入库单
  deleteProductReceipt: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/product-receipt/delete?id=' + id })
  },
  // 提交产品入库单
  submitProductReceipt: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/product-receipt/submit?id=' + id })
  },
  // 执行上架
  stockProductReceipt: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/product-receipt/stock?id=' + id })
  },
  // 执行入库
  finishProductReceipt: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/product-receipt/finish?id=' + id })
  },
  // 取消产品入库单
  cancelProductReceipt: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/product-receipt/cancel?id=' + id })
  },
  // 校验产品入库单明细数量
  checkProductReceiptQuantity: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/product-receipt/check-quantity?id=' + id })
  },
  // 导出产品入库单 Excel
  exportProductReceipt: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: '/mes/wm/product-receipt/export-excel', params })
  }
}

