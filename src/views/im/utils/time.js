// ====================================================================
// IM 时间格式化
// ====================================================================
// 4 类场景，文案规则各有差异

const WEEKDAY_NAMES_FULL = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const WEEKDAY_NAMES_SHORT = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const pad = value => String(value).padStart(2, '0')
const toDate = timestamp => new Date(timestamp)
const isSameDay = (left, right) => left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate()
const startOfDay = date => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
const formatDate = (date, pattern) => pattern
  .replace('YYYY', String(date.getFullYear()))
  .replace('MM', pad(date.getMonth() + 1))
  .replace('M', String(date.getMonth() + 1))
  .replace('DD', pad(date.getDate()))
  .replace('D', String(date.getDate()))
  .replace('HH', pad(date.getHours()))
  .replace('mm', pad(date.getMinutes()))

/** 日历筛选使用的本地日期键，保持 YYYY-MM-DD 语义。 */
export function formatDateKey(timestamp) {
  return formatDate(toDate(timestamp), 'YYYY-MM-DD')
}

/**
 * 消息列表的时间分隔条
 *
 * - 今天：HH:mm
 * - 昨天：昨天 HH:mm
 * - 一周内：周X HH:mm
 * - 超过一周：MM-DD HH:mm
 */
export function formatTimeTip(timestamp) {
  if (!timestamp) {
    return ''
  }
  const target = toDate(timestamp)
  const now = new Date()
  const time = formatDate(target, 'HH:mm')
  if (isSameDay(target, now)) {
    return time
  }
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  if (isSameDay(target, yesterday)) {
    return `昨天 ${time}`
  }
  const diffDays = Math.floor((startOfDay(now) - startOfDay(target)) / 86400000)
  if (diffDays >= 2 && diffDays <= 6) {
    return `${WEEKDAY_NAMES_SHORT[target.getDay()]} ${time}`
  }
  return formatDate(target, 'MM-DD HH:mm')
}

/**
 * 会话列表里的时间（无 HH:mm 后缀，只展示日期粒度）
 *
 * - 今天：HH:mm
 * - 昨天：昨天 HH:mm
 * - 本周内（2-6 天前）：星期X
 * - 同年其他：MM/DD
 * - 跨年：YYYY/MM/DD
 */
export function formatConversationTime(timestamp) {
  if (!timestamp) {
    return ''
  }
  const target = toDate(timestamp)
  const now = new Date()
  if (isSameDay(target, now)) {
    return formatDate(target, 'HH:mm')
  }
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  if (isSameDay(target, yesterday)) {
    return `昨天 ${formatDate(target, 'HH:mm')}`
  }
  // 用 startOf('day') 兜底跨时间点的差值，避免接近凌晨时取到 1.x → diff 算成 1 漏掉昨天分支
  const diffDays = Math.floor((startOfDay(now) - startOfDay(target)) / 86400000)
  if (diffDays >= 2 && diffDays <= 6) {
    return WEEKDAY_NAMES_FULL[target.getDay()]
  }
  return target.getFullYear() === now.getFullYear() ? formatDate(target, 'MM/DD') : formatDate(target, 'YYYY/MM/DD')
}

/**
 * 历史消息搜索列表的时间：展示绝对日期
 *
 * - 同年：M月D日 HH:mm
 * - 跨年：YYYY年M月D日 HH:mm
 */
export function formatHistoryTime(timestamp) {
  if (!timestamp) {
    return ''
  }
  const target = toDate(timestamp)
  return target.getFullYear() === new Date().getFullYear() ? formatDate(target, 'M月D日 HH:mm') : formatDate(target, 'YYYY年M月D日 HH:mm')
}

/** 合并消息详情列表里每行的时间：MM-DD HH:mm */
export function formatMergeItemTime(timestamp) {
  if (!timestamp) {
    return ''
  }
  return formatDate(toDate(timestamp), 'MM-DD HH:mm')
}

/** RTC 通话时长（秒）→ "00:06" / "1:23:45" */
export function formatCallDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0))
  const h = Math.floor(total / 3600)
  const m = Math.floor(total % 3600 / 60)
  const s = total % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

/** 接通到结束的通话时长；任一时间缺失返回 '-' */
export function resolveCallDuration(acceptTime, endTime) {
  if (!acceptTime || !endTime) {
    return '-'
  }
  const seconds = Math.floor((new Date(endTime).getTime() - new Date(acceptTime).getTime()) / 1000)
  return seconds > 0 ? formatCallDuration(seconds) : '-'
}
