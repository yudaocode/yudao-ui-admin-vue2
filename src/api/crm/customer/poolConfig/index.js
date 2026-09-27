import request from '@/utils/request'

// 获取客户公海规则设置
export function getCustomerPoolConfig() {
  return request({
    url: '/crm/customer-pool-config/get',
    method: 'get'
  })
}

// 更新客户公海规则设置
export function saveCustomerPoolConfig(data) {
  return request({
    url: '/crm/customer-pool-config/save',
    method: 'put',
    data
  })
}
