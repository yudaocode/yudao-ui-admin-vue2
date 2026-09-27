import request from '@/utils/request'

// 查询我的笔记分页
export function getMyNotePage(params) {
  return request({ url: '/oa/note/my-page', method: 'get', params })
}

// 查询共享给我的笔记分页
export function getReceivedNotePage(params) {
  return request({ url: '/oa/note/received-page', method: 'get', params })
}

// 查询笔记详情
export function getNote(id) {
  return request({ url: '/oa/note/get?id=' + id, method: 'get' })
}

// 新增笔记
export function createNote(data) {
  return request({ url: '/oa/note/create', method: 'post', data })
}

// 修改笔记
export function updateNote(data) {
  return request({ url: '/oa/note/update', method: 'put', data })
}

// 删除笔记
export function deleteNote(id) {
  return request({ url: '/oa/note/delete?id=' + id, method: 'delete' })
}

// 移除收到的共享笔记，仅删除本人的接收关系
export function deleteReceivedNote(id) {
  return request({ url: '/oa/note/delete-received?id=' + id, method: 'delete' })
}

// 修改笔记收藏状态
export function updateNoteFavorite(id, favorite) {
  return request({ url: '/oa/note/update-favorite', method: 'put', data: { id, favorite } })
}

// 修改笔记共享接收人
export function updateNoteShare(id, receiverUserIds) {
  return request({ url: '/oa/note/update-share', method: 'put', data: { id, receiverUserIds } })
}
