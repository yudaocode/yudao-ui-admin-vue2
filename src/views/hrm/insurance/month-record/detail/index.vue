<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="page-header">
        <el-page-header
          :content="monthRecord.title || '月度社保详情'"
          @back="close"
        />
        <el-button
          v-if="editable"
          v-hasPermi="['hrm:insurance:month-record:update']"
          plain
          type="primary"
          icon="el-icon-plus"
          @click="$refs.addEmployeeForm.open(monthRecord.id)"
        >添加参保人员</el-button>
      </div>
    </el-card>

    <el-card
      v-loading="recordLoading"
      class="block-card"
      shadow="never"
    >
      <el-descriptions
        :column="3"
        border
      >
        <el-descriptions-item label="参保人数">
          <el-link
            :underline="false"
            type="primary"
            @click="handleStatusChange(HrmInsuranceEmployeeStatus.NORMAL)"
          >{{ monthRecord.insuredEmployeeCount == null ? 0 : monthRecord.insuredEmployeeCount }}</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="停保人数">
          <el-link
            :underline="false"
            type="primary"
            @click="handleStatusChange(HrmInsuranceEmployeeStatus.STOPPED)"
          >{{ monthRecord.stoppedEmployeeCount == null ? 0 : monthRecord.stoppedEmployeeCount }}</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="个人社保">{{ formatHrmMoney(monthRecord.personalInsuranceAmount) }}</el-descriptions-item>
        <el-descriptions-item label="公司社保">{{ formatHrmMoney(monthRecord.corporateInsuranceAmount) }}</el-descriptions-item>
        <el-descriptions-item label="个人公积金">{{ formatHrmMoney(monthRecord.personalProvidentFundAmount) }}</el-descriptions-item>
        <el-descriptions-item label="公司公积金">{{ formatHrmMoney(monthRecord.corporateProvidentFundAmount) }}</el-descriptions-item>
      </el-descriptions>
      <el-alert
        v-if="monthRecord.id && !editable"
        :closable="false"
        class="archive-alert"
        show-icon
        title="当前社保表已归档，仅可查询。"
        type="info"
      />
    </el-card>

    <el-card
      class="block-card"
      shadow="never"
    >
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="76px"
      >
        <el-form-item
          label="员工姓名"
          prop="employeeName"
        >
          <el-input
            v-model="queryParams.employeeName"
            class="employee-query"
            clearable
            placeholder="请输入员工姓名"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="参保方案"
          prop="schemeId"
        >
          <insurance-scheme-select
            v-model="queryParams.schemeId"
            class="scheme-query"
          />
        </el-form-item>
        <el-form-item
          label="参保城市"
          prop="areaId"
        >
          <area-select
            v-model="queryParams.areaId"
            :selectable-levels="[2, 3]"
            check-strictly
            class="area-query"
            placeholder="请选择参保城市"
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
            v-if="editable"
            v-hasPermi="['hrm:insurance:month-record:update']"
            :disabled="selectedIds.length === 0"
            plain
            type="primary"
            @click="$refs.batchForm.open(selectedIds)"
          >调整参保方案</el-button>
          <el-button
            v-if="editable"
            v-hasPermi="['hrm:insurance:month-record:update']"
            :disabled="stoppableSelectedIds.length === 0"
            plain
            type="danger"
            @click="handleStop(stoppableSelectedIds)"
          >停止参保</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card
      class="block-card"
      shadow="never"
    >
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="editable"
          type="selection"
          width="45"
        />
        <el-table-column
          fixed="left"
          label="姓名"
          min-width="130"
          prop="employeeName"
        >
          <template slot-scope="scope">
            <el-link
              :underline="false"
              type="primary"
              @click="$refs.detail.open(scope.row.id)"
            >
              {{ scope.row.employeeName || '-' }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="工号"
          prop="jobNumber"
          width="110"
        />
        <el-table-column
          label="部门"
          min-width="120"
          prop="deptName"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          label="入职日期"
          prop="entryTime"
          width="110"
        >
          <template slot-scope="scope">{{ formatHrmDate(scope.row.entryTime) }}</template>
        </el-table-column>
        <el-table-column
          label="手机号码"
          prop="mobile"
          width="130"
        />
        <el-table-column
          label="参保城市"
          min-width="160"
          prop="areaName"
          show-overflow-tooltip
        />
        <el-table-column
          label="参保方案"
          min-width="160"
          prop="schemeName"
          show-overflow-tooltip
        />
        <el-table-column
          align="right"
          label="个人社保费"
          width="120"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.personalInsuranceAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="公司社保费"
          width="120"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.corporateInsuranceAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="个人公积金费"
          width="130"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.personalProvidentFundAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="公司公积金费"
          width="130"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.corporateProvidentFundAmount) }}</template>
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

    <insurance-employee-record-form
      ref="form"
      @success="refreshData"
    />
    <insurance-batch-employee-record-form
      ref="batchForm"
      @success="refreshData"
    />
    <insurance-add-employee-form
      ref="addEmployeeForm"
      @success="refreshData"
    />
    <insurance-month-employee-detail
      ref="detail"
      :editable="editable"
      @edit="$refs.form.open($event)"
    />
  </div>
