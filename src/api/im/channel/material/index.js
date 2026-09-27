import request from '@/utils/request'

// 用户端能看到的频道素材详情

// 获取频道素材详情；用于客户端点击图文卡片渲染详情页
export const getChannelMaterial = id => {
  return request({
    url: '/im/channel/material/get',
    params: {
      id
    },
    method: 'get' })
}
