import request from '@/utils/request'

export const ProWorkOrderApi = {
  getWorkOrderPage: params => request({ url: '/mes/pro/work-order/page', method: 'get', params }),
  getWorkOrder: id => request({ url: '/mes/pro/work-order/get?id=' + id, method: 'get' }),
  createWorkOrder: data => request({ url: '/mes/pro/work-order/create', method: 'post', data }),
  updateWorkOrder: data => request({ url: '/mes/pro/work-order/update', method: 'put', data }),
  deleteWorkOrder: id =>
    request({ url: '/mes/pro/work-order/delete?id=' + id, method: 'delete' }),
  exportWorkOrder: params =>
    request({
      url: '/mes/pro/work-order/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    }),
  finishWorkOrder: id => request({ url: '/mes/pro/work-order/finish?id=' + id, method: 'put' }),
  cancelWorkOrder: id => request({ url: '/mes/pro/work-order/cancel?id=' + id, method: 'put' }),
  confirmWorkOrder: id => request({ url: '/mes/pro/work-order/confirm?id=' + id, method: 'put' })
}
