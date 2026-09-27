import request from '@/utils/request'

// 快递运费模板精简列表（商品发布物流设置使用）
export function getSimpleTemplateList() {
  return request({
    url: '/trade/delivery/express-template/list-all-simple',
    method: 'get'
  })
}

export function getDeliveryExpressTemplatePage(query) {
  return request({
    url: '/trade/delivery/express-template/page',
    method: 'get',
    params: query
  })
}

export function getDeliveryExpressTemplate(id) {
  return request({
    url: '/trade/delivery/express-template/get?id=' + id,
    method: 'get'
  })
}

// 新增快递运费模板
export function createDeliveryExpressTemplate(data) {
  return request({
    url: '/trade/delivery/express-template/create',
    method: 'post',
    data
  })
}

// 修改快递运费模板
export function updateDeliveryExpressTemplate(data) {
  return request({
    url: '/trade/delivery/express-template/update',
    method: 'put',
    data
  })
}

// 删除快递运费模板
export function deleteDeliveryExpressTemplate(id) {
  return request({
    url: '/trade/delivery/express-template/delete?id=' + id,
    method: 'delete'
  })
}
