import request from '@/utils/request'

// FMS 科目 API（与 Vue3 /fms/config/subject 对齐）
export function getSubjectList(accountSetId, type) {
  return request({ url: '/fms/config/subject/list', method: 'get', params: { accountSetId, type } })
}

export function getSubjectSimpleList(accountSetId, type) {
  return request({ url: '/fms/config/subject/simple-list', method: 'get', params: { accountSetId, type } })
}

export function getDetailSubjectList(params) {
  return request({ url: '/fms/ledger/detail/subject-list', method: 'get', params })
}

export function getSubject(accountSetId, id) {
  return request({ url: '/fms/config/subject/get', method: 'get', params: { accountSetId, id } })
}

export function getSubjectUsage(accountSetId, id) {
  return request({ url: '/fms/config/subject/get-usage', method: 'get', params: { accountSetId, id } })
}

export function createSubject(data) {
  return request({ url: '/fms/config/subject/create', method: 'post', data })
}

export function updateSubject(data) {
  return request({ url: '/fms/config/subject/update', method: 'put', data })
}

export function deleteSubjectList(accountSetId, ids) {
  return request({ url: '/fms/config/subject/delete-list', method: 'delete', data: { accountSetId, ids } })
}

export function updateSubjectStatus(data) {
  return request({ url: '/fms/config/subject/update-status', method: 'put', data })
}

export function exportSubject(accountSetId, type) {
  return request({ url: '/fms/config/subject/export-excel', method: 'get', params: { accountSetId, type }, responseType: 'blob' })
}

export function getSubjectImportTemplate() {
  return request({ url: '/fms/config/subject/get-import-template', method: 'get', responseType: 'blob' })
}

export function importSubject(accountSetId, file) {
  const data = new FormData()
  data.append('accountSetId', String(accountSetId))
  data.append('file', file)
  return request({
    url: '/fms/config/subject/import',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
