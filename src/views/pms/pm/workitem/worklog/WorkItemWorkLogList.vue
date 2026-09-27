<template>
  <div>
    <el-divider v-if="showTitle" content-position="left">工时记录</el-divider>
    <div v-loading="loading">
      <div class="worklog-summary">
        <div class="worklog-totals">
          <span>预估：{{ formatWorkHours(summary.estimatedHours) }}</span>
          <span>已登记：{{ formatWorkHours(summary.actualHours) }}</span>
          <span>剩余：{{ formatWorkHours(summary.remainingHours) }}</span>
        </div>
        <el-button v-if="editable" v-hasPermi="['pms:pm:work-item:update']" plain type="primary" @click="openForm()">登记工时</el-button>
      </div>
      <el-table :data="summary.records" max-height="260" size="small">
        <el-table-column align="center" label="投入工时" prop="actualHours" width="100">
          <template slot-scope="scope">{{ formatWorkHours(scope.row.actualHours) }}</template>
        </el-table-column>
        <el-table-column align="center" label="登记后剩余" prop="remainingHours" width="110">
          <template slot-scope="scope">{{ formatWorkHours(scope.row.remainingHours) }}</template>
        </el-table-column>
        <el-table-column label="说明" min-width="180" prop="description" />
        <el-table-column label="登记人" prop="creatorUserName" width="110" />
        <el-table-column :formatter="dateFormatter" label="登记时间" prop="createTime" width="170" />
        <el-table-column v-if="editable" align="center" label="操作" width="70">
          <template slot-scope="scope">
            <el-button v-hasPermi="['pms:pm:work-item:update']" type="text" @click="openForm(scope.row.id)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <WorkItemWorkLogForm ref="workLogFormRef" @success="handleFormSuccess" />
  </div>
</template>

<script>
import * as WorkLogApi from '@/api/pms/pm/workitem/worklog'
import { dateFormatter } from '@/utils/formatTime'
import { formatWorkHours } from '@/views/pms/pm/utils/format'
import WorkItemWorkLogForm from './WorkItemWorkLogForm.vue'

export default {
  name: 'PmsWorkItemWorkLogList',
  components: { WorkItemWorkLogForm },
  props: {
    workItemId: { type: Number, required: true },
    editable: { type: Boolean, required: true },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return { loading: false, summary: { actualHours: 0, records: [] } }
  },
  watch: { workItemId: { immediate: true, handler: 'getWorkLogSummary' } },
  methods: {
    dateFormatter,
    formatWorkHours,
    async getWorkLogSummary() {
      this.loading = true
      try {
        const response = await WorkLogApi.getWorkItemWorkLogSummary(this.workItemId)
        this.summary = response.data
      } finally {
        this.loading = false
      }
    },
    openForm(id) {
      return this.$refs.workLogFormRef.open(this.workItemId, id, this.summary.remainingHours)
    },
    async handleFormSuccess() {
      await this.getWorkLogSummary()
      this.$emit('changed')
    }
  }
}
</script>

<style scoped>
.worklog-summary { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px; }
.worklog-totals { display: flex; flex-wrap: wrap; gap: 24px; }
</style>
