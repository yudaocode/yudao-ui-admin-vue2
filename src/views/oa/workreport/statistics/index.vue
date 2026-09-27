<template>
  <el-row :gutter="20" class="app-container oa-work-report-statistics">
    <!-- 左侧部门树 -->
    <el-col :span="4" :xs="24">
      <dept-tree-select ref="deptTreeRef" @node-click="handleDeptNodeClick" />
    </el-col>
    <el-col :span="20" :xs="24">
      <el-tabs v-model="activeType" @tab-click="handleTypeChange">
        <el-tab-pane label="日报" :name="String(OA_WORK_REPORT_TYPE.DAILY)" />
        <el-tab-pane label="周报" :name="String(OA_WORK_REPORT_TYPE.WEEKLY)" />
        <el-tab-pane label="月报" :name="String(OA_WORK_REPORT_TYPE.MONTHLY)" />
      </el-tabs>

      <!-- 搜索工作栏 -->
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        size="small"
        label-width="68px"
        class="query-form"
        @submit.native.prevent
      >
        <el-form-item label="统计周期" prop="reportDate">
          <el-date-picker
            v-model="reportDate"
            style="width: 260px"
            end-placeholder="结束日期"
            start-placeholder="开始日期"
            type="daterange"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-empty v-if="!queryParams.deptId" description="请选择部门查看汇报统计" />
      <template v-else>
        <!-- 汇报统计概览 -->
        <div class="stat-cards">
          <el-card shadow="never" :body-style="{ padding: '12px 16px' }">
            <div class="stat-card">
              <div>
                <div class="stat-label">统计人数</div>
                <div class="stat-value stat-blue">{{ statistics.userCount }} 人</div>
              </div>
            </div>
          </el-card>
          <el-card shadow="never" :body-style="{ padding: '12px 16px' }">
            <div class="stat-card">
              <div>
                <div class="stat-label">应填汇报</div>
                <div class="stat-value stat-orange">{{ statistics.expectedCount }} 份</div>
              </div>
            </div>
          </el-card>
          <el-card shadow="never" :body-style="{ padding: '12px 16px' }">
            <div class="stat-card">
              <div>
                <div class="stat-label">已填汇报</div>
                <div class="stat-value stat-green">{{ statistics.submittedCount }} 份</div>
              </div>
            </div>
          </el-card>
          <el-card shadow="never" :body-style="{ padding: '12px 16px' }">
            <div class="stat-card">
              <div>
                <div class="stat-label">未填汇报</div>
                <div class="stat-value stat-red">{{ statistics.missingCount }} 份</div>
              </div>
            </div>
          </el-card>
          <el-card shadow="never" :body-style="{ padding: '12px 16px' }">
            <div class="stat-card">
              <div>
                <div class="stat-label">整体填写率</div>
                <div class="stat-value stat-purple">{{ calculateFillRate(statistics.submittedCount, statistics.expectedCount) }}%</div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 员工汇报统计 -->
        <el-table v-loading="loading" :data="statistics.users" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="员工" prop="userName" min-width="120" align="center" />
          <el-table-column
            label="部门"
            prop="deptName"
            min-width="120"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column label="应填" prop="expectedCount" min-width="100" align="center" />
          <el-table-column label="已填" prop="submittedCount" min-width="100" align="center">
            <template slot-scope="scope">
              <el-button
                type="text"
                class="success-text"
                @click="openStatisticsDetail(scope.row, 'submitted')"
              >{{ scope.row.submittedCount }}</el-button>
            </template>
          </el-table-column>
          <el-table-column label="未填" prop="missingCount" min-width="100" align="center">
            <template slot-scope="scope">
              <el-button
                type="text"
                :class="scope.row.missingCount ? 'danger-text' : 'muted-text'"
                @click="openStatisticsDetail(scope.row, 'missing')"
              >{{ scope.row.missingCount }}</el-button>
            </template>
          </el-table-column>
          <el-table-column label="填写率" min-width="160" align="center">
            <template slot-scope="scope">
              <el-progress
                :percentage="calculateFillRate(scope.row.submittedCount, scope.row.expectedCount)"
              />
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-col>

    <!-- 员工汇报明细 -->
    <oa-work-report-statistics-detail ref="statisticsDetailRef" />
  </el-row>
</template>

<script>
import dayjs from 'dayjs'
import * as WorkReportApi from '@/api/oa/workreport'
import DeptTreeSelect from '@/views/system/dept/components/DeptTreeSelect.vue'
import { OA_WORK_REPORT_TYPE } from '@/views/oa/utils/constants-collab'
import OaWorkReportStatisticsDetail from './OaWorkReportStatisticsDetail.vue'

