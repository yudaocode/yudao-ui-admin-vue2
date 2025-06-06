import request from '@/utils/request'

// 创建学生
export function createDemo03Student(data) {
  return request({
    url: '/infra/demo03-student-erp/create',
    method: 'post',
    data: data
  })
}

// 更新学生
export function updateDemo03Student(data) {
  return request({
    url: '/infra/demo03-student-erp/update',
    method: 'put',
    data: data
  })
}

// 删除学生
export function deleteDemo03Student(id) {
  return request({
    url: '/infra/demo03-student-erp/delete?id=' + id,
    method: 'delete'
  })
}

/** 批量删除学生 */
export function deleteDemo03StudentList(ids) {
  return request({
    url: `/infra/demo03-student-erp/delete-list?ids=${ids.join(',')}`,
    method: 'delete'
  })
}

// 获得学生
export function getDemo03Student(id) {
  return request({
    url: '/infra/demo03-student-erp/get?id=' + id,
    method: 'get'
  })
}

// 获得学生分页
export function getDemo03StudentPage(params) {
  return request({
    url: '/infra/demo03-student-erp/page',
    method: 'get',
    params
  })
}
// 导出学生 Excel
export function exportDemo03StudentExcel(params) {
  return request({
    url: '/infra/demo03-student-erp/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// ==================== 子表（学生课程） ====================
// 获得学生课程分页
export function getDemo03CoursePage(params) {
  return request({
    url: '/infra/demo03-student-erp/demo03-course/page',
    method: 'get',
    params
  })
}
// 新增学生课程
export function createDemo03Course(data) {
  return request({
    url: '/infra/demo03-student-erp/demo03-course/create',
    method: 'post',
    data
  })
}
// 修改学生课程
export function updateDemo03Course(data) {
  return request({
    url: '/infra/demo03-student-erp/demo03-course/update',
    method: 'post',
    data
  })
}
// 删除学生课程
export function deleteDemo03Course(id) {
  return request({
    url: '/infra/demo03-student-erp/demo03-course/delete?id=' + id,
    method: 'delete'
  })
}
/** 批量删除学生课程 */
export function deleteDemo03CourseList(ids) {
  return request({
    url: `/infra/demo03-student-erp/demo03-course/delete-list?ids=${ids.join(',')}`,
    method: 'delete'
  })
}
// 获得学生课程
export function getDemo03Course(id) {
  return request({
    url: '/infra/demo03-student-erp/demo03-course/get?id=' + id,
    method: 'get'
  })
}

// ==================== 子表（学生班级） ====================
// 获得学生班级分页
export function getDemo03GradePage(params) {
  return request({
    url: '/infra/demo03-student-erp/demo03-grade/page',
    method: 'get',
    params
  })
}
// 新增学生班级
export function createDemo03Grade(data) {
  return request({
    url: '/infra/demo03-student-erp/demo03-grade/create',
    method: 'post',
    data
  })
}
// 修改学生班级
export function updateDemo03Grade(data) {
  return request({
    url: '/infra/demo03-student-erp/demo03-grade/update',
    method: 'post',
    data
  })
}
// 删除学生班级
export function deleteDemo03Grade(id) {
  return request({
    url: '/infra/demo03-student-erp/demo03-grade/delete?id=' + id,
    method: 'delete'
  })
}
/** 批量删除学生班级 */
export function deleteDemo03GradeList(ids) {
  return request({
    url: `/infra/demo03-student-erp/demo03-grade/delete-list?ids=${ids.join(',')}`,
    method: 'delete'
  })
}
// 获得学生班级
export function getDemo03Grade(id) {
  return request({
    url: '/infra/demo03-student-erp/demo03-grade/get?id=' + id,
    method: 'get'
  })
}
