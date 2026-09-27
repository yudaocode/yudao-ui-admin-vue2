import request from '@/utils/request'

export const WmBarcodeApi = {
  getBarcodePage: async(params) => request({ url: '/mes/wm/barcode/page', method: 'get', params }),
  getBarcode: async(id) => request({ url: '/mes/wm/barcode/get?id=' + id, method: 'get' }),
  getBarcodeByBusiness: async(bizType, bizId) => request({ url: '/mes/wm/barcode/get-by-business', method: 'get', params: { bizType, bizId }}),
  createBarcode: async(data) => request({ url: '/mes/wm/barcode/create', method: 'post', data }),
  updateBarcode: async(data) => request({ url: '/mes/wm/barcode/update', method: 'put', data }),
  deleteBarcode: async(id) => request({ url: '/mes/wm/barcode/delete?id=' + id, method: 'delete' }),
  exportBarcode: async(params) => request({ url: '/mes/wm/barcode/export-excel', method: 'get', params, responseType: 'blob' }),
  generateBarcodeContent: async(bizType, bizCode) => request({ url: '/mes/wm/barcode/generate-content', method: 'get', params: { bizType, bizCode }})
}
