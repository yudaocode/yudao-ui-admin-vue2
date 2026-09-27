import request from '@/utils/request'

export function getContractConfig() {
  return request({ url: '/crm/contract-config/get', method: 'get' })
}

export function saveContractConfig(data) {
  return request({ url: '/crm/contract-config/save', method: 'put', data })
}
