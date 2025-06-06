import request from '@/utils/request'

// 创建学生
export function createDemo03Student(data) {
  return request({
    url: '/infra/demo03-student-inner/create',
    method: 'post',
    data: data
  })
}

// 更新学生
export function updateDemo03Student(data) {
  return request({
    url: '/infra/demo03-student-inner/update',
    method: 'put',
    data: data
  })
}

// 删除学生
export function deleteDemo03Student(id) {
  return request({
    url: '/infra/demo03-student-inner/delete?id=' + id,
    method: 'delete'
  })
}

/** 批量删除学生 */
export function deleteDemo03StudentList(ids) {
  return request({
    url: `/infra/demo03-student-inner/delete-list?ids=${ids.join(',')}`,
    method: 'delete'
  })
}

// 获得学生
export function getDemo03Student(id) {
  return request({
    url: '/infra/demo03-student-inner/get?id=' + id,
    method: 'get'
  })
}

// 获得学生分页
export function getDemo03StudentPage(params) {
  return request({
    url: '/infra/demo03-student-inner/page',
    method: 'get',
    params
  })
}
// 导出学生 Excel
export function exportDemo03StudentExcel(params) {
  return request({
    url: '/infra/demo03-student-inner/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// ==================== 子表（学生课程） ====================
// 获得学生课程列表
export function getDemo03CourseListByStudentId(studentId) {
  return request({
    url: '/infra/demo03-student-inner/demo03-course/list-by-student-id?studentId=' + studentId,
    method: 'get'
  })
}

// ==================== 子表（学生班级） ====================
// 获得学生班级
export function getDemo03GradeByStudentId(studentId) {
  return request({
    url: '/infra/demo03-student-inner/demo03-grade/get-by-student-id?studentId=' + studentId,
    method: 'get'
  })
}
