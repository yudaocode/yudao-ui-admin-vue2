import request from '@/utils/request'

// 查询交易中心配置详情
export function getTradeConfig() {
  return request({
    url: '/trade/config/get',
    method: 'get'
  })
}

// 保存交易中心配置
export function saveTradeConfig(data) {
  return request({
    url: '/trade/config/save',
    method: 'put',
    data
  })
}
