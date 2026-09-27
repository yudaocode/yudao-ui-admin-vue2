import request from '@/utils/request'
// MES 杂项入库单 API
export const WmMiscReceiptApi = {
  // 查询杂项入库单分页
  getMiscReceiptPage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/misc-receipt/page', params })
  },
  // 查询杂项入库单详情
  getMiscReceipt: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/misc-receipt/get?id=' + id })
  },
  // 新增杂项入库单
  createMiscReceipt: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/misc-receipt/create', data })
  },
  // 修改杂项入库单
  updateMiscReceipt: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/misc-receipt/update', data })
  },
  // 删除杂项入库单
  deleteMiscReceipt: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/misc-receipt/delete?id=' + id })
  },
  // 提交审批
  submitMiscReceipt: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/misc-receipt/submit?id=' + id })
  },
  // 执行入库
  finishMiscReceipt: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/misc-receipt/finish?id=' + id })
  },
  // 取消杂项入库单
  cancelMiscReceipt: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/misc-receipt/cancel?id=' + id })
  },
  // 导出杂项入库单 Excel
  exportMiscReceipt: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: '/mes/wm/misc-receipt/export-excel', params })
  }
}

