<template>
  <div v-if="accessible">
    <el-card
      shadow="never"
      class="query-card"
    >
      <el-form
        ref="queryFormRef"
        :model="queryParams"
        :inline="true"
        label-width="68px"
      >
        <el-form-item
          label="考核名称"
          prop="search"
        ><el-input
          v-model="queryParams.search"
          clearable
          placeholder="请输入考核名称"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item><el-button
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button><el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        border
      >
        <el-table-column
          label="考核名称"
          prop="name"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column
          label="考核周期"
          min-width="210"
        ><template slot-scope="scope">{{ formatHrmDate(scope.row.startTime) }} 至 {{ formatHrmDate(scope.row.endTime) }}</template></el-table-column>
        <el-table-column
          label="绩效得分"
          width="110"
          align="center"
        ><template slot-scope="scope">{{ formatHrmScore(scope.row.score) }}</template></el-table-column>
        <el-table-column
          label="绩效等级"
          width="110"
          align="center"
        ><template slot-scope="scope"><el-tag
          v-if="scope.row.resultLevel"
          type="success"
          effect="plain"
        >{{ scope.row.resultLevel }}</el-tag><span v-else>-</span></template></el-table-column>
        <el-table-column
          label="绩效系数"
          width="100"
          align="center"
        ><template slot-scope="scope">{{ scope.row.coefficient == null ? '-' : scope.row.coefficient }}</template></el-table-column>
        <el-table-column
          label="归档时间"
          width="180"
        ><template slot-scope="scope">{{ formatHrmDateTime(scope.row.archiveTime) }}</template></el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="90"
          align="center"
        ><template slot-scope="scope"><el-button
          type="text"
          @click="openDetail(scope.row)"
        >查看</el-button></template></el-table-column>
      </el-table>
      <Pagination
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>
    <PerformanceAssessmentDetail ref="detailRef" />
  </div>
</template>

<script>
import { getPerformanceAssessmentPage } from '@/api/hrm/portal/performance/assessment'
import { checkHrmPortalAccess } from '@/views/hrm/portal/utils/access'
import { formatHrmDate, formatHrmDateTime } from '@/views/hrm/utils/format'
import { formatHrmScore } from '@/views/hrm/portal/utils/format'
import PerformanceAssessmentDetail from '../detail/index.vue'

export default {
  name: 'HrmPortalPerformanceHistory',
  components: { PerformanceAssessmentDetail },
  data() {
    return {
      accessible: false,
      loading: false,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10, search: undefined, archived: true }
    }
  },
  async activated() {
    this.accessible = await checkHrmPortalAccess(this.$router)
    if (!this.accessible) return
    await this.getList()
  },
  methods: {
    formatHrmDate,
    formatHrmDateTime,
    formatHrmScore,
    async getList() {
      this.loading = true
      try {
        const response = await getPerformanceAssessmentPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() },
    resetQuery() { this.$refs.queryFormRef.resetFields(); return this.handleQuery() },
    openDetail(row) { this.$refs.detailRef.open(row) }
  }
}
</script>

<style scoped>
.query-card { margin-bottom: 15px; }
.query-card /deep/ .el-form-item { margin-bottom: 0; }
</style>
