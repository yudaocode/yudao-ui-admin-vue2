import request from '@/utils/request'
// MES 杂项入库单行 API
export const WmMiscReceiptLineApi = {
  // 查询杂项入库单行详情
  getMiscReceiptLine: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/misc-receipt-line/get?id=' + id })
  },
  // 查询杂项入库单行列表
  getMiscReceiptLineListByReceiptId: async(receiptId) => {
    return await request({ method: 'get',
      url: '/mes/wm/misc-receipt-line/list-by-receipt-id?receiptId=' + receiptId
    })
  },
  // 新增杂项入库单行
  createMiscReceiptLine: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/misc-receipt-line/create', data })
  },
  // 修改杂项入库单行
  updateMiscReceiptLine: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/misc-receipt-line/update', data })
  },
  // 删除杂项入库单行
  deleteMiscReceiptLine: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/misc-receipt-line/delete?id=' + id })
  }
}

