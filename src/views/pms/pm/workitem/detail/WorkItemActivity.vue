<template>
  <div class="work-item-activity">
    <el-divider v-if="showTitle" content-position="left">工作项动态</el-divider>
    <div v-loading="loading">
      <el-empty v-if="activityList.length === 0" :image-size="60" description="暂无动态" />
      <div v-else>
        <div v-for="activity in activityList" :key="activity.id" class="activity-row">
          <el-avatar :size="32" :src="activity.operatorUserAvatar">
            {{ activity.operatorUserName ? activity.operatorUserName.slice(0, 1) : '' }}
          </el-avatar>
          <div class="activity-content">
            <div class="activity-heading">
              <span>{{ activity.operatorUserName }}</span>
              <span class="activity-time">{{ formatDate(activity.createTime) }}</span>
            </div>
            <div class="activity-text">{{ activity.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as WorkItemActivityApi from '@/api/pms/pm/workitem/activity'
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'PmsWorkItemActivity',
  props: {
    workItemId: { type: Number, required: true },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return { loading: false, activityList: [] }
  },
  watch: {
    workItemId: { immediate: true, handler: 'getWorkItemActivityList' }
  },
  methods: {
    formatDate,
    async getWorkItemActivityList() {
      if (!this.workItemId) return
      this.loading = true
      try {
        const response = await WorkItemActivityApi.getWorkItemActivityList(this.workItemId)
        this.activityList = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.activity-row { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #ebeef5; }
.activity-row:last-child { border-bottom: 0; }
.activity-content { flex: 1; min-width: 0; }
.activity-heading { display: flex; align-items: center; gap: 8px; }
.activity-time { color: #909399; font-size: 12px; }
.activity-text { margin-top: 4px; color: #606266; font-size: 13px; }
</style>
