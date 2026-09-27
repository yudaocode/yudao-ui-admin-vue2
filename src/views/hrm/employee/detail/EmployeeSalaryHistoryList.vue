<template><el-card
  shadow="never"
  class="section-card"
><div slot="header">历史月度工资</div><el-table
  v-loading="loading"
  :data="list"
  stripe
><el-table-column
  label="计薪月份"
  width="110"
><template slot-scope="scope">{{ formatHrmYearMonth(scope.row.year, scope.row.month) }}</template></el-table-column><el-table-column
  label="计薪周期"
  min-width="150"
><template slot-scope="scope">{{ scope.row.actualWorkDay != null ? scope.row.actualWorkDay : '-' }} / {{ scope.row.needWorkDay != null ? scope.row.needWorkDay : '-' }} 天</template></el-table-column><el-table-column
  label="应发工资"
  align="right"
  width="130"
><template slot-scope="scope">{{ formatHrmMoney(scope.row.expectedPaySalary) }}</template></el-table-column><el-table-column
  label="个人所得税"
  align="right"
  width="130"
><template slot-scope="scope">{{ formatHrmMoney(scope.row.personalTax) }}</template></el-table-column><el-table-column
  label="实发工资"
  align="right"
  width="130"
><template slot-scope="scope">{{ formatHrmMoney(scope.row.realPaySalary) }}</template></el-table-column><el-table-column
  label="操作"
  align="center"
  width="80"
><template slot-scope="scope"><el-button
  type="text"
  @click="openDetail(scope.row)"
>详情</el-button></template></el-table-column></el-table><pagination
  v-show="total > 0"
  :total="total"
  :page.sync="queryParams.pageNo"
  :limit.sync="queryParams.pageSize"
  @pagination="getList"
/><el-dialog
  title="工资明细"
  :visible.sync="detailVisible"
  width="620px"
  append-to-body
><el-descriptions
  :column="2"
  border
><el-descriptions-item label="计薪月份">{{ formatHrmYearMonth(detail && detail.year, detail && detail.month) }}</el-descriptions-item><el-descriptions-item label="出勤天数">{{ detail && detail.actualWorkDay != null ? detail.actualWorkDay : '-' }} / {{ detail && detail.needWorkDay != null ? detail.needWorkDay : '-' }} 天</el-descriptions-item><el-descriptions-item label="应发工资">{{ formatHrmMoney(detail && detail.expectedPaySalary) }}</el-descriptions-item><el-descriptions-item label="个人所得税">{{ formatHrmMoney(detail && detail.personalTax) }}</el-descriptions-item><el-descriptions-item
  label="实发工资"
  :span="2"
>{{ formatHrmMoney(detail && detail.realPaySalary) }}</el-descriptions-item></el-descriptions><el-table
  v-if="detail && detail.optionValues && detail.optionValues.length"
  :data="detail.optionValues"
  class="option-table"
><el-table-column
  label="工资项"
  prop="name"
  min-width="180"
/><el-table-column
  label="金额"
  align="right"
  width="140"
><template slot-scope="scope">{{ formatHrmMoney(scope.row.value) }}</template></el-table-column></el-table></el-dialog></el-card></template>
<script>import { getSalaryEmployeeMonthRecordPage } from '@/api/hrm/salary/month-record/employee'; import { HrmSalaryMonthStatus } from '@/views/hrm/utils/constants'; import { formatHrmMoney, formatHrmYearMonth } from '@/views/hrm/utils/format'; export default { name: 'HrmEmployeeSalaryHistoryList', props: { employeeId: { type: Number, required: true }}, data() { return { loading: true, total: 0, list: [], queryParams: { pageNo: 1, pageSize: 10 }, detailVisible: false, detail: undefined } }, created() { this.getList() }, methods: { formatHrmMoney, formatHrmYearMonth, async getList() { this.loading = true; try { const response = await getSalaryEmployeeMonthRecordPage(Object.assign({}, this.queryParams, { employeeId: this.employeeId, monthRecordStatus: HrmSalaryMonthStatus.HISTORY })); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } }, openDetail(row) { this.detail = row; this.detailVisible = true } }}</script>
<style scoped>.section-card { margin-bottom:16px; }.option-table { margin-top:16px; }</style>
