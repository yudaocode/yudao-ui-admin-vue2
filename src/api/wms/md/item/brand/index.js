import request from '@/utils/request'

// 商品品牌 API
export const ItemBrandApi = {
  getItemBrandPage: (params) => request({ url: '/wms/item-brand/page', method: 'get', params }),
  getItemBrandSimpleList: () => request({ url: '/wms/item-brand/simple-list', method: 'get' }),
  getItemBrand: (id) => request({ url: '/wms/item-brand/get?id=' + id, method: 'get' }),
  createItemBrand: (data) => request({ url: '/wms/item-brand/create', method: 'post', data }),
  updateItemBrand: (data) => request({ url: '/wms/item-brand/update', method: 'put', data }),
  deleteItemBrand: (id) => request({ url: '/wms/item-brand/delete?id=' + id, method: 'delete' }),
  exportItemBrand: (params) => request({
    url: '/wms/item-brand/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
