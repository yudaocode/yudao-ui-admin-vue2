import request from '@/utils/request'

// AI 聊天角色 API
export const ChatRoleApi = {
  // 查询聊天角色分页
  getChatRolePage(params) {
    return request({ url: '/ai/chat-role/page', method: 'get', params })
  },

  // 查询聊天角色详情
  getChatRole(id) {
    return request({ url: '/ai/chat-role/get?id=' + id, method: 'get' })
  },

  // 新增聊天角色
  createChatRole(data) {
    return request({ url: '/ai/chat-role/create', method: 'post', data })
  },

  // 修改聊天角色
  updateChatRole(data) {
    return request({ url: '/ai/chat-role/update', method: 'put', data })
  },

  // 删除聊天角色
  deleteChatRole(id) {
    return request({ url: '/ai/chat-role/delete?id=' + id, method: 'delete' })
  },

  // 获取我的角色分页
  getMyPage(params) {
    return request({ url: '/ai/chat-role/my-page', method: 'get', params })
  },

  // 获取角色分类
  getCategoryList() {
    return request({ url: '/ai/chat-role/category-list', method: 'get' })
  },

  // 创建我的角色
  createMy(data) {
    return request({ url: '/ai/chat-role/create-my', method: 'post', data })
  },

  // 更新我的角色
  updateMy(data) {
    return request({ url: '/ai/chat-role/update-my', method: 'put', data })
  },

  // 删除我的角色
  deleteMy(id) {
    return request({ url: '/ai/chat-role/delete-my?id=' + id, method: 'delete' })
  }
}
