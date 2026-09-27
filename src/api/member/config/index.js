import request from '@/utils/request'

// 获得会员积分配置
export function getConfig() {
  return request({
    url: '/member/config/get',
    method: 'get'
  })
}

// 保存会员积分配置
export function saveConfig(data) {
  return request({
    url: '/member/config/save',
    method: 'put',
    data: data
  })
}
