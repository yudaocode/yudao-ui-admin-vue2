import request from '@/utils/request'

// 个人表情

// 获取我的个人表情列表
export const getFaceUserItemList = () => {
  return request({
    url: '/im/face-user-item/list',
    method: 'get' })
}

// 添加个人表情
export const createFaceUserItem = data => {
  return request({
    url: '/im/face-user-item/create',
    data,
    method: 'post' })
}

// 删除个人表情
export const deleteFaceUserItem = id => {
  return request({
    url: '/im/face-user-item/delete',
    params: {
      id
    },
    method: 'delete' })
}
