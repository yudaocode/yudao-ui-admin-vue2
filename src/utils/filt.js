export function openWindow(url, options) {
  const config = options || {}
  const target = config.target || '__blank'
  const features = []
  if (config.noopener !== false) features.push('noopener=yes')
  if (config.noreferrer !== false) features.push('noreferrer=yes')
  window.open(url, target, features.join(','))
}

/** base64 转 Blob */
export function dataURLtoBlob(base64Buffer) {
  const parts = base64Buffer.split(',')
  const mime = parts[0].match(/:(.*?);/)[1]
  const binary = window.atob(parts[1])
  let length = binary.length
  const bytes = new Uint8Array(length)
  while (length--) bytes[length] = binary.charCodeAt(length)
  return new Blob([bytes], { type: mime })
}

/** 图片地址转 base64 */
export function urlToBase64(url, mimeType) {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement('CANVAS')
    const context = canvas.getContext('2d')
    const image = new Image()
    image.crossOrigin = ''
    image.onload = function() {
      if (!canvas || !context) return reject()
      canvas.height = image.height
      canvas.width = image.width
      context.drawImage(image, 0, 0)
      const dataUrl = canvas.toDataURL(mimeType || 'image/png')
      canvas = null
      resolve(dataUrl)
    }
    image.src = url
  })
}

/** 下载在线图片 */
export function downloadByOnlineUrl(url, filename, mime, bom) {
  urlToBase64(url).then(base64 => downloadByBase64(base64, filename, mime, bom))
}

/** 下载 base64 数据 */
export function downloadByBase64(buffer, filename, mime, bom) {
  downloadByData(dataURLtoBlob(buffer), filename, mime, bom)
}

/** 下载文件流 */
export function downloadByData(data, filename, mime, bom) {
  const blobData = typeof bom !== 'undefined' ? [bom, data] : [data]
  const blob = new Blob(blobData, { type: mime || 'application/octet-stream' })
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = blobUrl
  link.setAttribute('download', filename)
  if (typeof link.download === 'undefined') link.setAttribute('target', '_blank')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(blobUrl)
}

/** 按文件地址下载 */
export function downloadByUrl({ url, target = '_blank', fileName }) {
  const userAgent = window.navigator.userAgent
  const lowerUserAgent = userAgent.toLowerCase()
  const isChrome = lowerUserAgent.indexOf('chrome') > -1
  const isSafari = lowerUserAgent.indexOf('safari') > -1
  if (/(iP)/g.test(userAgent)) {
    console.error('Your browser does not support download!')
    return false
  }
  if (isChrome || isSafari) {
    const link = document.createElement('a')
    link.href = url
    link.target = target
    if (link.download !== undefined) {
      link.download = fileName || url.substring(url.lastIndexOf('/') + 1, url.length)
    }
    if (document.createEvent) {
      const event = document.createEvent('MouseEvents')
      event.initEvent('click', true, true)
      link.dispatchEvent(event)
      return true
    }
  }
  if (url.indexOf('?') === -1) url += '?download'
  openWindow(url, { target })
  return true
}
