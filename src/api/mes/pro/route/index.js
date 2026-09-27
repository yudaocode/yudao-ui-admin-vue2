import request from '@/utils/request'

export const ProRouteApi = {
  getRoutePage: params => request({ url: '/mes/pro/route/page', method: 'get', params }),
  getRouteSimpleList: () => request({ url: '/mes/pro/route/simple-list', method: 'get' }),
  getRoute: id => request({ url: '/mes/pro/route/get?id=' + id, method: 'get' }),
  createRoute: data => request({ url: '/mes/pro/route/create', method: 'post', data }),
  updateRoute: data => request({ url: '/mes/pro/route/update', method: 'put', data }),
  updateRouteStatus: (id, status) =>
    request({
      url: '/mes/pro/route/update-status?id=' + id + '&status=' + status,
      method: 'put'
    }),
  deleteRoute: id => request({ url: '/mes/pro/route/delete?id=' + id, method: 'delete' }),
  exportRoute: params =>
    request({
      url: '/mes/pro/route/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
}
