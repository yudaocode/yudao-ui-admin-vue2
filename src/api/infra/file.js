import request from '@/utils/request'

/**
 * 上传文件
 * @param {File} file 文件对象 (必填)
 * @param {string} directory 文件目录，例如：'user/avatar' 或 'document/temp' (可选)
 * @returns {Promise} 返回上传结果
 */
export function uploadFile(file, directory) {
  const formData = new FormData()
  formData.append('file', file)
  if (directory) {
    formData.append('directory', directory)
  }
  
  return request({
    url: '/infra/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
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
    url: `/infra/file/delete-list?ids=${ids.join(',')}`,
    method: 'delete'
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
