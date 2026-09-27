import request from '@/utils/request'

// 查询快递公司列表
export function getDeliveryExpressPage(params) {
  return request({
    url: '/trade/delivery/express/page',
    method: 'get',
    params
  })
}

// 查询快递公司详情
export function getDeliveryExpress(id) {
  return request({
    url: '/trade/delivery/express/get?id=' + id,
    method: 'get'
  })
}

// 获得快递公司精简信息列表
export function getSimpleDeliveryExpressList() {
  return request({
    url: '/trade/delivery/express/list-all-simple',
    method: 'get'
  })
}

// 新增快递公司
export function createDeliveryExpress(data) {
  return request({
    url: '/trade/delivery/express/create',
    method: 'post',
    data
  })
}

// 修改快递公司
export function updateDeliveryExpress(data) {
  return request({
    url: '/trade/delivery/express/update',
    method: 'put',
    data
  })
}

// 删除快递公司
export function deleteDeliveryExpress(id) {
  return request({
    url: '/trade/delivery/express/delete?id=' + id,
    method: 'delete'
  })
}

// 导出快递公司 Excel
export function exportDeliveryExpressApi(params) {
  return request({
    url: '/trade/delivery/express/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
