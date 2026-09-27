import request from '@/utils/request'

// 用户端表情包项（精简版）

// 拉取所有启用的系统表情包（含表情列表）
export const getFacePackList = () => {
  return request({
    url: '/im/face-pack/list',
    method: 'get' })
}
