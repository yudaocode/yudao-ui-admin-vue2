<template><div><el-card shadow="never"><el-descriptions :column="4"><el-descriptions-item label="工号">{{ employee.jobNumber || '-' }}</el-descriptions-item><el-descriptions-item label="所属部门">{{ employee.deptName || '-' }}</el-descriptions-item><el-descriptions-item label="职位名称">{{ employee.postName || '-' }}</el-descriptions-item><el-descriptions-item label="岗位职级">{{ employee.postLevel || '-' }}</el-descriptions-item><el-descriptions-item label="直属上级">{{ employee.leaderEmployeeName || '-' }}</el-descriptions-item><el-descriptions-item label="入职状态"><dict-tag
  v-if="employee.entryStatus != null"
  :type="DICT_TYPE.HRM_EMPLOYEE_ENTRY_STATUS"
  :value="employee.entryStatus"
/><span v-else>-</span></el-descriptions-item><el-descriptions-item label="员工状态"><dict-tag
  v-if="employee.status != null"
  :type="DICT_TYPE.HRM_EMPLOYEE_STATUS"
  :value="employee.status"
/><span v-else>-</span></el-descriptions-item><el-descriptions-item label="聘用形式"><dict-tag
  v-if="employee.type != null"
  :type="DICT_TYPE.HRM_EMPLOYEE_TYPE"
  :value="employee.type"
/><span v-else>-</span></el-descriptions-item><el-descriptions-item label="入职时间">{{ formatHrmDateTime(employee.entryTime) }}</el-descriptions-item><el-descriptions-item label="试用期">{{ employee.probation != null ? employee.probation + ' 个月' : '-' }}</el-descriptions-item><el-descriptions-item label="转正时间">{{ formatHrmDateTime(employee.regularTime) }}</el-descriptions-item><el-descriptions-item label="离职时间">{{ formatHrmDateTime(employee.leaveTime) }}</el-descriptions-item><el-descriptions-item label="工作城市">{{ employee.workCity || '-' }}</el-descriptions-item><el-descriptions-item label="工作地点">{{ employee.workAddress || '-' }}</el-descriptions-item><el-descriptions-item
  label="详细地址"
  :span="2"
>{{ employee.workDetailAddress || '-' }}</el-descriptions-item><el-descriptions-item label="招聘渠道">{{ employee.channelName || '-' }}</el-descriptions-item><el-descriptions-item label="司龄起算时间">{{ formatHrmDateTime(employee.companyAgeStartTime) }}</el-descriptions-item><el-descriptions-item label="司龄">{{ employee.companyAge != null ? employee.companyAge + ' 年' : '-' }}</el-descriptions-item></el-descriptions></el-card><el-card
  shadow="never"
  class="section-card"
><div slot="header">异动记录</div><employee-change-record-list
  ref="changeRecordList"
  :employee="employee"
  :employee-id="employeeId"
  @success="$emit('refresh')"
/></el-card><employee-quit-info
  ref="quitInfo"
  :employee-id="employeeId"
  @edit="$emit('edit-quit')"
/></div></template>
<script>import { DICT_TYPE } from '@/utils/dict'; import { formatHrmDateTime } from '@/views/hrm/utils/format'; import EmployeeChangeRecordList from './EmployeeChangeRecordList.vue'; import EmployeeQuitInfo from './EmployeeQuitInfo.vue'; export default { name: 'HrmEmployeePostInfo', components: { EmployeeChangeRecordList, EmployeeQuitInfo }, props: { employee: { type: Object, required: true }, employeeId: { type: Number, required: true }}, data() { return { DICT_TYPE } }, methods: { formatHrmDateTime, refreshChangeRecordList() { return this.$refs.changeRecordList.getList() }, refreshQuitInfo() { return this.$refs.quitInfo.getQuitInfo() } }}</script>
<style scoped>.section-card { margin-top:16px; }</style>
