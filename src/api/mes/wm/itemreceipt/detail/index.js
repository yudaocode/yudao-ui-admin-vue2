import request from '@/utils/request'

export const WmItemReceiptDetailApi = {
  getItemReceiptDetailListByLineId: async(lineId) => request({ url: '/mes/wm/item-receipt-detail/list-by-line', method: 'get', params: { lineId }}),
  getItemReceiptDetail: async(id) => request({ url: '/mes/wm/item-receipt-detail/get?id=' + id, method: 'get' }),
  createItemReceiptDetail: async(data) => request({ url: '/mes/wm/item-receipt-detail/create', method: 'post', data }),
  updateItemReceiptDetail: async(data) => request({ url: '/mes/wm/item-receipt-detail/update', method: 'put', data }),
  deleteItemReceiptDetail: async(id) => request({ url: '/mes/wm/item-receipt-detail/delete?id=' + id, method: 'delete' })
}
