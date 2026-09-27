const DEFAULT_FALLBACK_SIZE = { width: 200, height: 200 }

export function loadImage(src, options = {}) {
  const crossOrigin = options.crossOrigin === undefined ? 'anonymous' : options.crossOrigin
  return new Promise(resolve => {
    const img = new Image()
    if (crossOrigin) img.crossOrigin = crossOrigin
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export function probeImageSize(source) {
  const isFile = source instanceof File
  const src = isFile ? URL.createObjectURL(source) : source
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      if (isFile) URL.revokeObjectURL(src)
      resolve({
        width: img.naturalWidth || DEFAULT_FALLBACK_SIZE.width,
        height: img.naturalHeight || DEFAULT_FALLBACK_SIZE.height
      })
    }
    img.onerror = () => {
      if (isFile) URL.revokeObjectURL(src)
      resolve(Object.assign({}, DEFAULT_FALLBACK_SIZE))
    }
    img.src = src
  })
}