/** 获取起止日期范围（含结束日的最后一秒） */
function getDateRange(beginDate, endDate) {
  return [
    dayjs(beginDate).startOf('d').format('YYYY-MM-DD HH:mm:ss'),
    dayjs(endDate).endOf('d').format('YYYY-MM-DD HH:mm:ss')
  ]
}

/** 获得默认统计日期范围：月报从年初开始，日报和周报从月初开始 */
function getDefaultReportDate(type) {
  const currentTime = dayjs()
  return [
    currentTime.startOf(type === OA_WORK_REPORT_TYPE.MONTHLY ? 'year' : 'month').format('YYYY-MM-DD'),
    currentTime.format('YYYY-MM-DD')
  ]
}

export default {
  name: 'OaWorkReportStatistics',
  components: { DeptTreeSelect, OaWorkReportStatisticsDetail },
  data() {
    return {
      OA_WORK_REPORT_TYPE,
      loading: false,
      activeType: String(OA_WORK_REPORT_TYPE.DAILY),
      reportDate: getDefaultReportDate(OA_WORK_REPORT_TYPE.DAILY),
      queryParams: {
        type: OA_WORK_REPORT_TYPE.DAILY,
        startTime: '',
        endTime: '',
        queryStartTime: '',
        queryEndTime: '',
        deptId: undefined
      },
      statistics: {
        userCount: 0,
        expectedCount: 0,
        submittedCount: 0,
        missingCount: 0,
        users: []
      }
    }
  },
  created() {
    this.getStatistics()
  },
  methods: {
    /** 计算填写率，四舍五入保留一位小数 */
    calculateFillRate(submittedCount, expectedCount) {
      if (expectedCount === 0) {
        return 0
      }
      return Math.round((submittedCount * 1000) / expectedCount) / 10
    },
    getStatistics() {
      if (!this.queryParams.deptId || !this.reportDate || !this.reportDate.length) return Promise.resolve()
      this.loading = true
      // 1.1 设置统计时间范围，包含首日零点和末日最后一秒
      const range = getDateRange(this.reportDate[0], this.reportDate[1])
      this.queryParams.startTime = range[0]
      this.queryParams.endTime = range[1]
      // 1.2 设置完整周期的查询范围，避免统计从周中、月中开始时漏掉汇报
      let queryStartTime = dayjs(this.queryParams.startTime)
      let queryEndTime = dayjs(this.queryParams.endTime)
      if (this.queryParams.type === OA_WORK_REPORT_TYPE.WEEKLY) {
        queryStartTime = queryStartTime.subtract((queryStartTime.day() + 6) % 7, 'day')
        queryEndTime = queryEndTime.add((7 - queryEndTime.day()) % 7, 'day')
      } else if (this.queryParams.type === OA_WORK_REPORT_TYPE.MONTHLY) {
        queryStartTime = queryStartTime.startOf('month')
        queryEndTime = queryEndTime.endOf('month')
      }
      const queryRange = getDateRange(queryStartTime, queryEndTime)
      this.queryParams.queryStartTime = queryRange[0]
      this.queryParams.queryEndTime = queryRange[1]
      // 2. 查询并更新工作汇报统计结果
      return WorkReportApi.getWorkReportStatistics(this.queryParams).then(response => {
        this.statistics = response.data
      }).finally(() => {
        this.loading = false
      })
    },
    handleTypeChange(pane) {
      this.queryParams.type = Number(pane.name)
      this.activeType = pane.name
      this.reportDate = getDefaultReportDate(this.queryParams.type)
      return this.getStatistics()
    },
    handleQuery() {
      return this.getStatistics()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.$refs.deptTreeRef.reset()
      this.reportDate = getDefaultReportDate(this.activeType)
      this.queryParams.deptId = undefined
      return this.getStatistics()
    },
    handleDeptNodeClick(deptId) {
      this.queryParams.deptId = deptId
      return this.getStatistics()
    },
    openStatisticsDetail(user, tab) {
      this.$refs.statisticsDetailRef.open(user, tab, this.queryParams)
    }
  }
}
</script>

<style scoped>
.query-form {
  margin-top: 16px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

@media (min-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(5, 1fr);
  }
}

.stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  margin-top: 4px;
  font-size: 22px;
  font-weight: 600;
  line-height: 28px;
}

.stat-blue {
  color: #409eff;
}

.stat-orange {
  color: #e6a23c;
}

.stat-green {
  color: #67c23a;
}

.stat-red {
  color: #f56c6c;
}

.stat-purple {
  color: #b16ae0;
}

.success-text {
  color: #67c23a;
}

.danger-text {
  color: #f56c6c;
}

.muted-text {
  color: #909399;
}
</style>
