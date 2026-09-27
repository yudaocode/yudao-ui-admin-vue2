import request from '@/utils/request'

// 商品 SKU API
export const ItemSkuApi = {
  getItemSkuPage: (params) => request({ url: '/wms/item-sku/page', method: 'get', params })
}
