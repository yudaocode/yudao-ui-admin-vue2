<template>
  <oa-home-panel title="任务完成情况">
    <template slot="actions">
      <el-button type="text" @click="$router.push('/oa/task/my')">查看任务</el-button>
    </template>

    <!-- 我的任务状态 -->
    <div v-loading="loading" class="status-block">
      <div v-if="loadError" class="load-error">
        加载失败，
        <el-button type="text" @click="getList">重新加载</el-button>
      </div>
      <div class="section-title">我的任务</div>
      <div
        v-for="item in taskStatuses"
        :key="item.status"
        class="status-row"
      >
        <span class="status-label">
          <dict-tag :type="DICT_TYPE.OA_TASK_STATUS" :value="item.status" />
        </span>
        <el-progress
          class="status-progress"
          :percentage="getStatusPercentage(item.count)"
          :show-text="false"
          :stroke-width="8"
        />
        <span class="status-count">{{ item.count }}</span>
      </div>
    </div>

    <!-- 任务完成排行独立加载，不等待状态统计 -->
    <div v-loading="rankingLoading">
      <div v-if="rankingError" class="load-error">
        加载失败，
        <el-button type="text" @click="getRankingList">重新加载</el-button>
      </div>
      <div class="section-title">任务完成排行（按发布人）</div>
      <el-empty v-if="taskRankings.length === 0" :image-size="60" description="暂无完成记录" />
      <oa-home-chart v-else :options="rankingOptions" height="240px" />
    </div>
  </oa-home-panel>
</template>

<script>
import OaHomePanel from './OaHomePanel.vue'
import OaHomeChart from './OaHomeChart.vue'
import { DICT_TYPE } from '@/utils/dict'
import * as TaskApi from '@/api/oa/task'
import { OA_TASK_STATUS } from '@/views/oa/utils/constants-collab'

export default {
  name: 'OaHomeTaskStatistics',
  components: { OaHomePanel, OaHomeChart },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      loadError: false,
      rankingLoading: false,
      rankingError: false,
      statusCountMap: {},
      taskRankings: []
    }
  },
  computed: {
    /** 补齐没有任务的状态 */
    taskStatuses() {
      return Object.values(OA_TASK_STATUS).map(status => ({
        status,
        count: this.statusCountMap[status] || 0
      }))
    },
    /** 我的任务总数 */
    taskTotal() {
      return this.taskStatuses.reduce((total, item) => total + item.count, 0)
    },
    /** 按发布人统计已完成任务 */
    rankingOptions() {
      return {
        tooltip: { trigger: 'axis' },
        grid: { left: 32, right: 16, top: 20, bottom: 50 },
        xAxis: {
          type: 'category',
          data: this.taskRankings.map(item => item.userName || ('用户 ' + item.userId)),
          axisLabel: { interval: 0, width: 60, overflow: 'truncate' }
        },
        yAxis: { type: 'value', minInterval: 1 },
        series: [
          {
            name: '已完成任务',
            type: 'bar',
            barMaxWidth: 36,
            data: this.taskRankings.map(item => item.completedCount)
          }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getRankingList()
  },
  methods: {
    /** 获得任务状态占比 */
    getStatusPercentage(count) {
      return this.taskTotal === 0 ? 0 : Math.round((count / this.taskTotal) * 100)
    },
    /** 查询当前区块数据 */
    getList() {
      if (this.loading) return Promise.resolve()
      this.loading = true
      this.loadError = false
      return TaskApi.getTaskStatusCount().then(response => {
        this.statusCountMap = response.data || {}
      }).catch(() => {
        this.loadError = true
      }).finally(() => {
        this.loading = false
      })
    },
    /** 查询任务完成排行 */
    getRankingList() {
      this.rankingLoading = true
      this.rankingError = false
      return TaskApi.getCompletedTaskRanking().then(response => {
        this.taskRankings = response.data || []
      }).catch(() => {
        this.rankingError = true
      }).finally(() => {
        this.rankingLoading = false
      })
    }
  }
}
</script>

<style scoped>
.status-block {
  margin-bottom: 22px;
}

.load-error {
  margin-bottom: 12px;
  font-size: 13px;
  color: #f56c6c;
}

.section-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 34px;
}

.status-label {
  width: 56px;
  font-size: 13px;
}

.status-progress {
  flex: 1;
}

.status-count {
  width: 28px;
  font-size: 13px;
  text-align: right;
  color: #909399;
}
</style>
