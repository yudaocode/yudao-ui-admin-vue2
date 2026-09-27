import request from '@/utils/request'

export const ProRouteProductApi = {
  getRouteProductListByRoute: routeId =>
    request({ url: '/mes/pro/route-product/list-by-route?routeId=' + routeId, method: 'get' }),
  getRouteProduct: id => request({ url: '/mes/pro/route-product/get?id=' + id, method: 'get' }),
  createRouteProduct: data =>
    request({ url: '/mes/pro/route-product/create', method: 'post', data }),
  updateRouteProduct: data =>
    request({ url: '/mes/pro/route-product/update', method: 'put', data }),
  deleteRouteProduct: id =>
    request({ url: '/mes/pro/route-product/delete?id=' + id, method: 'delete' })
}
