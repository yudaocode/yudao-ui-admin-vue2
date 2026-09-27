import request from '@/utils/request'

// 查询自提门店列表
export function getDeliveryPickUpStorePage(params) {
  return request({
    url: '/trade/delivery/pick-up-store/page',
    method: 'get',
    params
  })
}

// 查询自提门店详情
export function getDeliveryPickUpStore(id) {
  return request({
    url: '/trade/delivery/pick-up-store/get?id=' + id,
    method: 'get'
  })
}

// 查询自提门店精简列表
export function getSimpleDeliveryPickUpStoreList() {
  return request({
    url: '/trade/delivery/pick-up-store/simple-list',
    method: 'get'
  })
}

// 新增自提门店
export function createDeliveryPickUpStore(data) {
  return request({
    url: '/trade/delivery/pick-up-store/create',
    method: 'post',
    data
  })
}

// 修改自提门店
export function updateDeliveryPickUpStore(data) {
  return request({
    url: '/trade/delivery/pick-up-store/update',
    method: 'put',
    data
  })
}

// 删除自提门店
export function deleteDeliveryPickUpStore(id) {
  return request({
    url: '/trade/delivery/pick-up-store/delete?id=' + id,
    method: 'delete'
  })
}

// 绑定自提门店店员
export function bindStoreStaffId(data) {
  return request({
    url: '/trade/delivery/pick-up-store/bind',
    method: 'post',
    data
  })
}
