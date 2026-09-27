<template>
  <div
    v-loading="loading"
    class="project-work-log"
  >
    <el-form
      :inline="true"
      class="query-form"
    >
      <el-form-item label="迭代名称">
        <el-input
          v-model="queryParams.iterationName"
          clearable
          placeholder="搜索迭代名称"
          style="width: 240px"
          @keyup.enter.native="getWorkLogReport"
        />
      </el-form-item>
      <el-form-item label="日期范围">
        <el-date-picker
          v-model="queryParams.createTime"
          :clearable="false"
          :default-time="defaultTime"
          :picker-options="pickerOptions"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          style="width: 360px"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          @change="getWorkLogReport"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          icon="el-icon-search"
          type="primary"
          @click="getWorkLogReport"
        >
          查询
        </el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-alert
      class="work-log-summary"
      :closable="false"
      :title="`当前范围累计登记 ${report.totalHours} 小时`"
      type="info"
    />
    <el-empty
      v-if="report.groups.length === 0"
      description="当前范围暂无工时记录"
    />

    <el-table
      v-else
      :data="tableRows"
      default-expand-all
      row-key="rowKey"
      :show-overflow-tooltip="true"
      :tree-props="{ children: 'children' }"
    >
      <el-table-column
        fixed="left"
        label="迭代 / 工作项"
        min-width="260"
      >
        <template slot-scope="scope">
          <span
            v-if="scope.row.group"
            class="group-name"
          >{{ scope.row.name }}</span>
          <el-button
            v-else
            type="text"
            @click="openWorkItem(scope.row)"
          >
            #{{ scope.row.serialNumber }} {{ scope.row.name }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        fixed="left"
        label="总计"
        width="90"
      >
        <template slot-scope="scope">{{ scope.row.totalHours || '-' }}</template>
      </el-table-column>
      <el-table-column
        v-for="date in report.dates"
        :key="date"
        align="center"
        min-width="110"
      >
        <template slot="header">
          <span class="date-header">{{ formatDateWithWeekday(date) }}</span>
        </template>
        <template slot-scope="scope">
          {{ getDailyHours(scope.row, date) || '-' }}
        </template>
      </el-table-column>
    </el-table>

    <WorkItemDetail
      ref="workItemDetailRef"
      @success="getWorkLogReport"
    />
  </div>
</template>

<script>
import * as WorkLogApi from '@/api/pms/pm/workitem/worklog'
import { defaultShortcuts, formatDate } from '@/utils/formatTime'
import WorkItemDetail from '@/views/pms/pm/workitem/detail/WorkItemDetail.vue'
import { formatDateWithWeekday } from '@/views/pms/pm/utils/format'

function createDefaultRange() {
  const now = new Date()
  return [
    formatDate(new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0), 'YYYY-MM-DD HH:mm:ss'),
    formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59), 'YYYY-MM-DD HH:mm:ss')
  ]
}

export default {
  name: 'PmsProjectWorkLog',
  components: { WorkItemDetail },
  props: {
    projectId: { type: Number, required: true },
    projectType: { type: Number, required: true },
    editable: { type: Boolean, required: true }
  },
  data() {
    return {
      loading: false,
      queryParams: {
        iterationName: '',
        createTime: createDefaultRange()
      },
      report: { dates: [], totalHours: 0, groups: [] },
      defaultTime: [new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)],
      pickerOptions: { shortcuts: defaultShortcuts }
    }
  },
  computed: {
    tableRows() {
      return this.report.groups.map(group => ({
        rowKey: `group-${group.iterationId || 0}`,
        workItemId: 0,
        serialNumber: 0,
        name: group.iterationName,
        type: 0,
        totalHours: group.totalHours,
        dailyHours: {},
        group: true,
        children: group.items.map(item => ({
          ...item,
          rowKey: `item-${item.workItemId}`
        }))
      }))
    }
  },
  mounted() {
    this.getWorkLogReport()
  },
  methods: {
    formatDateWithWeekday,
    async getWorkLogReport() {
      this.loading = true
      try {
        const response = await WorkLogApi.getProjectWorkItemWorkLogReport({
          projectId: this.projectId,
          createTime: this.queryParams.createTime,
          iterationName: this.queryParams.iterationName || undefined
        })
        this.report = response.data
      } finally {
        this.loading = false
      }
    },
    resetQuery() {
      this.queryParams.iterationName = ''
      this.queryParams.createTime = createDefaultRange()
      this.getWorkLogReport()
    },
    getGroupDailyHours(items, date) {
      return (items || []).reduce((sum, item) => sum + (item.dailyHours[date] || 0), 0)
    },
    getDailyHours(row, date) {
      return row.group
        ? this.getGroupDailyHours(row.children, date)
        : row.dailyHours[date]
    },
    openWorkItem(row) {
      this.$refs.workItemDetailRef.open(row.workItemId)
    },
    refresh() {
      return this.getWorkLogReport()
    }
  }
}
</script>

<style scoped>
.query-form { margin-bottom: -15px; }
.work-log-summary { margin: 16px 0 12px; }
.group-name { font-weight: 600; }
.date-header { white-space: nowrap; }
</style>
