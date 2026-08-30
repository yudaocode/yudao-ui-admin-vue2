/**
 * Helpers shared by the Vue 2 print-template editor and the print preview.
 *
 * Vue 3 stores WangEditor mention/process-record nodes as HTML.  Keeping the
 * marker format here means a Vue 2 model can be edited without depending on
 * the Vue 3 editor package, while remaining consumable by PrintDialog.vue.
 */

export const PRINT_TEMPLATE_VARIABLES = [
  { id: 'startUser', name: '发起人' },
  { id: 'startUserDept', name: '发起人部门' },
  { id: 'processName', name: '流程名称' },
  { id: 'processNum', name: '流程编号' },
  { id: 'startTime', name: '发起时间' },
  { id: 'endTime', name: '结束时间' },
  { id: 'processStatus', name: '流程状态' },
  { id: 'printUser', name: '打印人' },
  { id: 'printTime', name: '打印时间' }
]

export function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;')
}

/**
 * Return the marker used by WangEditor for a mention node.
 * PrintDialog resolves `data-info.id` against its process-variable map.
 */
export function createMentionHtml(id, name) {
  const safeId = String(id === undefined || id === null ? '' : id)
  const safeName = String(name === undefined || name === null ? safeId : name)
  const info = encodeURIComponent(JSON.stringify({ id: safeId }))
  return `<span data-w-e-type="mention" data-w-e-is-void="" data-w-e-is-inline="" data-value="${escapeAttribute(safeName)}" data-info="${info}" contenteditable="false">@${escapeHtml(safeName)}</span>`
}

/** Return the custom inline marker rendered as a process-record table. */
export function createProcessRecordHtml() {
  return '<span data-w-e-type="process-record" data-w-e-is-void="" data-w-e-is-inline="">流程记录</span>'
}

function createDefaultTemplate() {
  const mention = (id, name) => createMentionHtml(id, name)
  return [
    `<p style="text-align: center;"><strong>${mention('processName', '流程名称')}</strong></p>`,
    `<p style="text-align: right;">打印人：${mention('printUser', '打印人')}</p>`,
    `<p style="text-align: right;">流程编号：${mention('processNum', '流程编号')} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;打印时间：${mention('printTime', '打印时间')}</p>`,
    '<table style="width: 100%;"><tbody>',
    `<tr><td>发起人</td><td>${mention('startUser', '发起人')}</td><td>发起时间</td><td>${mention('startTime', '发起时间')}</td></tr>`,
    `<tr><td>所属部门</td><td>${mention('startUserDept', '发起人部门')}</td><td>流程状态</td><td>${mention('processStatus', '流程状态')}</td></tr>`,
    '</tbody></table>',
    `<p>${createProcessRecordHtml()}</p>`
  ].join('')
}

export const DEFAULT_PRINT_TEMPLATE = createDefaultTemplate()

const LEGACY_PLACEHOLDERS = PRINT_TEMPLATE_VARIABLES.reduce((result, item) => {
  result[item.name] = item
  result[item.id] = item
  return result
}, {})

const BLOCKED_TAGS = ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form']
const URL_ATTRIBUTES = ['href', 'src', 'action', 'poster', 'xlink:href']

function isSafeUrl(value) {
  const url = String(value || '').trim()
  if (!url) return true
  if (/^(?:javascript|vbscript):/i.test(url)) return false
  if (/^data:/i.test(url) && !/^data:image\/(?:png|gif|jpe?g|webp);base64,/i.test(url)) return false
  return true
}

/**
 * Older Vue 2 drafts used plain `{流程名称}`-style text.  Convert those
 * placeholders to the marker format while parsing so they do not print as
 * literal braces after the model is upgraded.
 */
function upgradeLegacyPlaceholders(doc, formFields) {
  if (!doc || !doc.body) return
  const placeholders = { ...LEGACY_PLACEHOLDERS }
  ;(formFields || []).forEach((field) => {
    const id = field && (field.field || field.id)
    if (!id) return
    const item = { id: String(id), name: `[表单]${field.title || field.name || id}` }
    placeholders[String(id)] = item
    if (field.title) placeholders[String(field.title)] = item
  })
  const visit = (node) => {
    if (node.nodeType === 3) {
      const parent = node.parentNode
      if (parent && parent.closest && parent.closest('[data-w-e-type]')) return
      const text = String(node.nodeValue || '')
      const pattern = /\{([^{}]+)\}/g
      let match
      let cursor = 0
      let changed = false
      const fragment = doc.createDocumentFragment()
      while ((match = pattern.exec(text))) {
        const item = placeholders[match[1]]
        if (!item) continue
        changed = true
        if (match.index > cursor) fragment.appendChild(doc.createTextNode(text.slice(cursor, match.index)))
        const holder = doc.createElement('span')
        holder.innerHTML = createMentionHtml(item.id, item.name)
        fragment.appendChild(holder.firstChild)
        cursor = match.index + match[0].length
      }
      if (changed) {
        if (cursor < text.length) fragment.appendChild(doc.createTextNode(text.slice(cursor)))
        node.parentNode.replaceChild(fragment, node)
      }
      return
    }
    Array.from(node.childNodes || []).forEach(visit)
  }
  Array.from(doc.body.childNodes || []).forEach(visit)
}

/**
 * Sanitize user-authored template HTML while preserving editor markers.
 * This is intentionally conservative because PrintDialog renders the result
 * with v-html.  Inline styles/tables are kept; executable elements and event
 * handler attributes are removed.
 */
export function sanitizePrintTemplate(template, formFields) {
  const source = String(template || '')
  if (!source) return ''
  if (typeof DOMParser === 'undefined') return source

  const doc = new DOMParser().parseFromString(source, 'text/html')
  upgradeLegacyPlaceholders(doc, formFields)
  BLOCKED_TAGS.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((element) => element.remove())
  })
  doc.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes || []).forEach((attribute) => {
      const name = String(attribute.name || '').toLowerCase()
      if (name.indexOf('on') === 0 || name === 'srcdoc') {
        element.removeAttribute(attribute.name)
        return
      }
      if (URL_ATTRIBUTES.includes(name) && !isSafeUrl(attribute.value)) {
        element.removeAttribute(attribute.name)
      }
    })
  })

  // Ensure markers generated by older editors remain recognizable by the
  // print preview after a round-trip through the Vue 2 contenteditable.
  doc.querySelectorAll('[data-w-e-type="mention"]').forEach((element) => {
    element.setAttribute('data-w-e-is-void', '')
    element.setAttribute('data-w-e-is-inline', '')
    element.setAttribute('contenteditable', 'false')
    if (!element.textContent || element.textContent.trim() === '') {
      const value = element.getAttribute('data-value') || ''
      element.textContent = `@${value}`
    }
  })
  doc.querySelectorAll('[data-w-e-type="process-record"]').forEach((element) => {
    element.setAttribute('data-w-e-is-void', '')
    element.setAttribute('data-w-e-is-inline', '')
    element.setAttribute('contenteditable', 'false')
    element.textContent = '流程记录'
  })
  return (doc.body && doc.body.innerHTML ? doc.body.innerHTML : '').trim()
}

export default {
  PRINT_TEMPLATE_VARIABLES,
  DEFAULT_PRINT_TEMPLATE,
  escapeHtml,
  createMentionHtml,
  createProcessRecordHtml,
  sanitizePrintTemplate
}
