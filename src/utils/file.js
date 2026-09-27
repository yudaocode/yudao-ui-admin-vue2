const IMAGE_FILE_EXTENSIONS = ['bmp', 'gif', 'jpeg', 'jpg', 'png', 'webp']

export function getFileNameFromUrl(url) {
  const cleanUrl = String(url || '').split(/[?#]/)[0]
  const fileName = cleanUrl.slice(cleanUrl.lastIndexOf('/') + 1)
  try {
    return decodeURIComponent(fileName)
  } catch (e) {
    return fileName
  }
}

export function getFileExtFromUrl(url) {
  const fileName = getFileNameFromUrl(url)
  const extIndex = fileName.lastIndexOf('.')
  return extIndex > -1 ? fileName.slice(extIndex + 1).toLowerCase() : ''
}

export function isImageFile(url) {
  return IMAGE_FILE_EXTENSIONS.includes(getFileExtFromUrl(url))
}

/** 格式化文件大小 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
