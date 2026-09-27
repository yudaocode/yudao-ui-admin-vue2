import request from '@/utils/request'

// MES 采购入库单行 API
export const WmItemReceiptLineApi = {
  getItemReceiptLinePage: async(params) => request({ url: '/mes/wm/item-receipt-line/page', method: 'get', params }),
  getItemReceiptLine: async(id) => request({ url: '/mes/wm/item-receipt-line/get?id=' + id, method: 'get' }),
  createItemReceiptLine: async(data) => request({ url: '/mes/wm/item-receipt-line/create', method: 'post', data }),
  updateItemReceiptLine: async(data) => request({ url: '/mes/wm/item-receipt-line/update', method: 'put', data }),
  deleteItemReceiptLine: async(id) => request({ url: '/mes/wm/item-receipt-line/delete?id=' + id, method: 'delete' })
}
