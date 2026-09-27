<template><el-card shadow="never"><el-collapse v-model="activeNames"><el-collapse-item name="basicInfo"><template slot="title"><span class="collapse-title">基本信息</span></template><el-descriptions :column="4"><el-descriptions-item label="员工姓名">{{ employee.name || '-' }}</el-descriptions-item><el-descriptions-item label="手机号">{{ employee.mobile || '-' }}</el-descriptions-item><el-descriptions-item label="性别"><dict-tag
  v-if="employee.sex != null"
  :type="DICT_TYPE.SYSTEM_USER_SEX"
  :value="employee.sex"
/><span v-else>-</span></el-descriptions-item><el-descriptions-item label="年龄">{{ employee.age != null ? employee.age : '-' }}</el-descriptions-item><el-descriptions-item label="国家或地区">{{ employee.country || '-' }}</el-descriptions-item><el-descriptions-item label="民族">{{ employee.nation || '-' }}</el-descriptions-item><el-descriptions-item label="证件类型">{{ formatEmployeeIdType(employee.idType) }}</el-descriptions-item><el-descriptions-item label="证件号码">{{ employee.idNumber || '-' }}</el-descriptions-item><el-descriptions-item label="邮箱">{{ employee.email || '-' }}</el-descriptions-item><el-descriptions-item label="籍贯">{{ employee.nativePlace || '-' }}</el-descriptions-item><el-descriptions-item label="出生时间">{{ formatHrmDateTime(employee.birthday) }}</el-descriptions-item><el-descriptions-item label="最高学历"><dict-tag
  v-if="employee.highestEducation != null"
  :type="DICT_TYPE.HRM_EMPLOYEE_EDUCATION"
  :value="employee.highestEducation"
/><span v-else>-</span></el-descriptions-item><el-descriptions-item
  label="户籍地址"
  :span="2"
>{{ employee.address || '-' }}</el-descriptions-item></el-descriptions></el-collapse-item><el-collapse-item name="systemInfo"><template slot="title"><span class="collapse-title">系统信息</span></template><el-descriptions :column="4"><el-descriptions-item label="后台账号">{{ employee.userNickname || '-' }}</el-descriptions-item><el-descriptions-item label="账号编号">{{ employee.userId || '-' }}</el-descriptions-item><el-descriptions-item label="候选人编号">{{ employee.candidateId || '-' }}</el-descriptions-item><el-descriptions-item label="创建时间">{{ formatHrmDateTime(employee.createTime) }}</el-descriptions-item><el-descriptions-item
  label="备注"
  :span="4"
>{{ employee.remark || '-' }}</el-descriptions-item></el-descriptions></el-collapse-item></el-collapse></el-card></template>
<script>import { DICT_TYPE } from '@/utils/dict'; import { formatEmployeeIdType, formatHrmDateTime } from '@/views/hrm/utils/format'; export default { name: 'HrmEmployeeDetailsInfo', props: { employee: { type: Object, required: true }}, data() { return { DICT_TYPE, activeNames: ['basicInfo', 'systemInfo'] } }, methods: { formatEmployeeIdType, formatHrmDateTime }}</script>
<style scoped>.collapse-title { font-size:16px; font-weight:bold; }</style>
