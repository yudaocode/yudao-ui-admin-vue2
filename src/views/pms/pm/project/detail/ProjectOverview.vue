<template>
  <div>
    <div
      v-loading="loading"
      class="project-overview"
    >
      <el-card
        class="overview-card"
        shadow="never"
      >
        <div
          slot="header"
          class="card-header"
        >
          <span class="card-title">项目公告</span>
          <el-button
            v-if="editable"
            icon="el-icon-plus"
            type="text"
            @click="openAnnouncementConfig"
          >
            新建公告
          </el-button>
        </div>
        <el-empty
          v-if="!latestAnnouncement"
          :image-size="64"
          description="暂无公告"
        />
        <template v-else>
          <div class="announcement">
            <div class="announcement-author">
              <el-avatar :size="40">{{ announcementInitial }}</el-avatar>
              <div>
                <div class="card-title">{{ latestAnnouncement.creatorUserName || '-' }}</div>
                <div class="secondary-text">
                  发布于 {{ formatDate(latestAnnouncement.createTime) }}
                </div>
              </div>
            </div>
            <div class="announcement-content">{{ latestAnnouncement.content }}</div>
          </div>
          <el-button
            class="card-link"
            type="text"
            @click="openAnnouncementConfig"
          >
            查看全部公告
          </el-button>
        </template>
      </el-card>

      <el-card
        v-if="isAgileProject"
        class="overview-card"
        shadow="never"
      >
        <div
          slot="header"
          class="card-header"
        >
          <div>
            <span class="card-title">项目迭代</span>
            <span class="secondary-text iteration-count">
              共 {{ iterations.length }} 个未完成迭代
            </span>
          </div>
          <el-button
            type="text"
            @click="openIterationList"
          >查看更多</el-button>
        </div>
        <el-empty
          v-if="iterations.length === 0"
          :image-size="64"
          description="暂无未完成迭代"
        />
        <div
          v-else
          class="iteration-list"
        >
          <div
            v-for="iteration in iterations"
            :key="iteration.id"
            class="iteration-row"
            @click="openIteration(iteration)"
          >
            <div class="iteration-title-row">
              <span class="iteration-name">{{ iteration.name }}</span>
              <el-tag
                :type="getIterationStatusTagType(iteration.status)"
                size="small"
              >
                {{ getIterationStatusName(iteration.status) }}
              </el-tag>
            </div>
            <div class="iteration-meta">
              <span>
                {{ formatDate(iteration.startTime, 'YYYY-MM-DD') || '--' }} 至
                {{ formatDate(iteration.endTime, 'YYYY-MM-DD') || '--' }}
              </span>
              <span v-if="iteration.progress !== undefined">
                完成 {{ iteration.progress }}%
              </span>
            </div>
            <el-progress
              :percentage="iteration.progress || 0"
              :show-text="false"
              :stroke-width="6"
            />
          </div>
        </div>
      </el-card>
      <el-card
        v-else
        class="overview-card"
        shadow="never"
      >
        <div slot="header">
          <span class="card-title">工作项趋势</span>
          <span class="secondary-text iteration-count">近 14 日已完成</span>
        </div>
        <PmsEchart
          :height="220"
          :options="trendChartOptions"
        />
      </el-card>

      <el-card
        class="overview-card"
        shadow="never"
      >
        <div
          slot="header"
          class="card-title"
        >项目基本信息</div>
        <el-descriptions :column="2">
          <el-descriptions-item
            label="项目名称"
            :span="2"
          >
            {{ project.name }}
          </el-descriptions-item>
          <el-descriptions-item
            label="项目周期"
            :span="2"
          >
            {{ formatDate(project.startTime, 'YYYY-MM-DD') || '未设置' }} 至
            {{ formatDate(project.endTime, 'YYYY-MM-DD') || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="项目管理员">
            {{ projectAdminNames || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="项目成员">
            {{ project.memberCount }} 人
          </el-descriptions-item>
          <el-descriptions-item
            label="项目进度"
            :span="2"
          >
            <el-progress
              :percentage="formatProjectCompletionRate(project)"
              :stroke-width="8"
            />
          </el-descriptions-item>
          <el-descriptions-item
            label="项目描述"
            :span="2"
          >
            {{ project.description || '暂无项目描述' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card
        class="overview-card"
        shadow="never"
      >
        <div
          slot="header"
          class="card-header"
        >
          <span class="card-title">分配给我的</span>
          <el-button
            type="text"
            @click="openAssignedWorkItems"
          >查看更多</el-button>
        </div>
        <el-empty
          v-if="overview.assignedWorkItems.length === 0"
          :image-size="64"
          description="暂无工作项"
        />
        <div
          v-for="item in overview.assignedWorkItems.slice(0, 5)"
          :key="item.id"
          class="assigned-row"
          @click="openWorkItem(item.id)"
        >
          <div class="assigned-main">
            <div class="assigned-name">{{ item.name }}</div>
            <div class="secondary-text">
              #{{ item.serialNumber }} · {{ getWorkItemTypeName(item.type) }}
            </div>
          </div>
          <el-progress
            :percentage="item.progress"
            :show-text="false"
            :stroke-width="6"
          />
        </div>
      </el-card>
    </div>

    <WorkItemDetail
      ref="workItemDetailRef"
      @success="getProjectOverview"
    />
  </div>
</template>

<script>
import * as ProjectApi from '@/api/pms/pm/project'
import * as ProjectAnnouncementApi from '@/api/pms/pm/project/announcement'
import * as IterationApi from '@/api/pms/pm/iteration'
import { formatDate } from '@/utils/formatTime'
import { getAllPageItems } from '@/utils/page'
import WorkItemDetail from '@/views/pms/pm/workitem/detail/WorkItemDetail.vue'
import { PmsIterationStatus, PmsProjectType } from '@/views/pms/pm/utils/constants'
import {
  formatProjectCompletionRate,
  getIterationStatusName,
  getIterationStatusTagType,
  getWorkItemTypeName
} from '@/views/pms/pm/utils/format'
import PmsEchart from './PmsEchart.vue'

function createEmptyOverview() {
  return {
    totalCount: 0,
    pendingCount: 0,
    processingCount: 0,
    completedCount: 0,
    typeCountMap: {},
    completedTrends: [],
    assignedWorkItems: []
  }
}

export default {
  name: 'PmsProjectOverview',
  components: { PmsEchart, WorkItemDetail },
  props: {
    project: { type: Object, required: true },
    editable: { type: Boolean, required: true }
  },
  data() {
    return {
      loading: false,
      announcements: [],
      iterations: [],
      overview: createEmptyOverview()
    }
  },
  computed: {
    latestAnnouncement() {
      return this.announcements[0]
    },
    announcementInitial() {
      const name = this.latestAnnouncement && this.latestAnnouncement.creatorUserName
      return name ? name.slice(0, 1) : '-'
    },
    isAgileProject() {
      return this.project.type === PmsProjectType.AGILE
    },
    projectAdminNames() {
      return (this.project.adminNames || []).join('、')
    },
    trendChartOptions() {
      return {
        tooltip: { trigger: 'axis' },
        legend: { top: 0, data: ['工作项数量'] },
        grid: { top: 44, right: 18, bottom: 14, left: 12, containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.overview.completedTrends.map(point => point.date.slice(5)),
          axisTick: { show: false }
        },
        yAxis: { type: 'value', minInterval: 1, axisTick: { show: false }},
        series: [{
          name: '工作项数量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: this.overview.completedTrends.map(point => point.count),
          lineStyle: { width: 2, color: '#409eff' },
          itemStyle: { color: '#409eff' }
        }]
      }
    }
  },
  mounted() {
    this.getProjectOverview()
  },
  methods: {
    formatDate,
    formatProjectCompletionRate,
    getIterationStatusName,
    getIterationStatusTagType,
    getWorkItemTypeName,
    async getProjectOverview() {
      this.loading = true
      try {
        const iterationPromise = this.isAgileProject
          ? getAllPageItems((pageNo, pageSize) => IterationApi.getIterationPage({
            pageNo,
            pageSize,
            projectId: this.project.id
          }))
          : Promise.resolve([])
        const [overviewResponse, announcementsResponse, currentIterations] = await Promise.all([
          ProjectApi.getProjectOverview(this.project.id),
          ProjectAnnouncementApi.getProjectAnnouncementList(this.project.id),
          iterationPromise
        ])
        this.overview = overviewResponse.data
        this.announcements = announcementsResponse.data
        this.iterations = currentIterations.filter(
          iteration => iteration.status !== PmsIterationStatus.COMPLETED
        )
      } finally {
        this.loading = false
      }
    },
    openAnnouncementConfig() {
      this.$router.push({
        name: 'PmsProjectConfig',
        params: { id: this.project.id },
        query: { tabs: 'announcement' }
      })
    },
    openAssignedWorkItems() {
      this.$router.push({
        name: 'PmsProjectDetail',
        params: { id: this.project.id },
        query: {
          tabs: this.isAgileProject ? 'all' : 'task',
          assigneeUserId: String(this.$store.getters.userId)
        }
      })
    },
    openWorkItem(id) {
      this.$refs.workItemDetailRef.open(id)
    },
    openIterationList() {
      this.$router.push({
        name: 'PmsProjectDetail',
        params: { id: this.project.id },
        query: { tabs: 'iteration' }
      })
    },
    openIteration(iteration) {
      if (!iteration.id) return
      this.$router.push({ name: 'PmsIterationDetail', params: { id: iteration.id }})
    }
  }
}
</script>

<style scoped>
.project-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.overview-card { min-height: 300px; }
.card-header,
.announcement-author,
.iteration-title-row,
.assigned-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title { font-weight: 600; }
.secondary-text { margin-top: 4px; color: #909399; font-size: 12px; }
.iteration-count { margin-left: 8px; }
.announcement { min-height: 178px; padding: 18px; border-radius: 4px; background: #f5f7fa; }
.announcement-author { justify-content: flex-start; gap: 12px; }
.announcement-content {
  display: -webkit-box;
  margin-top: 18px;
  overflow: hidden;
  line-height: 24px;
  white-space: pre-wrap;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}
.card-link { margin-top: 12px; }
.iteration-list { max-height: 220px; overflow-y: auto; }
.iteration-row,
.assigned-row {
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
}
.iteration-row:last-child,
.assigned-row:last-child { border-bottom: 0; }
.iteration-row:hover { background: #f5f7fa; }
.iteration-name,
.assigned-name {
  min-width: 0;
  overflow: hidden;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.iteration-meta { display: flex; gap: 10px; margin: 6px 0; color: #909399; font-size: 12px; }
.assigned-row { gap: 8px; }
.assigned-main { min-width: 0; flex: 1; }
.assigned-row ::v-deep .el-progress { width: 90px; }
@media (max-width: 1200px) {
  .project-overview { grid-template-columns: 1fr; }
}
</style>
