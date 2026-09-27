import axios from 'axios'
import { createFile, getFilePresignedUrl, updateFile } from '@/api/infra/file'

const UPLOAD_TYPE = {
  CLIENT: 'client',
  SERVER: 'server'
}

/** 获得上传 URL */
export function getUploadUrl() {
  return (process.env.VUE_APP_BASE_API || '').replace(/\/$/, '') + '/admin-api/infra/file/upload'
}

/**
 * 同时支持前端直传和后端中转上传。
 * Vue2 使用 VUE_APP_UPLOAD_TYPE，对应 Vue3 的 VITE_UPLOAD_TYPE。
 */
export function useUpload(directory) {
  const uploadUrl = getUploadUrl()
  const isClientUpload = process.env.VUE_APP_UPLOAD_TYPE === UPLOAD_TYPE.CLIENT

  const httpRequest = async options => {
    const uploadProgressHandler = event => {
      const progressEvent = Object.assign({}, event, {
        percent: event.total ? event.loaded / event.total * 100 : 0
      })
      if (options.onProgress) options.onProgress(progressEvent)
    }

    if (isClientUpload) {
      const fileName = options.file.name || options.filename
      const presignedResponse = await getFilePresignedUrl(fileName, directory)
      const presignedInfo = presignedResponse.data
      await axios.put(presignedInfo.uploadUrl, options.file, {
        headers: {
          'Content-Type': options.file.type || 'application/octet-stream'
        },
        onUploadProgress: uploadProgressHandler
      })
      createFileRecord(presignedInfo, options.file, fileName)
      return { data: presignedInfo.url }
    }

    return new Promise((resolve, reject) => {
      updateFile({ file: options.file, directory }, uploadProgressHandler)
        .then(response => {
          if (response.code === 0) {
            resolve(response)
          } else {
            reject(response)
          }
        })
        .catch(reject)
    })
  }

  return {
    uploadUrl,
    httpRequest
  }
}

function createFileRecord(presignedInfo, file, fileName) {
  const fileData = {
    configId: presignedInfo.configId,
    url: presignedInfo.url,
    path: presignedInfo.path,
    name: fileName,
    type: file.type || 'application/octet-stream',
    size: file.size
  }
  createFile(fileData)
  return fileData
}
