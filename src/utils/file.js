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
