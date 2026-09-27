import request from '@/utils/request'

/**
 * 客户限制配置类型
 */
export const LimitConfType = Object.freeze({
  /** 拥有客户数限制 */
  CUSTOMER_QUANTITY_LIMIT: 1,
  /** 锁定客户数限制 */
  CUSTOMER_LOCK_LIMIT: 2
})

// 查询客户限制配置列表
export function getCustomerLimitConfigPage(params) {
  return request({
    url: '/crm/customer-limit-config/page',
    method: 'get',
    params
  })
}

// 查询客户限制配置详情
export function getCustomerLimitConfig(id) {
  return request({
    url: '/crm/customer-limit-config/get?id=' + id,
    method: 'get'
  })
}

// 新增客户限制配置
export function createCustomerLimitConfig(data) {
  return request({
    url: '/crm/customer-limit-config/create',
    method: 'post',
    data
  })
}

// 修改客户限制配置
export function updateCustomerLimitConfig(data) {
  return request({
    url: '/crm/customer-limit-config/update',
    method: 'put',
    data
  })
}

// 删除客户限制配置
export function deleteCustomerLimitConfig(id) {
  return request({
    url: '/crm/customer-limit-config/delete?id=' + id,
    method: 'delete'
  })
}
