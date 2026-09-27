import request from '@/utils/request'

export const ProRouteProcessApi = {
  getRouteProcessListByRoute: routeId =>
    request({ url: '/mes/pro/route-process/list-by-route?routeId=' + routeId, method: 'get' }),
  getRouteProcessListByProduct: productId =>
    request({
      url: '/mes/pro/route-process/list-by-product?productId=' + productId,
      method: 'get'
    }),
  getRouteProcess: id => request({ url: '/mes/pro/route-process/get?id=' + id, method: 'get' }),
  getRouteProcessByRouteAndProcess: (routeId, processId) =>
    request({
      url: '/mes/pro/route-process/get-by-route-and-process',
      method: 'get',
      params: { routeId, processId }
    }),
  createRouteProcess: data =>
    request({ url: '/mes/pro/route-process/create', method: 'post', data }),
  updateRouteProcess: data =>
    request({ url: '/mes/pro/route-process/update', method: 'put', data }),
  deleteRouteProcess: id =>
    request({ url: '/mes/pro/route-process/delete?id=' + id, method: 'delete' })
}
