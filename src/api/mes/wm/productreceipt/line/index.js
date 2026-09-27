import request from '@/utils/request'
// MES 产品入库单行 API
export const WmProductReceiptLineApi = {
  // 查询产品入库单行分页
  getProductReceiptLinePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/product-receipt-line/page', params })
  },
  // 查询产品入库单行详情
  getProductReceiptLine: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/product-receipt-line/get?id=' + id })
  },
  // 新增产品入库单行
  createProductReceiptLine: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/product-receipt-line/create', data })
  },
  // 修改产品入库单行
  updateProductReceiptLine: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/product-receipt-line/update', data })
  },
  // 删除产品入库单行
  deleteProductReceiptLine: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/product-receipt-line/delete?id=' + id })
  }
}

