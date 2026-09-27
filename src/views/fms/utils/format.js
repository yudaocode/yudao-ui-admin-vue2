// FMS display formatters shared by Vue2 accounting pages.
export function formatExchangeRate(value) {
  return Number(value || 0).toLocaleString('zh-CN', {
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })
}

/** 格式化非空金额 */
export function formatMoney(value) {
  if (!value) return ''
  return Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/** 格式化金额，空值按 0 展示 */
export function formatAmount(value) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
