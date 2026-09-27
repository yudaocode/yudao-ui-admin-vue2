import request from '@/utils/request'

// Dictionary type API. Names and paths follow the Vue3 client contract.
export function getSimpleDictTypeList() {
  return request({ url: '/system/dict-type/simple-list', method: 'get' })
}

export function getDictTypePage(params) {
  return request({ url: '/system/dict-type/page', method: 'get', params })
}

export function getDictType(id) {
  return request({ url: '/system/dict-type/get?id=' + id, method: 'get' })
}

export function createDictType(data) {
  return request({ url: '/system/dict-type/create', method: 'post', data })
}

export function updateDictType(data) {
  return request({ url: '/system/dict-type/update', method: 'put', data })
}

export function deleteDictType(id) {
  return request({ url: '/system/dict-type/delete?id=' + id, method: 'delete' })
}

export function deleteDictTypeList(ids) {
  return request({
    url: '/system/dict-type/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}

export function exportDictType(params) {
  return request({ url: '/system/dict-type/export-excel', method: 'get', params, responseType: 'blob' })
}
