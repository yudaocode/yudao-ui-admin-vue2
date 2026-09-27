import request from '@/utils/request'

export function getSimpleDictDataList() {
  return request({ url: '/system/dict-data/simple-list', method: 'get' })
}

export function getDictDataPage(params) {
  return request({ url: '/system/dict-data/page', method: 'get', params })
}

export function getDictData(id) {
  return request({ url: '/system/dict-data/get?id=' + id, method: 'get' })
}

export function getDictDataByType(dictType) {
  return request({ url: '/system/dict-data/type?type=' + dictType, method: 'get' })
}

export function getDicts(dictType) {
  return getDictDataByType(dictType)
}

export function createDictData(data) {
  return request({ url: '/system/dict-data/create', method: 'post', data })
}

export function updateDictData(data) {
  return request({ url: '/system/dict-data/update', method: 'put', data })
}

export function deleteDictData(id) {
  return request({ url: '/system/dict-data/delete?id=' + id, method: 'delete' })
}

export function deleteDictDataList(ids) {
  return request({
    url: '/system/dict-data/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}

export function exportDictData(params) {
  return request({ url: '/system/dict-data/export-excel', method: 'get', params, responseType: 'blob' })
}
