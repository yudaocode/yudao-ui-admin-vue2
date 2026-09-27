import request from '@/utils/request'

// 客服消息 API
export const KeFuMessageApi = {
  // 发送客服消息
  sendKeFuMessage(data) {
    return request({
      url: '/promotion/kefu-message/send',
      method: 'post',
      data
    })
  },
  // 更新客服消息已读状态
  updateKeFuMessageReadStatus(conversationId) {
    return request({
      url: '/promotion/kefu-message/update-read-status?conversationId=' + conversationId,
      method: 'put'
    })
  },
  // 获得消息列表（流式加载）
  getKeFuMessageList(params) {
    return request({
      url: '/promotion/kefu-message/list',
      method: 'get',
      params
    })
  }
}
