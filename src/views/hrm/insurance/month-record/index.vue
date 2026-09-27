<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="toolbar">
        <el-date-picker
          v-model="queryYear"
          :clearable="false"
          class="year-picker"
          format="yyyy 年"
          type="year"
          value-format="yyyy"
          @change="getList()"
        />
        <el-button
          v-hasPermi="['hrm:insurance:month-record:create']"
          :loading="createLoading"
          plain
          type="primary"
          icon="el-icon-plus"
          @click="handleCreate"
        >{{ latestRecord ? '新建次月社保表' : '新建首月社保表' }}</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="list"
        stripe
      >
        <el-table-column
          fixed="left"
          label="社保表"
          min-width="190"
          prop="title"
        >
          <template slot-scope="scope">
            <el-link
              :underline="false"
              type="primary"
              @click="openDetail(scope.row.id)"
            >
              {{ scope.row.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="参保人数"
          prop="insuredEmployeeCount"
          width="100"
        />
        <el-table-column
          align="center"
          label="停保人数"
          prop="stoppedEmployeeCount"
          width="100"
        />
        <el-table-column
          align="right"
          label="个人社保"
          width="120"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.personalInsuranceAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="公司社保"
          width="120"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.corporateInsuranceAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="个人公积金"
          width="130"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.personalProvidentFundAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="公司公积金"
          width="130"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.corporateProvidentFundAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          width="80"
        >
          <template slot-scope="scope">
            <el-button
              v-if="isLatestEditableRecord(scope.row)"
              v-hasPermi="['hrm:insurance:month-record:delete']"
              type="text"
              class="danger-text"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <insurance-first-month-form
      ref="firstMonthForm"
      @success="handleCreateFirstSuccess"
    />
  </div>
</template>

<script>
import {
  createNextInsuranceMonthRecord,
  deleteInsuranceMonthRecord,
  getInsuranceMonthRecordList,
  getLastInsuranceMonthRecord
} from '@/api/hrm/insurance/month-record'
import { HrmInsuranceMonthStatus } from '@/views/hrm/utils/constants'
import { formatHrmMoney } from '@/views/hrm/utils/format'
import InsuranceFirstMonthForm from './InsuranceFirstMonthForm.vue'

export default {
  name: 'HrmInsuranceMonthRecord',
  components: { InsuranceFirstMonthForm },
  data() {
    return {
      loading: true,
      createLoading: false,
      queryYear: String(new Date().getFullYear()),
      list: [],
      latestRecord: undefined,
      HrmInsuranceMonthStatus
    }
  },
  created() { this.getList(true) },
  methods: {
    formatHrmMoney,
    async getList(useLatestYear = false) {
      this.loading = true
      try {
        const latestResponse = await getLastInsuranceMonthRecord()
        const latestRecord = latestResponse.data
        const queryYear = useLatestYear && latestRecord && latestRecord.year
          ? String(latestRecord.year)
          : this.queryYear
        const listResponse = await getInsuranceMonthRecordList(Number(queryYear))
        this.latestRecord = latestRecord
        this.queryYear = queryYear
        this.list = listResponse.data
      } finally {
        this.loading = false
      }
    },
    openDetail(id) {
      if (!id) return
      this.$router.push({ name: 'HrmInsuranceMonthRecordDetail', params: { id }})
    },
    handleCreate() {
      if (!this.latestRecord) {
        this.$refs.firstMonthForm.open()
        return
      }
      this.handleCreateNext()
    },
    handleCreateFirstSuccess(year) {
      this.queryYear = String(year)
      this.getList()
    },
    async handleCreateNext() {
      try {
        await this.$modal.confirm('新建次月社保后，本月数据将不可修改。请确认要新建次月社保吗？')
        this.createLoading = true
        const response = await createNextInsuranceMonthRecord()
        this.$modal.msgSuccess('新建成功')
        this.openDetail(response.data)
      } finally {
        this.createLoading = false
      }
    },
    async handleDelete(row) {
      if (!row.id) return
      try {
        await this.$modal.confirm(`确认删除“${row.title}”吗？`)
        await deleteInsuranceMonthRecord(row.id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {}
    },
    isLatestEditableRecord(row) {
      return row.id === (this.latestRecord && this.latestRecord.id) &&
        row.status === HrmInsuranceMonthStatus.UNARCHIVED
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.year-picker { width: 140px; }
.danger-text { color: #f56c6c; }
</style>
