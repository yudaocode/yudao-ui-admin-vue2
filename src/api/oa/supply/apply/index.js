import request from '@/utils/request'

// 查询本人领用申请分页
export function getSupplyApplyPage(params) {
  return request({ url: '/oa/supply-apply/page', method: 'get', params })
}

// 查询领用申请详情
export function getSupplyApply(id) {
  return request({ url: '/oa/supply-apply/get?id=' + id, method: 'get' })
}

// 新增领用申请
export function createSupplyApply(data) {
  return request({ url: '/oa/supply-apply/create', method: 'post', data })
}

// 修改领用申请
export function updateSupplyApply(data) {
  return request({ url: '/oa/supply-apply/update', method: 'put', data })
}

// 删除领用申请
export function deleteSupplyApply(id) {
  return request({ url: '/oa/supply-apply/delete?id=' + id, method: 'delete' })
}

// 提交领用申请
export function submitSupplyApply(id) {
  return request({ url: '/oa/supply-apply/submit?id=' + id, method: 'put' })
}

// 取消领用申请
export function cancelSupplyApply(id) {
  return request({ url: '/oa/supply-apply/cancel?id=' + id, method: 'put' })
}
