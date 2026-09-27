import request from '@/utils/request'

// 内容管理 - 文章分类 API。保持 Vue3 的 canonical 命名和接口。
export function getArticleCategoryPage(params) {
  return request({ url: '/promotion/article-category/page', method: 'get', params })
}

export function getSimpleArticleCategoryList() {
  return request({ url: '/promotion/article-category/list-all-simple', method: 'get' })
}

export function getArticleCategory(id) {
  return request({ url: '/promotion/article-category/get?id=' + id, method: 'get' })
}

export function createArticleCategory(data) {
  return request({ url: '/promotion/article-category/create', method: 'post', data })
}

export function updateArticleCategory(data) {
  return request({ url: '/promotion/article-category/update', method: 'put', data })
}

export function deleteArticleCategory(id) {
  return request({ url: '/promotion/article-category/delete?id=' + id, method: 'delete' })
}
