import downloadPlugin from '@/plugins/download'

const download = {
  ...downloadPlugin,
  image({ url, canvasWidth, canvasHeight, drawWithImageSize = true }) {
    const image = new Image()
    image.src = url
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvasWidth || image.width
      canvas.height = canvasHeight || image.height
      const context = canvas.getContext('2d')
      if (!context) return
      context.clearRect(0, 0, canvas.width, canvas.height)
      if (drawWithImageSize) {
        context.drawImage(image, 0, 0, image.width, image.height)
      } else {
        context.drawImage(image, 0, 0)
      }
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = 'image.png'
      link.click()
    }
  },
  base64Image(base64, fileName) {
    const file = download.base64ToFile(base64, fileName)
    downloadPlugin.download0(file, file.name, file.type)
  },
  base64ToFile(base64, fileName) {
    const data = base64.split(',')
    const typeMatch = data[0].match(/:(.*?);/)
    if (!typeMatch || !data[1]) throw new Error('无效的 Base64 图片数据')
    const type = typeMatch[1]
    const suffix = type.split('/')[1]
    const bytes = window.atob(data[1])
    const values = new Uint8Array(bytes.length)
    for (let index = 0; index < bytes.length; index++) {
      values[index] = bytes.charCodeAt(index)
    }
    return new File([values], `${fileName}.${suffix}`, { type })
  }
}

export default download