</template>

<script>
import { getInsuranceMonthRecord } from '@/api/hrm/insurance/month-record'
import {
  getInsuranceMonthEmployeeRecordPage,
  stopInsuranceMonthEmployeeRecordList
} from '@/api/hrm/insurance/month-record/employee'
import AreaSelect from '@/views/system/area/components/AreaSelect.vue'
import InsuranceSchemeSelect from '@/views/hrm/insurance/scheme/components/InsuranceSchemeSelect.vue'
import { HrmInsuranceEmployeeStatus, HrmInsuranceMonthStatus } from '@/views/hrm/utils/constants'
import { formatHrmDate, formatHrmMoney } from '@/views/hrm/utils/format'
import InsuranceAddEmployeeForm from './InsuranceAddEmployeeForm.vue'
import InsuranceBatchEmployeeRecordForm from './InsuranceBatchEmployeeRecordForm.vue'
import InsuranceEmployeeRecordForm from './InsuranceEmployeeRecordForm.vue'
import InsuranceMonthEmployeeDetail from './InsuranceMonthEmployeeDetail.vue'

export default {
  name: 'HrmInsuranceMonthRecordDetail',
  components: {
    AreaSelect,
    InsuranceSchemeSelect,
    InsuranceAddEmployeeForm,
    InsuranceBatchEmployeeRecordForm,
    InsuranceEmployeeRecordForm,
    InsuranceMonthEmployeeDetail
  },
  data() {
    const id = Number(this.$route.params.id)
    return {
      id,
      HrmInsuranceEmployeeStatus,
      recordLoading: true,
      loading: true,
      monthRecord: {},
      list: [],
      total: 0,
      selectedRecords: [],
      activeStatus: HrmInsuranceEmployeeStatus.NORMAL,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        monthRecordId: id,
        employeeName: undefined,
        schemeId: undefined,
        areaId: undefined,
        status: Number(HrmInsuranceEmployeeStatus.NORMAL)
      }
    }
  },
  computed: {
    editable() { return this.monthRecord.status === HrmInsuranceMonthStatus.UNARCHIVED },
    selectedIds() { return this.selectedRecords.map(row => row.id).filter(recordId => Boolean(recordId)) },
    stoppableSelectedIds() {
      return this.selectedRecords
        .filter(row => row.status === HrmInsuranceEmployeeStatus.NORMAL)
        .map(row => row.id)
        .filter(recordId => Boolean(recordId))
    }
  },
  created() { this.init() },
  methods: {
    formatHrmDate,
    formatHrmMoney,
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ name: 'HrmInsuranceMonthRecord' })
    },
    async getMonthRecord() {
      this.recordLoading = true
      try {
        const response = await getInsuranceMonthRecord(this.id)
        if (!response.data) {
          this.$modal.msgWarning('月度社保表不存在')
          this.close()
          return
        }
        this.monthRecord = response.data
      } finally {
        this.recordLoading = false
      }
    },
    async getList() {
      this.loading = true
      try {
        const response = await getInsuranceMonthEmployeeRecordPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
        this.selectedRecords = []
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.queryParams.status = this.activeStatus
      this.handleQuery()
    },
    handleStatusChange(status) {
      this.activeStatus = status
      this.queryParams.status = status
      this.handleQuery()
    },
    handleSelectionChange(rows) { this.selectedRecords = rows },
    async handleStop(ids) {
      if (!this.editable || ids.length === 0) return
      await this.$modal.confirm(`确认停止选中的 ${ids.length} 名员工参保吗？`)
      await stopInsuranceMonthEmployeeRecordList({ ids })
      this.$modal.msgSuccess('停止参保成功')
      await this.refreshData()
    },
    async refreshData() {
      await Promise.all([this.getMonthRecord(), this.getList()])
    },
    async init() {
      if (!Number.isSafeInteger(this.id) || this.id <= 0) {
        this.$modal.msgWarning('参数错误，月度社保表不能为空！')
        this.close()
        return
      }
      await Promise.all([this.getMonthRecord(), this.getList()])
    }
  }
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.block-card { margin-top: 16px; }
.archive-alert { margin-top: 16px; }
.employee-query { width: 200px; }
.scheme-query { width: 220px; }
.area-query { width: 180px; }
</style>
