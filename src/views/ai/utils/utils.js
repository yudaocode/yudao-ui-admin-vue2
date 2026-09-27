export function hasChinese(value) {
  return /[\u4e00-\u9fa5]/.test(String(value || ''))
}
