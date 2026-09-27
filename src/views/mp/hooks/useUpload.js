const UploadType = Object.freeze({
  Image: 'image',
  Voice: 'voice',
  Video: 'video'
})

const uploadRules = Object.freeze({
  [UploadType.Image]: {
    name: '图片',
    types: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/jpg'],
    maxSizeMB: 2
  },
  [UploadType.Voice]: {
    name: '语音',
    types: ['audio/mp3', 'audio/mpeg', 'audio/wma', 'audio/wav', 'audio/amr'],
    maxSizeMB: 2
  },
  [UploadType.Video]: {
    name: '视频',
    types: ['video/mp4'],
    maxSizeMB: 10
  }
})

/**
 * Build an Element UI before-upload hook for an MP media type.
 * The optional notifier keeps this helper framework agnostic and lets Vue2
 * components pass `this.$message.error` without relying on Composition API.
 */
function useBeforeUpload(type, maxSizeMB, notify) {
  return rawFile => {
    const rule = uploadRules[type]
    if (!rule) return true

    const report = typeof notify === 'function' ? notify : () => {}
    if (!rule.types.includes(rawFile.type)) {
      report(`上传${rule.name}格式不对!`)
      return false
    }

    const sizeLimit = Number(maxSizeMB) > 0 ? Number(maxSizeMB) : rule.maxSizeMB
    if (rawFile.size / 1024 / 1024 > sizeLimit) {
      report(`上传${rule.name}大小不能超过${sizeLimit}M!`)
      return false
    }
    return true
  }
}

export { UploadType, useBeforeUpload }
