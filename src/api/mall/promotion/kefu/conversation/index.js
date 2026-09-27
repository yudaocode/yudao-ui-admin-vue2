import request from '@/utils/request'

// 客服会话 API
export const KeFuConversationApi = {
  // 获得客服会话列表
  getConversationList() {
    return request({
      url: '/promotion/kefu-conversation/list',
      method: 'get'
    })
  },
  // 获得客服会话
  getConversation(id) {
    return request({
      url: '/promotion/kefu-conversation/get?id=' + id,
      method: 'get'
    })
  },
  // 客服会话置顶
  updateConversationPinned(data) {
    return request({
      url: '/promotion/kefu-conversation/update-conversation-pinned',
      method: 'put',
      data
    })
  },
  // 删除客服会话
  deleteConversation(id) {
    return request({
      url: '/promotion/kefu-conversation/delete?id=' + id,
      method: 'delete'
    })
  }
}
