import request, { getBaseHeader } from '@/utils/request'

function getStreamUrl() {
  const baseUrl = (process.env.VUE_APP_BASE_API || '').replace(/\/$/, '')
  const apiBaseUrl = /\/admin-api$/.test(baseUrl) ? baseUrl : baseUrl + '/admin-api'
  return apiBaseUrl + '/ai/chat/message/send-stream'
}

function getStreamHeaders() {
  const baseHeaders = getBaseHeader()
  return Object.keys(baseHeaders).reduce((headers, key) => {
    if (baseHeaders[key] !== undefined && baseHeaders[key] !== null) {
      headers[key] = baseHeaders[key]
    }
    return headers
  }, { 'Content-Type': 'application/json' })
}

function parseEventBlock(block) {
  const event = { data: '', event: '', id: '', retry: undefined }
  const data = []
  block.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').forEach(line => {
    if (!line || line.charAt(0) === ':') return
    const separator = line.indexOf(':')
    const field = separator === -1 ? line : line.slice(0, separator)
    let value = separator === -1 ? '' : line.slice(separator + 1)
    if (value.charAt(0) === ' ') value = value.slice(1)
    if (field === 'data') data.push(value)
    else if (field === 'event') event.event = value
    else if (field === 'id') event.id = value
    else if (field === 'retry' && /^\d+$/.test(value)) event.retry = Number(value)
  })
  event.data = data.join('\n')
  return event
}

async function sendChatMessageStream(
  conversationId,
  content,
  ctrl,
  enableContext,
  enableWebSearch,
  onMessage,
  onError,
  onClose,
  attachmentUrls
) {
  const controller = ctrl || new AbortController()
  try {
    const response = await fetch(getStreamUrl(), {
      method: 'POST',
      headers: getStreamHeaders(),
      body: JSON.stringify({
        conversationId,
        content,
        useContext: enableContext,
        useSearch: enableWebSearch,
        attachmentUrls: attachmentUrls || []
      }),
      signal: controller.signal
    })
    if (!response.ok) throw new Error('发送消息失败，HTTP ' + response.status)
    if (!response.body || !response.body.getReader) throw new Error('当前浏览器不支持流式响应')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let done = false
    while (!done) {
      const chunk = await reader.read()
      done = chunk.done
      buffer += decoder.decode(chunk.value || new Uint8Array(), { stream: !chunk.done })
      let boundary = buffer.match(/\r?\n\r?\n/)
      while (boundary && boundary.index !== undefined) {
        const block = buffer.slice(0, boundary.index)
        buffer = buffer.slice(boundary.index + boundary[0].length)
        if (block && onMessage) await onMessage(parseEventBlock(block))
        boundary = buffer.match(/\r?\n\r?\n/)
      }
    }
    if (buffer.trim() && onMessage) await onMessage(parseEventBlock(buffer.trim()))
    if (onClose) onClose()
  } catch (error) {
    if (controller.signal.aborted) return
    if (onError) onError(error)
    throw error
  }
}

/** AI 聊天消息 API */
export const ChatMessageApi = {
  getChatMessageListByConversationId(conversationId) {
    return request({
      url: '/ai/chat/message/list-by-conversation-id?conversationId=' + conversationId,
      method: 'get'
    })
  },
  sendChatMessageStream,
  deleteChatMessage(id) {
    return request({ url: '/ai/chat/message/delete?id=' + id, method: 'delete' })
  },
  deleteByConversationId(conversationId) {
    return request({
      url: '/ai/chat/message/delete-by-conversation-id?conversationId=' + conversationId,
      method: 'delete'
    })
  },
  getChatMessagePage(params) {
    return request({ url: '/ai/chat/message/page', method: 'get', params })
  },
  deleteChatMessageByAdmin(id) {
    return request({ url: '/ai/chat/message/delete-by-admin?id=' + id, method: 'delete' })
  }
}
