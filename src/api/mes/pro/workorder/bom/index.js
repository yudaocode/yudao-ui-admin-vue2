import request from '@/utils/request'

export const ProWorkOrderBomApi = {
  getWorkOrderBomPage: params =>
    request({ url: '/mes/pro/work-order-bom/page', method: 'get', params }),
  getWorkOrderBom: id => request({ url: '/mes/pro/work-order-bom/get?id=' + id, method: 'get' }),
  createWorkOrderBom: data =>
    request({ url: '/mes/pro/work-order-bom/create', method: 'post', data }),
  updateWorkOrderBom: data =>
    request({ url: '/mes/pro/work-order-bom/update', method: 'put', data }),
  deleteWorkOrderBom: id =>
    request({ url: '/mes/pro/work-order-bom/delete?id=' + id, method: 'delete' }),
  getWorkOrderBomItemListByWorkOrderId: workOrderId =>
    request({
      url: '/mes/pro/work-order-bom/item-list-by-work-order-id?workOrderId=' + workOrderId,
      method: 'get'
    })
}
