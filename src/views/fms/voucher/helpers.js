export const FMS_VOUCHER_STATUS = Object.freeze({
  PENDING_REVIEW: 0,
  APPROVED: 1
})

export const FMS_VOUCHER_STATUS_OPTIONS = [
  { label: '待审核', value: FMS_VOUCHER_STATUS.PENDING_REVIEW },
  { label: '已审核', value: FMS_VOUCHER_STATUS.APPROVED }
]

export const FMS_VOUCHER_ATTACHMENT_FILE_TYPES = ['jpg', 'jpeg', 'png', 'bmp']

export const FMS_VOUCHER_MONEY_UNITS = [
  '亿', '千', '百', '十', '万', '千', '百', '十', '元', '角', '分'
]

export const FMS_VOUCHER_TIDY_TYPE = Object.freeze({
  FILL_GAPS: 1,
  REORDER_BY_TIME: 2
})

const UPPERCASE_DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const INTEGER_UNITS = ['', '拾', '佰', '仟']
const GROUP_UNITS = ['', '万', '亿', '兆']

function pad(value) {
  return String(value).padStart(2, '0')
}

export function currentMonthValue() {
  const date = new Date()
  return date.getFullYear() + '-' + pad(date.getMonth() + 1)
}

export function toDate(value) {
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  const text = String(value || '')
  if (/^\d+$/.test(text)) return new Date(Number(text))
  return new Date(text)
}

export function formatDateOnly(value) {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}

export function formatDateTime(value) {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return ''
  return formatDateOnly(date) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds())
}

export function formatMonth(value) {
  const text = String(value || '')
  const match = text.match(/^(\d{4})-(\d{2})/)
  if (match) return match[1] + '-' + match[2]
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.getFullYear() + '-' + pad(date.getMonth() + 1)
}

export function formatPeriodLabel(startMonth, endMonth) {
  const format = month => {
    const parts = String(month || '').split('-')
    return parts.length === 2 ? parts[0] + '年第' + parts[1] + '期' : ''
  }
  const start = format(startMonth)
  const end = format(endMonth)
  return start === end ? start : start + ' 至 ' + end
}

export function buildPeriodFilename(title, startMonth, endMonth) {
  const period = startMonth === endMonth ? startMonth : startMonth + '至' + endMonth
  return title + '-' + period + '.xls'
}

export function getMonthRange(month) {
  const parts = String(month || '').split('-').map(Number)
  if (parts.length !== 2 || !parts[0] || !parts[1]) return ['', '']
  const lastDay = new Date(parts[0], parts[1], 0).getDate()
  return [
    parts[0] + '-' + pad(parts[1]) + '-01 00:00:00',
    parts[0] + '-' + pad(parts[1]) + '-' + pad(lastDay) + ' 23:59:59'
  ]
}

function formatIntegerGroup(value) {
  let result = ''
  let zeroPending = false
  for (let position = 3; position >= 0; position -= 1) {
    const unitValue = 10 ** position
    const digit = Math.floor(value / unitValue) % 10
    if (digit === 0) {
      if (result && value % unitValue > 0) zeroPending = true
      continue
    }
    if (zeroPending) result += UPPERCASE_DIGITS[0]
    result += UPPERCASE_DIGITS[digit] + INTEGER_UNITS[position]
    zeroPending = false
  }
  return result
}

function formatIntegerAmount(value) {
  const groups = []
  let remainingValue = value
  while (remainingValue > 0) {
    groups.unshift(remainingValue % 10000)
    remainingValue = Math.floor(remainingValue / 10000)
  }
  let result = ''
  let zeroPending = false
  groups.forEach((group, index) => {
    if (group === 0) {
      if (result) zeroPending = true
      return
    }
    if (result && (zeroPending || group < 1000)) result += UPPERCASE_DIGITS[0]
    result += formatIntegerGroup(group) + GROUP_UNITS[groups.length - index - 1]
    zeroPending = false
  })
  return result
}

export function formatUppercaseMoney(value) {
  if (!Number.isFinite(Number(value))) return ''
  const numericValue = Number(value)
  const amountInCents = Math.round(Math.abs(numericValue) * 100)
  if (amountInCents === 0) return '零元整'
  const integerAmount = Math.floor(amountInCents / 100)
  const jiao = Math.floor((amountInCents % 100) / 10)
  const fen = amountInCents % 10
  let result = integerAmount ? formatIntegerAmount(integerAmount) + '元' : ''
  if (jiao === 0 && fen === 0) {
    result += '整'
  } else {
    if (jiao > 0) result += UPPERCASE_DIGITS[jiao] + '角'
    else if (integerAmount > 0 && fen > 0) result += UPPERCASE_DIGITS[0]
    if (fen > 0) result += UPPERCASE_DIGITS[fen] + '分'
  }
  return numericValue < 0 ? '负' + result : result
}

export function formatSubjectBalance(value, direction) {
  return (direction ? direction + ' ' : '') + Number(value || 0).toFixed(2)
}

export function formatSubjectDisplay(code, name, auxiliaryNames) {
  if (!code && !name) return ''
  const names = (auxiliaryNames || []).filter(Boolean)
  return (code || '') + ' ' + (name || '') + (names.length ? ' / ' + names.join('、') : '')
}

export function flattenTree(items) {
  const result = []
  ;(items || []).forEach(item => {
    result.push(item)
    if (item.children && item.children.length) result.push.apply(result, flattenTree(item.children))
  })
  return result
}

export function buildTree(items, parentId) {
  const source = (items || []).map(item => Object.assign({}, item))
  const map = new Map(source.map(item => [Number(item.id), item]))
  const roots = []
  source.forEach(item => {
    const parent = map.get(Number(item.parentId))
    if (parent && Number(item.parentId) !== Number(item.id)) {
      if (!parent.children) parent.children = []
      parent.children.push(item)
    } else if (parentId === undefined || Number(item.parentId || 0) === Number(parentId)) {
      roots.push(item)
    } else {
      roots.push(item)
    }
  })
  return roots
}
