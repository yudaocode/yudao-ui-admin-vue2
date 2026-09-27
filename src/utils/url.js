const OPENABLE_PROTOCOLS = new Set(['http:', 'https:', 'blob:'])

export function isOpenableUrl(url) {
  if (!url) return false
  try {
    const parsed = new URL(url, window.location.origin)
    return OPENABLE_PROTOCOLS.has(parsed.protocol)
  } catch (error) {
    return false
  }
}

export function openSafeUrl(url) {
  if (!url || !isOpenableUrl(url)) return
  window.open(url, '_blank', 'noopener,noreferrer')
}
