import request from '@/utils/request'

// MES 采购入库单 API
export const WmItemReceiptApi = {
  getItemReceiptPage: async(params) => request({ url: '/mes/wm/item-receipt/page', method: 'get', params }),
  getItemReceipt: async(id) => request({ url: '/mes/wm/item-receipt/get?id=' + id, method: 'get' }),
  createItemReceipt: async(data) => request({ url: '/mes/wm/item-receipt/create', method: 'post', data }),
  updateItemReceipt: async(data) => request({ url: '/mes/wm/item-receipt/update', method: 'put', data }),
  deleteItemReceipt: async(id) => request({ url: '/mes/wm/item-receipt/delete?id=' + id, method: 'delete' }),
  submitItemReceipt: async(id) => request({ url: '/mes/wm/item-receipt/submit?id=' + id, method: 'put' }),
  stockItemReceipt: async(id) => request({ url: '/mes/wm/item-receipt/stock?id=' + id, method: 'put' }),
  finishItemReceipt: async(id) => request({ url: '/mes/wm/item-receipt/finish?id=' + id, method: 'put' }),
  cancelItemReceipt: async(id) => request({ url: '/mes/wm/item-receipt/cancel?id=' + id, method: 'put' }),
  exportItemReceipt: async(params) => request({ url: '/mes/wm/item-receipt/export-excel', method: 'get', params, responseType: 'blob' })
}
