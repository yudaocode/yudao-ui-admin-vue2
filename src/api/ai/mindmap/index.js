import request from '@/utils/request'
import { getAccessToken, getTenantId, getVisitTenantId } from '@/utils/auth'

function getStreamUrl() {
  const baseUrl = (process.env.VUE_APP_BASE_API || '').replace(/\/$/, '')
  const apiBaseUrl = /\/admin-api$/.test(baseUrl) ? baseUrl : baseUrl + '/admin-api'
  return apiBaseUrl + '/ai/mind-map/generate-stream'
}

function getStreamHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const accessToken = getAccessToken()
  const tenantId = getTenantId()
  const visitTenantId = getVisitTenantId()
  if (accessToken) headers.Authorization = 'Bearer ' + accessToken
  if (tenantId) headers['tenant-id'] = tenantId
  if (accessToken && visitTenantId) headers['visit-tenant-id'] = visitTenantId
  return headers
}

function parseEventBlock(block) {
  const event = { data: '', event: '', id: '', retry: undefined }
  const data = []
  block.split('\n').forEach(line => {
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

async function generateMindMap({ data, onClose, onMessage, onError, ctrl }) {
  const controller = ctrl || new AbortController()
  try {
    const response = await fetch(getStreamUrl(), {
      method: 'POST',
      headers: getStreamHeaders(),
      body: JSON.stringify(data),
      signal: controller.signal
    })
    if (!response.ok) {
      throw new Error('生成思维导图失败，HTTP ' + response.status)
    }
    if (!response.body || !response.body.getReader) {
      throw new Error('当前浏览器不支持流式响应')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let streamDone = false
    while (!streamDone) {
      const chunk = await reader.read()
      streamDone = chunk.done
      buffer += decoder.decode(chunk.value || new Uint8Array(), { stream: !chunk.done })
      buffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      let boundary = buffer.indexOf('\n\n')
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + 2)
        if (block && onMessage) await onMessage(parseEventBlock(block))
        boundary = buffer.indexOf('\n\n')
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

export const AiMindMapApi = {
  generateMindMap,
  getMindMapPage(params) {
    return request({ url: '/ai/mind-map/page', method: 'get', params })
  },
  deleteMindMap(id) {
    return request({ url: '/ai/mind-map/delete?id=' + id, method: 'delete' })
  }
}
