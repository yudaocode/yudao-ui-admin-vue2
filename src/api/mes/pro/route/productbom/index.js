import request from '@/utils/request'

export const ProRouteProductBomApi = {
  getRouteProductBomList: params =>
    request({ url: '/mes/pro/route-product-bom/list', method: 'get', params }),
  getRouteProductBom: id =>
    request({ url: '/mes/pro/route-product-bom/get?id=' + id, method: 'get' }),
  createRouteProductBom: data =>
    request({ url: '/mes/pro/route-product-bom/create', method: 'post', data }),
  updateRouteProductBom: data =>
    request({ url: '/mes/pro/route-product-bom/update', method: 'put', data }),
  deleteRouteProductBom: id =>
    request({ url: '/mes/pro/route-product-bom/delete?id=' + id, method: 'delete' })
}
