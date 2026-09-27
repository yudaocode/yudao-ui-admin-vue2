<!-- MES 甘特图编辑 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【生产】生产排产、工序流转卡"
      url="https://doc.iocoder.cn/mes/pro/schedule-card/"
    />
    <el-card shadow="never">
      <div class="toolbar">
        <span class="hint">可直接拖拽/拉伸任务条，或双击编辑开始时间和时长，修改后点击“批量保存”</span>
        <div>
          <el-badge
            :value="pendingCount"
            :hidden="pendingCount === 0"
            class="save-badge"
          >
            <el-button
              type="primary"
              :loading="formLoading"
              :disabled="pendingCount === 0"
              @click="handleSave"
            >批量保存</el-button>
          </el-badge>
          <el-button @click="handleRefresh">刷新</el-button>
        </div>
      </div>
      <gantt-chart
        :tasks="taskList"
        :readonly="false"
        :height="ganttHeight"
        @task-update="handleTaskUpdate"
      />
    </el-card>
  </div>
</template>

<script>
import { ProTaskApi } from '@/api/mes/pro/task'
import GanttChart from '../components/GanttChart.vue'

export default {
  name: 'MesProTaskGanttEdit',
  components: { GanttChart },
  data() {
    return {
      formLoading: false,
      taskList: [],
      pendingChanges: new Map()
    }
  },
  computed: {
    pendingCount() {
      return this.pendingChanges.size
    },
    ganttHeight() {
      return Math.max(window.innerHeight - 180, 300)
    }
  },
  created() {
    this.loadGanttData()
  },
  methods: {
    async loadGanttData() {
      const response = await ProTaskApi.getGanttTaskList({})
      this.taskList = response.data
    },
    handleTaskUpdate(change) {
      this.pendingChanges.set(change.id, change)
      this.pendingChanges = new Map(this.pendingChanges)
    },
    async handleSave() {
      if (this.pendingChanges.size === 0) return
      this.formLoading = true
      try {
        await Promise.all(Array.from(this.pendingChanges.values()).map(change => ProTaskApi.updateTask({
          id: change.id,
          startTime: change.startTime,
          endTime: change.endTime,
          duration: change.duration
        })))
        this.$modal.msgSuccess(`已保存 ${this.pendingChanges.size} 条修改`)
        this.pendingChanges = new Map()
        await this.loadGanttData()
      } finally {
        this.formLoading = false
      }
    },
    async handleRefresh() {
      this.pendingChanges = new Map()
      await this.loadGanttData()
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.hint { color: #909399; font-size: 14px; }
.save-badge { margin-right: 10px; }
</style>
