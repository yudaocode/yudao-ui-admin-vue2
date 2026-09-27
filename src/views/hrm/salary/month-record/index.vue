<template>
  <div class="app-container">
    <el-card
      v-loading="pageLoading"
      shadow="never"
    >
      <template v-if="record.id">
        <div class="record-title">
          <span>月度工资表</span>
          <small>（计薪周期：{{ formatHrmDateRange(record.startTime, record.endTime) }}）</small>
        </div>
        <el-form
          :inline="true"
          :model="queryParams"
          class="query-form"
          label-width="68px"
        >
          <el-form-item
            label="员工姓名"
            prop="employeeName"
          >
            <el-input
              v-model="queryParams.employeeName"
              class="query-input"
              clearable
              placeholder="请输入员工姓名"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item
            label="工号"
            prop="jobNumber"
          >
            <el-input
              v-model="queryParams.jobNumber"
              class="query-input"
              clearable
              placeholder="请输入工号"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item
            label="部门"
            prop="deptId"
          >
            <dept-select
              v-model="queryParams.deptId"
              class="query-input"
              placeholder="请选择部门"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="handleQuery"
            >搜索</el-button>
            <el-button
              icon="el-icon-refresh"
              @click="resetQuery"
            >重置</el-button>
            <el-button
              v-if="isWritable"
              v-hasPermi="['hrm:salary:month-record:update']"
              plain
              type="primary"
              icon="el-icon-edit"
              @click="openBatchEdit"
            >在线编辑</el-button>
            <el-button
              v-if="isWritable"
              v-hasPermi="['hrm:salary:month-record:compute']"
              plain
              type="primary"
              icon="el-icon-cpu"
              @click="$refs.computeForm.open(record)"
            >核算工资</el-button>
            <el-button
              v-if="isComputed"
              v-hasPermi="['hrm:salary:slip:create']"
              plain
              type="primary"
              icon="el-icon-position"
              @click="openSlipSendForm"
            >发送工资条</el-button>
            <el-button
              v-hasPermi="['hrm:salary:month-record:create']"
              plain
              type="primary"
              icon="el-icon-plus"
              @click="handleCreateNext"
            >创建下月工资表</el-button>
            <el-button
              v-if="isWritable"
              v-hasPermi="['hrm:salary:month-record:delete']"
              plain
              type="danger"
              icon="el-icon-delete"
              @click="handleDelete"
            >删除工资表</el-button>
          </el-form-item>
        </el-form>
        <el-alert
          v-if="isArchived"
          :closable="false"
          class="status-alert"
          show-icon
          title="当前工资表已归档，仅可查询。"
          type="info"
        />
        <salary-payroll-readiness-alert
          ref="readinessAlert"
          :month-record-id="record.id"
        />
      </template>
      <el-empty
        v-else
        description="暂无月度工资表"
      >
        <el-button
          v-hasPermi="['hrm:salary:month-record:create']"
          :loading="createLoading"
          type="primary"
          @click="handleCreate"
        >初始化月度工资表</el-button>
      </el-empty>
    </el-card>
    <el-card
      v-if="record.id"
      class="block-card"
      shadow="never"
    >
      <el-tabs
        v-model="activeEmployeeChangeType"
        @tab-click="handleTabChange"
      >
        <el-tab-pane
          v-for="tab in employeeChangeTabs"
          :key="tab.type"
          :name="String(tab.type)"
        >
          <span slot="label">{{ tab.label }}（{{ employeeChangeCount[tab.type] || 0 }}）</span>
        </el-tab-pane>
      </el-tabs>
      <el-table
        v-loading="loading"
        :data="list"
        :summary-method="getSummaries"
        border
        show-summary
        stripe
      >
        <el-table-column
          fixed="left"
          label="姓名"
          min-width="130"
          prop="employeeName"
        />
        <el-table-column
          label="工号"
          prop="jobNumber"
          width="120"
        />
        <el-table-column
          label="部门"
          min-width="130"
          prop="deptName"
        />
        <el-table-column
          label="岗位"
          min-width="130"
          prop="postName"
        />
        <el-table-column
          align="right"
          label="计薪天数"
          width="110"
        >
          <template slot-scope="scope">{{ formatHrmDays(scope.row.needWorkDay) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="实际计薪天数"
          width="130"
        >
          <template slot-scope="scope">{{ formatHrmDays(scope.row.actualWorkDay) }}</template>
        </el-table-column>
        <el-table-column
          v-for="option in optionColumns"
          :key="option.code"
          :label="option.name"
          :prop="'option-' + option.code"
          align="right"
          min-width="120"
        >
          <template slot-scope="scope">
            {{ formatHrmMoney(getSalaryOptionValue(scope.row, option.code)) }}
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :limit.sync="queryParams.pageSize"
        :page.sync="queryParams.pageNo"
        :total="total"
        @pagination="getList"
      />
    </el-card>
    <salary-batch-employee-record-form
      ref="batchForm"
      @success="refreshData"
    />
    <salary-month-compute-form
      ref="computeForm"
      @success="refreshData"
    />
    <salary-slip-send-form ref="slipSendForm" />
  </div>
</template>

<script>
import {
  createNextSalaryMonthRecord,
  deleteSalaryMonthRecord,
  getLastSalaryMonthRecord,
  getSalaryMonthOptionSummary,
  getSalaryMonthRecord
} from '@/api/hrm/salary/month-record'
import {
  getSalaryMonthEmployeeChangeCount,
  getSalaryMonthEmployeeRecordPage
} from '@/api/hrm/salary/month-record/employee'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import { HrmSalaryEmployeeChangeType, HrmSalaryMonthStatus } from '@/views/hrm/utils/constants'
import { formatHrmDateRange, formatHrmDays, formatHrmMoney } from '@/views/hrm/utils/format'
import SalaryBatchEmployeeRecordForm from './SalaryBatchEmployeeRecordForm.vue'
import SalaryMonthComputeForm from './SalaryMonthComputeForm.vue'
import SalaryPayrollReadinessAlert from './SalaryPayrollReadinessAlert.vue'
import SalarySlipSendForm from '../slip/send-record/SalarySlipSendForm.vue'

export default {
  name: 'HrmSalaryMonthRecord',
  components: {
    DeptSelect,
    SalaryBatchEmployeeRecordForm,
    SalaryMonthComputeForm,
    SalaryPayrollReadinessAlert,
    SalarySlipSendForm
  },
  data() {
    return {
      pageLoading: false,
      createLoading: false,
      record: {},
      loading: false,
      total: 0,
      list: [],
      employeeChangeCount: {},
      summaryList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        monthRecordId: undefined,
        employeeName: undefined,
        jobNumber: undefined,
        deptId: undefined,
        employeeChangeType: HrmSalaryEmployeeChangeType.ALL
      },
      employeeChangeTabs: [
        { type: HrmSalaryEmployeeChangeType.ALL, label: '计薪人数' },
        { type: HrmSalaryEmployeeChangeType.ENTRY, label: '新入职' },
        { type: HrmSalaryEmployeeChangeType.LEAVE, label: '离职' },
        { type: HrmSalaryEmployeeChangeType.REGULAR, label: '转正' },
        { type: HrmSalaryEmployeeChangeType.TRANSFER, label: '调岗' }
      ]
    }
  },
  computed: {
    activeEmployeeChangeType: {
      get() { return String(this.queryParams.employeeChangeType) },
      set(value) { this.queryParams.employeeChangeType = Number(value) }
    },
    isArchived() { return this.record.status === HrmSalaryMonthStatus.HISTORY },
    isComputed() { return this.record.status === HrmSalaryMonthStatus.COMPUTED },
    isWritable() { return !this.isArchived },
    optionColumns() { return this.getLeafOptions(this.record.optionHeaders) },
    summaryMap() {
      return this.summaryList.filter(option => option.code !== undefined).reduce((result, option) => {
        result[option.code] = Number(option.value || 0)
        return result
      }, {})
    }
  },
  created() { this.init() },
  methods: {
    formatHrmDateRange,
    formatHrmDays,
    formatHrmMoney,
    getLeafOptions(options) {
      const result = []
      const append = values => {
        (values || []).forEach(option => {
          if (option.children && option.children.length) append(option.children)
          else result.push(option)
        })
      }
      append(options)
      return result
    },
    getSalaryOptionValue(employeeRecord, optionCode) {
      const option = (employeeRecord.optionValues || []).find(item => item.code === optionCode)
      return option && option.value
    },
    async getRecord() {
      if (!this.record.id) return
      const response = await getSalaryMonthRecord(this.record.id)
      this.record = response.data
    },
    async getList() {
      if (!this.queryParams.monthRecordId) {
        this.list = []
        this.total = 0
        return
      }
      this.loading = true
      try {
        const response = await getSalaryMonthEmployeeRecordPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    async getEmployeeChangeCount() {
      if (!this.queryParams.monthRecordId) {
        this.employeeChangeCount = {}
        return
      }
      const response = await getSalaryMonthEmployeeChangeCount(this.queryParams)
      this.employeeChangeCount = response.data
    },
    async refreshData() {
      await Promise.all([
        this.getRecord(),
        this.getList(),
        this.getEmployeeChangeCount(),
        this.getSummary(),
        this.getReadiness()
      ])
    },
    async handleQuery() {
      this.queryParams.pageNo = 1
      await Promise.all([this.getList(), this.getEmployeeChangeCount(), this.getSummary()])
    },
    resetQuery() {
      this.queryParams.employeeName = undefined
      this.queryParams.jobNumber = undefined
      this.queryParams.deptId = undefined
      this.handleQuery()
    },
    handleTabChange() {
      this.queryParams.pageNo = 1
      return Promise.all([this.getList(), this.getSummary()])
    },
    openBatchEdit() {
      this.$refs.batchForm.open(this.record, this.queryParams)
    },
    async handleCreate() {
      this.createLoading = true
      try {
        await createNextSalaryMonthRecord()
        this.$modal.msgSuccess('新建成功')
        await this.init()
      } finally {
        this.createLoading = false
      }
    },
    async handleCreateNext() {
      try {
        await this.$modal.confirm('新建下月工资表后，当前工资表将归入历史工资且不可修改。请确认要新建下月工资表吗？')
      } catch (error) {
        return
      }
      await createNextSalaryMonthRecord()
      this.$modal.msgSuccess('新建成功')
      await this.init()
    },
    openSlipSendForm() {
      if (this.record.id) this.$refs.slipSendForm.open(this.record.id)
    },
    async handleDelete() {
      if (!this.record.id) return
      try {
        await this.$modal.confirm('删除当前工资表后，上月工资表将恢复为当前工资表且支持修改。请确认要删除当前工资表吗？')
      } catch (error) {
        return
      }
      await deleteSalaryMonthRecord(this.record.id)
      this.$modal.msgSuccess('删除成功')
      await this.init()
    },
    async getSummary() {
      if (!this.record.id) {
        this.summaryList = []
        return
      }
      const response = await getSalaryMonthOptionSummary(this.queryParams)
      this.summaryList = response.data
    },
    getSummaries({ columns }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        const optionCode = Number(String(column.property || '').replace('option-', ''))
        return Number.isSafeInteger(optionCode) ? formatHrmMoney(this.summaryMap[optionCode]) : ''
      })
    },
    async getReadiness() {
      await this.$nextTick()
      if (this.$refs.readinessAlert) await this.$refs.readinessAlert.refresh()
    },
    async init() {
      this.pageLoading = true
      try {
        const response = await getLastSalaryMonthRecord()
        this.record = response.data
        this.queryParams.monthRecordId = this.record.id
        this.queryParams.pageNo = 1
        if (!this.record.id) {
          this.list = []
          this.total = 0
          this.employeeChangeCount = {}
          this.summaryList = []
          return
        }
        await Promise.all([
          this.getList(),
          this.getEmployeeChangeCount(),
          this.getSummary(),
          this.getReadiness()
        ])
      } finally {
        this.pageLoading = false
      }
    }
  }
}
</script>

<style scoped>
.record-title { display: flex; align-items: center; font-size: 18px; font-weight: 700; }
.record-title small { margin-left: 8px; color: #909399; font-size: 14px; font-weight: 400; }
.query-form { margin-top: 16px; }
.query-input { width: 240px; }
.status-alert, .block-card { margin-top: 8px; }
</style>
