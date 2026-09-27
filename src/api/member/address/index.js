import request from '@/utils/request'

// 查询用户收件地址列表
export function getAddressList(params) {
  return request({
    url: '/member/address/list',
    method: 'get',
    params: params
  })
}
