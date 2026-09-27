import { parseTime } from './ruoyi'

export function beginOfDay(param) {
  return new Date(param.getFullYear(), param.getMonth(), param.getDate(), 0, 0, 0)
}

export function endOfDay(param) {
  return new Date(param.getFullYear(), param.getMonth(), param.getDate(), 23, 59, 59)
}

export const defaultShortcuts = [
  { text: '今天', onClick: picker => picker.$emit('pick', [beginOfDay(new Date()), endOfDay(new Date())]) },
  { text: '昨天', onClick: picker => { const date = new Date(Date.now() - 86400000); picker.$emit('pick', [beginOfDay(date), endOfDay(date)]) } },
  { text: '最近七天', onClick: picker => { const end = new Date(); const start = new Date(Date.now() - 6 * 86400000); picker.$emit('pick', [beginOfDay(start), endOfDay(end)]) } },
  { text: '最近 30 天', onClick: picker => { const end = new Date(); const start = new Date(Date.now() - 29 * 86400000); picker.$emit('pick', [beginOfDay(start), endOfDay(end)]) } }
]

export function dateFormatter(row, column, cellValue) {
  return cellValue ? formatDate(cellValue) : ''
}

export function dateFormatter2(row, column, cellValue) {
  return cellValue ? formatDate(cellValue, 'YYYY-MM-DD') : ''
}

/** 时间日期转换。 */
export function formatDate(date, format) {
  if (!date) return ''
  const pattern = (format || 'YYYY-MM-DD HH:mm:ss')
    .replace('YYYY', '{y}')
    .replace('MM', '{m}')
    .replace('DD', '{d}')
    .replace('HH', '{h}')
    .replace('mm', '{i}')
    .replace('ss', '{s}')
  return parseTime(date, pattern)
}

/** 将时间转换为“刚刚”“几分钟前”等文本。 */
export function formatPast(param, format = 'YYYY-MM-DD HH:mm:ss') {
  let target
  let amount
  let time = new Date().getTime()
  typeof param === 'string' || typeof param === 'object'
    ? (target = new Date(param).getTime())
    : (target = param)
  time = Number.parseInt(`${time - target}`)
  if (time < 10000) return '刚刚'
  if (time < 60000) {
    amount = Math.floor(time / 1000)
    return `${amount}秒前`
  }
  if (time < 3600000) {
    amount = Math.floor(time / 60000)
    return `${amount}分钟前`
  }
  if (time < 86400000) {
    amount = Math.floor(time / 3600000)
    return `${amount}小时前`
  }
  if (time < 259200000) {
    amount = Math.floor(time / 86400000)
    return `${amount}天前`
  }
  return formatDate(new Date(param), format)
}

/**
 * dayjs relativeTime 的分组键。客服消息使用它判断相邻消息是否跨越相对时间分组。
 */
export function relativeTimeKey(param, now = Date.now()) {
  const delta = now - new Date(param).getTime()
  const direction = delta < 0 ? 'future' : 'past'
  const seconds = Math.abs(delta) / 1000
  let rounded = Math.round(seconds)
  if (rounded <= 44) return direction + ':s'
  if (rounded <= 89) return direction + ':m'
  rounded = Math.round(seconds / 60)
  if (rounded <= 44) return direction + ':mm:' + rounded
  if (rounded <= 89) return direction + ':h'
  rounded = Math.round(seconds / 3600)
  if (rounded <= 21) return direction + ':hh:' + rounded
  if (rounded <= 35) return direction + ':d'
  rounded = Math.round(seconds / 86400)
  if (rounded <= 25) return direction + ':dd:' + rounded
  if (rounded <= 45) return direction + ':M'
  rounded = Math.round(seconds / 2592000)
  if (rounded <= 10) return direction + ':MM:' + rounded
  if (rounded <= 17) return direction + ':y'
  rounded = Math.round(seconds / 31536000)
  return direction + ':yy:' + rounded
}

/**
 * 将秒数格式化为 mm:ss，适用于音视频时长、倒计时等
 *
 * @param seconds 秒数
 */
export function formatSeconds(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0))
  const mm = Math.floor(s / 60).toString().padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}
