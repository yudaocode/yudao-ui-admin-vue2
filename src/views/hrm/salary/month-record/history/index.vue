<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="68px"
      >
        <el-form-item
          label="年份"
          prop="year"
        >
          <el-date-picker
            v-model="queryParams.year"
            class="year-picker"
            clearable
            placeholder="请选择年份"
            type="year"
            value-format="yyyy"
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
        stripe
      >
        <el-table-column
          fixed="left"
          label="工资表"
          min-width="180"
          prop="title"
        >
          <template slot-scope="scope">
            <el-link
              :underline="false"
              type="primary"
              @click="openDetail(scope.row.id)"
            >{{ scope.row.title || '-' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="月份"
          width="100"
        >
          <template slot-scope="scope">{{ formatHrmYearMonth(scope.row.year, scope.row.month) }}</template>
        </el-table-column>
        <el-table-column
          align="center"
          label="计薪人数"
          prop="employeeCount"
          width="100"
        />
        <el-table-column
          align="right"
          label="应发工资"
          width="130"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.expectedPaySalary) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="实发工资"
          width="130"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.realPaySalary) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="个税总额"
          width="130"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.personalTax) }}</template>
        </el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          width="90"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="openDetail(scope.row.id)"
            >详情</el-button>
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
import { getSalaryMonthRecordPage } from '@/api/hrm/salary/month-record'
import { HrmSalaryMonthStatus } from '@/views/hrm/utils/constants'
import { formatHrmMoney, formatHrmYearMonth } from '@/views/hrm/utils/format'

export default {
  name: 'HrmSalaryHistory',
  data() {
    return {
      loading: false,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        year: String(new Date().getFullYear())
      }
    }
  },
  created() { this.getList() },
  methods: {
    formatHrmMoney,
    formatHrmYearMonth,
    async getList() {
      this.loading = true
      try {
        const params = {
          ...this.queryParams,
          year: this.queryParams.year ? Number(this.queryParams.year) : undefined,
          status: HrmSalaryMonthStatus.HISTORY
        }
        const response = await getSalaryMonthRecordPage(params)
        this.list = response.data.list
        this.total = response.data.total
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
      this.handleQuery()
    },
    openDetail(id) {
      if (!id) return
      this.$router.push({ name: 'HrmSalaryHistoryDetail', params: { id }})
    }
  }
}
</script>

<style scoped>
.block-card { margin-top: 16px; }
.year-picker { width: 160px; }
</style>
