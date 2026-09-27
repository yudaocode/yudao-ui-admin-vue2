import request from '@/utils/request'

// 内容管理 - 文章 API。路径与 Vue3 promotion/article/index.ts 保持一致。
export function getArticlePage(params) {
  return request({ url: '/promotion/article/page', method: 'get', params })
}

export function getArticle(id) {
  return request({ url: '/promotion/article/get?id=' + id, method: 'get' })
}

export function createArticle(data) {
  return request({ url: '/promotion/article/create', method: 'post', data })
}

export function updateArticle(data) {
  return request({ url: '/promotion/article/update', method: 'put', data })
}

export function deleteArticle(id) {
  return request({ url: '/promotion/article/delete?id=' + id, method: 'delete' })
}
