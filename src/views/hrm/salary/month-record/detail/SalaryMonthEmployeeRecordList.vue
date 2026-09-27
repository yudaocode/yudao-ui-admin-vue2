<template>
  <div>
    <el-card shadow="never">
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
            class="employee-input"
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
            class="job-input"
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
            class="dept-select"
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
        :summary-method="getSummaries"
        border
        show-summary
        stripe
      >
        <el-table-column
          fixed="left"
          label="员工姓名"
          min-width="130"
          prop="employeeName"
        />
        <el-table-column
          fixed="left"
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
  </div>
</template>

<script>
import {
  getSalaryMonthEmployeeRecordPage
} from '@/api/hrm/salary/month-record/employee'
import { getSalaryMonthOptionSummary } from '@/api/hrm/salary/month-record'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import { formatHrmMoney } from '@/views/hrm/utils/format'

export default {
  name: 'HrmSalaryMonthEmployeeRecordList',
  components: { DeptSelect },
  props: { record: { type: Object, required: true }},
  data() {
    return {
      loading: false,
      total: 0,
      list: [],
      summaryList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        monthRecordId: this.record.id,
        employeeName: undefined,
        jobNumber: undefined,
        deptId: undefined
      }
    }
  },
  computed: {
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
    async getList() {
      this.loading = true
      try {
        const response = await getSalaryMonthEmployeeRecordPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    async getSummary() {
      const response = await getSalaryMonthOptionSummary(this.queryParams)
      this.summaryList = response.data
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return Promise.all([this.getList(), this.getSummary()])
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    getSummaries({ columns }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        const optionCode = Number(String(column.property || '').replace('option-', ''))
        return Number.isSafeInteger(optionCode) ? formatHrmMoney(this.summaryMap[optionCode]) : ''
      })
    },
    async init() {
      await Promise.all([this.getList(), this.getSummary()])
    }
  }
}
</script>

<style scoped>
.block-card { margin-top: 16px; }
.employee-input { width: 180px; }
.job-input { width: 160px; }
.dept-select { width: 200px; }
</style>
