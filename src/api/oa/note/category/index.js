import request from '@/utils/request'

// 查询笔记目录列表
export function getNoteCategoryList() {
  return request({ url: '/oa/note-category/list', method: 'get' })
}

// 查询笔记目录详情
export function getNoteCategory(id) {
  return request({ url: '/oa/note-category/get?id=' + id, method: 'get' })
}

// 查询分类精简列表
export function getSimpleNoteCategoryList() {
  return request({ url: '/oa/note-category/simple-list', method: 'get' })
}

// 新增笔记目录
export function createNoteCategory(data) {
  return request({ url: '/oa/note-category/create', method: 'post', data })
}

// 修改笔记目录
export function updateNoteCategory(data) {
  return request({ url: '/oa/note-category/update', method: 'put', data })
}

// 删除笔记目录
export function deleteNoteCategory(id) {
  return request({ url: '/oa/note-category/delete?id=' + id, method: 'delete' })
}
