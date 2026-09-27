<template><div><div class="toolbar"><el-button
  v-hasPermi="['hrm:employee:update']"
  type="primary"
  plain
  icon="el-icon-plus"
  @click="openForm()"
>新增</el-button></div><el-table
  v-loading="loading"
  :data="list"
  stripe
><el-table-column
  label="学历"
  prop="education"
  min-width="100"
><template slot-scope="scope"><dict-tag
  v-if="scope.row.education != null"
  :type="DICT_TYPE.HRM_EMPLOYEE_EDUCATION"
  :value="scope.row.education"
/><span v-else>-</span></template></el-table-column><el-table-column
  label="毕业院校"
  prop="graduateSchool"
  min-width="150"
/><el-table-column
  label="专业"
  prop="major"
  min-width="120"
/><el-table-column
  label="入学日期"
  prop="admissionTime"
  width="120"
  :formatter="dateFormatter2"
/><el-table-column
  label="毕业日期"
  prop="graduationTime"
  width="120"
  :formatter="dateFormatter2"
/><el-table-column
  label="教学方式"
  prop="teachingMethods"
  width="110"
><template slot-scope="scope">{{ formatEmployeeTeachingMethod(scope.row.teachingMethods) }}</template></el-table-column><el-table-column
  label="第一学历"
  prop="firstDegree"
  width="100"
><template slot-scope="scope"><dict-tag
  :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
  :value="scope.row.firstDegree"
/></template></el-table-column><el-table-column
  label="操作"
  fixed="right"
  width="120"
><template slot-scope="scope"><el-button
  v-hasPermi="['hrm:employee:update']"
  type="text"
  @click="openForm(scope.row)"
>编辑</el-button><el-button
  v-hasPermi="['hrm:employee:delete']"
  type="text"
  class="danger-button"
  @click="handleDelete(scope.row.id)"
>删除</el-button></template></el-table-column></el-table><employee-education-experience-form
  ref="form"
  @success="getList"
/></div></template>
<script>import { DICT_TYPE } from '@/utils/dict'; import { dateFormatter2 } from '@/utils'; import { getEmployeeEducationExperienceList, deleteEmployeeEducationExperience } from '@/api/hrm/employee/education-experience'; import { formatEmployeeTeachingMethod } from '@/views/hrm/utils/format'; import EmployeeEducationExperienceForm from './EmployeeEducationExperienceForm.vue'; export default { name: 'HrmEmployeeEducationExperienceList', components: { EmployeeEducationExperienceForm }, props: { employeeId: { type: Number, required: true }}, data() { return { DICT_TYPE, loading: true, list: [] } }, created() { this.getList() }, methods: { dateFormatter2, formatEmployeeTeachingMethod, async getList() { this.loading = true; try { const response = await getEmployeeEducationExperienceList(this.employeeId); this.list = response.data } finally { this.loading = false } }, openForm(row) { this.$refs.form.open(this.employeeId, row) }, async handleDelete(id) { if (!id) return; try { await this.$modal.confirm('是否确认删除该教育经历?'); await deleteEmployeeEducationExperience(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) {} } }}</script>
<style scoped>.toolbar { display:flex; justify-content:flex-end; margin-bottom:12px; }.danger-button { color:#f56c6c; }</style>
