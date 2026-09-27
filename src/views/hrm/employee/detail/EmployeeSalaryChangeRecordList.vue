<template><el-card
  shadow="never"
  class="section-card"
><div slot="header">定薪/调薪记录</div><el-table
  v-loading="loading"
  :data="list"
  stripe
><el-table-column
  label="生效日期"
  prop="effectTime"
  width="120"
  :formatter="dateFormatter2"
/><el-table-column
  label="类型"
  prop="recordType"
  width="90"
><template slot-scope="scope">{{ scope.row.recordType === HrmSalaryRecordType.FIXED ? '定薪' : '调薪' }}</template></el-table-column><el-table-column
  label="原因"
  prop="changeReason"
  width="90"
><template slot-scope="scope"><dict-tag
  :type="DICT_TYPE.HRM_SALARY_CHANGE_REASON"
  :value="scope.row.changeReason"
/></template></el-table-column><el-table-column
  label="调整前"
  align="right"
  prop="beforeTotal"
  width="120"
><template slot-scope="scope">{{ formatHrmMoney(scope.row.beforeTotal) }}</template></el-table-column><el-table-column
  label="调整后"
  align="right"
  prop="afterTotal"
  width="120"
><template slot-scope="scope">{{ formatHrmMoney(scope.row.afterTotal) }}</template></el-table-column><el-table-column
  label="试用调整前"
  align="right"
  prop="probationBeforeTotal"
  width="120"
><template slot-scope="scope">{{ formatHrmMoney(scope.row.probationBeforeTotal) }}</template></el-table-column><el-table-column
  label="试用调整后"
  align="right"
  prop="probationAfterTotal"
  width="120"
><template slot-scope="scope">{{ formatHrmMoney(scope.row.probationAfterTotal) }}</template></el-table-column><el-table-column
  label="状态"
  prop="status"
  width="110"
><template slot-scope="scope"><dict-tag
  :type="DICT_TYPE.HRM_SALARY_CHANGE_RECORD_STATUS"
  :value="scope.row.status"
/></template></el-table-column><el-table-column
  label="备注"
  prop="remark"
  min-width="160"
/></el-table></el-card></template>
<script>import { DICT_TYPE } from '@/utils/dict'; import { dateFormatter2 } from '@/utils'; import { getSalaryChangeRecordList } from '@/api/hrm/salary/change-record'; import { HrmSalaryRecordType } from '@/views/hrm/utils/constants'; import { formatHrmMoney } from '@/views/hrm/utils/format'; export default { name: 'HrmEmployeeSalaryChangeRecordList', props: { employeeId: { type: Number, required: true }}, data() { return { DICT_TYPE, HrmSalaryRecordType, loading: true, list: [] } }, created() { this.getList() }, methods: { dateFormatter2, formatHrmMoney, async getList() { this.loading = true; try { const response = await getSalaryChangeRecordList(this.employeeId); this.list = response.data } finally { this.loading = false } } }}</script>
<style scoped>.section-card { margin-bottom:16px; }</style>
