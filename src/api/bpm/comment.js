import request from '@/utils/request'

// 获得指定流程实例的评论列表
export function getCommentListByProcessInstanceId(processInstanceId) {
  return request({
    url: '/bpm/comment/list-by-process-instance-id',
    method: 'get',
    params: { processInstanceId }
  })
}

// 创建流程评论
export function createComment(taskId, message) {
  return request({
    url: '/bpm/comment/create',
    method: 'post',
    data: { taskId, message }
  })
}
