import { KeFuConversationApi } from '@/api/mall/promotion/kefu/conversation'
import { isEmpty } from '@/utils'

const state = {
  conversationList: [],
  conversationMessageList: new Map()
}

const getters = {
  getConversationList: state => state.conversationList,
  getConversationMessageList: state => conversationId => (
    state.conversationMessageList.get(conversationId)
  )
}

const mutations = {
  SET_CONVERSATION_LIST(state, conversationList) {
    state.conversationList = conversationList
  },
  SAVE_MESSAGE_LIST(state, { conversationId, messageList }) {
    state.conversationMessageList.set(conversationId, messageList)
  },
  CLEAR_UNREAD(state, conversationId) {
    const conversation = state.conversationList.find(item => item.id === conversationId)
    if (conversation) conversation.adminUnreadMessageCount = 0
  },
  DELETE_CONVERSATION(state, conversationId) {
    const index = state.conversationList.findIndex(item => item.id === conversationId)
    if (index > -1) state.conversationList.splice(index, 1)
  },
  ADD_CONVERSATION(state, conversation) {
    if (conversation) state.conversationList.push(conversation)
  },
  SORT_CONVERSATIONS(state) {
    state.conversationList.sort((a, b) => {
      if (a.adminPinned !== b.adminPinned) return a.adminPinned ? -1 : 1
      return b.lastMessageTime - a.lastMessageTime
    })
  }
}

const actions = {
  saveMessageList({ commit }, payload) {
    commit('SAVE_MESSAGE_LIST', payload)
  },
  async setConversationList({ commit }) {
    const response = await KeFuConversationApi.getConversationList()
    commit('SET_CONVERSATION_LIST', response.data)
    commit('SORT_CONVERSATIONS')
  },
  updateConversationStatus({ state, commit }, conversationId) {
    if (isEmpty(state.conversationList)) return
    commit('CLEAR_UNREAD', conversationId)
  },
  async updateConversation({ state, commit }, conversationId) {
    if (isEmpty(state.conversationList)) return
    const response = await KeFuConversationApi.getConversation(conversationId)
    commit('DELETE_CONVERSATION', conversationId)
    commit('ADD_CONVERSATION', response.data)
    commit('SORT_CONVERSATIONS')
  },
  deleteConversation({ commit }, conversationId) {
    commit('DELETE_CONVERSATION', conversationId)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
