<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="84px"
      >
        <el-form-item
          label="工资月份"
          prop="month"
        >
          <el-date-picker
            v-model="queryParams.month"
            class="month-picker"
            clearable
            placeholder="请选择工资月份"
            type="month"
            value-format="yyyy-MM"
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
      >
        <el-table-column
          align="center"
          label="工资月份"
          width="120"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="openDetail(scope.row.id)"
            >{{ formatHrmYearMonth(scope.row.year, scope.row.month) }}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="创建人"
          min-width="120"
          prop="creatorName"
          show-overflow-tooltip
        />
        <el-table-column
          :formatter="dateFormatter"
          align="center"
          label="发放时间"
          prop="createTime"
          width="180"
        />
        <el-table-column
          align="center"
          label="工资表总人数"
          prop="employeeCount"
          width="130"
        />
        <el-table-column
          align="center"
          label="发放人数"
          prop="sendEmployeeCount"
          width="110"
        />
        <el-table-column
          align="center"
          label="已查看人数"
          prop="readCount"
          width="110"
        />
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          width="140"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="openDetail(scope.row.id)"
            >详情</el-button>
            <el-button
              v-hasPermi="['hrm:salary:slip:delete']"
              type="text"
              class="danger-text"
              @click="handleDeleteRecord(scope.row.id)"
            >删除</el-button>
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
import { dateFormatter, formatDate } from '@/utils/formatTime'
import {
  deleteSalarySlipSendRecord,
  getSalarySlipSendRecordPage
} from '@/api/hrm/salary/slip/send-record'
import { formatHrmYearMonth } from '@/views/hrm/utils/format'

export default {
  name: 'HrmSalarySlipSendRecord',
  data() {
    return {
      loading: false,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        month: formatDate(new Date(), 'YYYY-MM')
      }
    }
  },
  created() { this.getList() },
  methods: {
    dateFormatter,
    formatHrmYearMonth,
    async getList() {
      this.loading = true
      try {
        const values = this.queryParams.month ? this.queryParams.month.split('-').map(Number) : []
        const response = await getSalarySlipSendRecordPage({
          pageNo: this.queryParams.pageNo,
          pageSize: this.queryParams.pageSize,
          year: values[0],
          month: values[1]
        })
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
      this.queryParams.month = formatDate(new Date(), 'YYYY-MM')
      this.handleQuery()
    },
    openDetail(id) {
      if (!id) return
      this.$router.push({ name: 'HrmSalarySlipSendRecordDetail', params: { id }})
    },
    async handleDeleteRecord(id) {
      if (!id) return
      try {
        await this.$modal.confirm('删除后，本次发放的工资条将同时删除，是否继续？')
        await deleteSalarySlipSendRecord(id)
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        await this.getList()
      } catch (error) {}
    }
  }
}
</script>

<style scoped>
.block-card { margin-top: 16px; }
.month-picker { width: 180px; }
.danger-text { color: #f56c6c; }
</style>
