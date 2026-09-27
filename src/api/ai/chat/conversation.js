import request from '@/utils/request'

/** AI 聊天对话 API */
export const ChatConversationApi = {
  getChatConversationMy(id) {
    return request({ url: '/ai/chat/conversation/get-my?id=' + id, method: 'get' })
  },
  createChatConversationMy(data) {
    return request({ url: '/ai/chat/conversation/create-my', method: 'post', data })
  },
  updateChatConversationMy(data) {
    return request({ url: '/ai/chat/conversation/update-my', method: 'put', data })
  },
  deleteChatConversationMy(id) {
    return request({ url: '/ai/chat/conversation/delete-my?id=' + id, method: 'delete' })
  },
  deleteChatConversationMyByUnpinned() {
    return request({ url: '/ai/chat/conversation/delete-by-unpinned', method: 'delete' })
  },
  getChatConversationMyList() {
    return request({ url: '/ai/chat/conversation/my-list', method: 'get' })
  },
  getChatConversationPage(params) {
    return request({ url: '/ai/chat/conversation/page', method: 'get', params })
  },
  deleteChatConversationByAdmin(id) {
    return request({ url: '/ai/chat/conversation/delete-by-admin?id=' + id, method: 'delete' })
  }
}
