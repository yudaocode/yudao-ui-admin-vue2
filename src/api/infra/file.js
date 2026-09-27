import request from '@/utils/request'

/** 上传文件 */
export function updateFile(data, onUploadProgress) {
  const isBlob = typeof Blob !== 'undefined'
  const wrappedFile = isBlob && data && data.file instanceof Blob
    ? data.file
    : null
  if (wrappedFile) {
    const formData = new FormData()
    formData.append('file', wrappedFile)
    if (typeof data.directory === 'string' && data.directory) {
      formData.append('directory', data.directory)
    }
    data = formData
  }
  return request({
    url: '/infra/file/upload',
    method: 'post',
    data,
    headers: typeof FormData !== 'undefined' && data instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : undefined,
    onUploadProgress
  })
}

// 删除文件
export function deleteFile(id) {
  return request({
    url: '/infra/file/delete?id=' + id,
    method: 'delete'
  })
}

// 批量删除文件
export function deleteFileList(ids) {
  return request({
    url: '/infra/file/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}

// 获得文件分页
export function getFilePage(query) {
  return request({
    url: '/infra/file/page',
    method: 'get',
    params: query
  })
}

// 获取文件预签名地址
export function getFilePresignedUrl(name, directory) {
  return request({
    url: '/infra/file/presigned-url',
    method: 'get',
    params: { name, directory }
  })
}

// 创建文件记录
export function createFile(data) {
  return request({
    url: '/infra/file/create',
    method: 'post',
    data
  })
}
