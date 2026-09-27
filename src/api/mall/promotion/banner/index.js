import request from '@/utils/request'

// 内容管理 - Banner API。保持 Vue3 promotion/banner/index.ts 的接口契约。
export function getBannerPage(params) {
  return request({ url: '/promotion/banner/page', method: 'get', params })
}

export function getBanner(id) {
  return request({ url: '/promotion/banner/get?id=' + id, method: 'get' })
}

export function createBanner(data) {
  return request({ url: '/promotion/banner/create', method: 'post', data })
}

export function updateBanner(data) {
  return request({ url: '/promotion/banner/update', method: 'put', data })
}

export function deleteBanner(id) {
  return request({ url: '/promotion/banner/delete?id=' + id, method: 'delete' })
}
