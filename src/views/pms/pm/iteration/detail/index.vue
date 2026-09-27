<template>
  <div
    v-loading="loading"
    class="app-container iteration-detail"
  >
    <div class="detail-header">
      <div class="detail-heading">
        <el-button
          aria-label="返回项目迭代"
          circle
          icon="el-icon-arrow-left"
          @click="close"
        />
        <div class="detail-title-main">
          <div class="title-row">
            <h2>{{ iteration ? iteration.name : '迭代详情' }}</h2>
            <el-tag
              v-if="iteration"
              :type="getIterationStatusTagType(iteration.status)"
            >
              {{ getIterationStatusName(iteration.status) }}
            </el-tag>
          </div>
          <div class="secondary-text">
            {{ iteration && iteration.target ? iteration.target : '暂无迭代目标' }}
          </div>
        </div>
      </div>
      <div
        v-if="iteration && editable"
        class="detail-actions"
      >
        <el-button
          v-if="
            iteration.status === PmsIterationStatus.PLANNED &&
              checkPermi(['pms:pm:iteration:update'])
          "
          type="primary"
          @click="openStartForm"
        >
          开始迭代
        </el-button>
        <el-button
          v-if="
            iteration.status === PmsIterationStatus.ACTIVE &&
              checkPermi(['pms:pm:iteration:update'])
          "
          type="primary"
          @click="handleComplete"
        >
          完成迭代
        </el-button>
        <el-dropdown
          trigger="click"
          @command="handleIterationCommand"
        >
          <el-button
            aria-label="更多操作"
            icon="el-icon-more"
          />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-if="checkPermi(['pms:pm:iteration:update'])"
              command="edit"
            >
              编辑迭代
            </el-dropdown-item>
            <el-dropdown-item
              v-if="checkPermi(['pms:pm:iteration:delete'])"
              command="delete"
              divided
            >
              删除迭代
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <div v-if="iteration">
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="概览"
          name="overview"
        >
          <el-row :gutter="12">
            <el-col
              v-for="card in cards"
              :key="card.label"
              :span="6"
            >
              <el-card shadow="never">
                <div class="secondary-text">{{ card.label }}</div>
                <div class="metric-value">{{ card.value }}</div>
              </el-card>
            </el-col>
          </el-row>

          <div class="iteration-progress">
            <div class="progress-title">
              <span>迭代进度</span><span>{{ overview.progress }}%</span>
            </div>
            <el-progress
              :percentage="overview.progress"
              :stroke-width="12"
            />
          </div>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-card shadow="never">
                <div slot="header">迭代信息</div>
                <el-descriptions
                  :column="2"
                  border
                >
                  <el-descriptions-item label="状态">
                    {{ getIterationStatusName(iteration.status) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="负责人">
                    {{ iteration.ownerUserName || '未设置' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="开始时间">
                    {{ formatDate(iteration.startTime, 'YYYY-MM-DD') || '--' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="结束时间">
                    {{ formatDate(iteration.endTime, 'YYYY-MM-DD') || '--' }}
                  </el-descriptions-item>
                  <el-descriptions-item
                    label="迭代目标"
                    :span="2"
                  >
                    {{ iteration.target || '未设置' }}
                  </el-descriptions-item>
                  <el-descriptions-item
                    label="参与成员"
                    :span="2"
                  >
                    {{ teamNames.join('、') || '暂无参与成员' }}
                  </el-descriptions-item>
                  <el-descriptions-item
                    label="迭代描述"
                    :span="2"
                  >
                    {{ iteration.description || '暂无描述' }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card shadow="never">
                <div slot="header">事项分布</div>
                <PmsEchart
                  :height="220"
                  :options="distributionChartOptions"
                />
              </el-card>
            </el-col>
          </el-row>

          <el-row
            class="detail-row"
            :gutter="16"
          >
            <el-col :span="12">
              <el-card shadow="never">
                <div slot="header">事项状态趋势</div>
                <PmsEchart
                  :height="210"
                  :options="statusTrendChartOptions"
                />
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card shadow="never">
                <div slot="header">燃尽数据</div>
                <el-table
                  :data="overview.burnDowns"
                  height="210"
                  size="small"
                >
                  <el-table-column
                    label="日期"
                    prop="date"
                  />
                  <el-table-column
                    align="center"
                    label="理想剩余工时"
                    prop="idealRemaining"
                  />
                  <el-table-column
                    align="center"
                    label="实际剩余工时"
                    prop="actualRemaining"
                  />
                </el-table>
              </el-card>
            </el-col>
          </el-row>

          <el-row
            class="detail-row stretch-row"
            :gutter="16"
          >
            <el-col :span="12">
              <el-card
                class="full-height"
                shadow="never"
              >
                <div slot="header">当前状态分布</div>
                <div
                  v-for="item in statusDistribution"
                  :key="item.name"
                  class="status-row"
                >
                  <span class="status-name">{{ item.name }}</span>
                  <el-progress
                    class="status-progress"
                    :percentage="getTypePercentage(item.count)"
                    :status="item.progressStatus"
                    :stroke-width="12"
                  />
                  <strong class="status-count">{{ item.count }}</strong>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card
                class="full-height"
                shadow="never"
              >
                <div slot="header">最近活动</div>
                <el-empty
                  v-if="overview.recentActivities.length === 0"
                  :image-size="60"
                  description="暂无活动"
                />
                <el-timeline
                  v-else
                  class="activity-list"
                >
                  <el-timeline-item
                    v-for="activity in overview.recentActivities"
                    :key="activity.id"
                    :timestamp="formatDate(activity.createTime)"
                  >
                    <div>
                      <strong>{{ activity.operatorUserName || '系统' }}</strong>
                      {{ activity.content }}
                    </div>
                    <div class="activity-work-item">
                      #{{ activity.workItemSerialNumber }} {{ activity.workItemName }}
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>

        <el-tab-pane
          :label="`事项（${workItemList.length}）`"
          name="items"
        >
          <el-tabs
            v-model="activeWorkItemTab"
            type="card"
          >
            <el-tab-pane
              label="全部"
              lazy
              name="all"
            >
              <WorkItemAllList
                :editable="editable"
                :iteration-id="iteration.id"
                :project-id="iteration.projectId"
                :project-type="project ? project.type : PmsProjectType.AGILE"
                @changed="loadData"
              />
            </el-tab-pane>
            <el-tab-pane
              label="需求"
              lazy
              name="requirement"
            >
              <WorkItemList
                default-view-mode="board"
                :editable="editable"
                :iteration-id="iteration.id"
                :project-id="iteration.projectId"
                :project-type="project ? project.type : PmsProjectType.AGILE"
                :type="PmsWorkItemType.REQUIREMENT"
                @changed="loadData"
              />
            </el-tab-pane>
            <el-tab-pane
              label="任务"
              lazy
              name="task"
            >
              <WorkItemList
                default-view-mode="board"
                :editable="editable"
                :iteration-id="iteration.id"
                :project-id="iteration.projectId"
                :project-type="project ? project.type : PmsProjectType.AGILE"
                :type="PmsWorkItemType.TASK"
                @changed="loadData"
              />
            </el-tab-pane>
            <el-tab-pane
              label="缺陷"
              lazy
              name="defect"
            >
              <WorkItemList
                default-view-mode="board"
                :editable="editable"
                :iteration-id="iteration.id"
                :project-id="iteration.projectId"
                :project-type="project ? project.type : PmsProjectType.AGILE"
                :type="PmsWorkItemType.DEFECT"
                @changed="loadData"
              />
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
      </el-tabs>
    </div>

    <IterationForm
      ref="formRef"
      @success="handleIterationChanged"
    />
    <IterationStartForm
      ref="startFormRef"
      @success="handleIterationChanged"
    />
  </div>
</template>

<script>
import * as IterationApi from '@/api/pms/pm/iteration'
import * as ProjectApi from '@/api/pms/pm/project'
import * as WorkItemApi from '@/api/pms/pm/workitem'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import {
  PmsIterationStatus,
  PmsIterationOverviewCardOptions,
  PmsProjectStatus,
  PmsProjectType,
  PmsWorkItemStatusType,
  PmsWorkItemType
} from '@/views/pms/pm/utils/constants'
import { getAllPageItems } from '@/utils/page'
import WorkItemAllList from '@/views/pms/pm/workitem/list/WorkItemAllList.vue'
import WorkItemList from '@/views/pms/pm/workitem/list/WorkItemList.vue'
import IterationForm from '@/views/pms/pm/iteration/components/IterationForm.vue'
import IterationStartForm from '@/views/pms/pm/iteration/components/IterationStartForm.vue'
import { getIterationStatusName, getIterationStatusTagType } from '@/views/pms/pm/utils/format'
import PmsEchart from '@/views/pms/pm/project/detail/PmsEchart.vue'

function createEmptyOverview() {
  return {
    totalCount: 0,
    pendingCount: 0,
    processingCount: 0,
    completedCount: 0,
    progress: 0,
    typeCountMap: {},
    typeStatusCountMap: {},
    statusTrends: [],
    burnDowns: [],
    recentActivities: []
  }
}

export default {
  name: 'PmsIterationDetail',
  components: {
    IterationForm,
    IterationStartForm,
    PmsEchart,
    WorkItemAllList,
    WorkItemList
  },
  data() {
    return {
      PmsIterationStatus,
      PmsProjectType,
      PmsWorkItemType,
      loading: false,
      activeTab: 'overview',
      activeWorkItemTab: 'all',
      iteration: undefined,
      project: undefined,
      workItemList: [],
      overview: createEmptyOverview()
    }
  },
  computed: {
    editable() {
      return Boolean(
        this.project &&
        this.project.writeStatus &&
        this.project.status === PmsProjectStatus.ACTIVE
      )
    },
    cards() {
      return PmsIterationOverviewCardOptions.map(option => ({
        label: option.label,
        value: this.overview[option.field]
      }))
    },
    typeDistribution() {
      return getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_TYPE).map(option => ({
        type: option.value,
        name: option.label,
        count: this.overview.typeCountMap[option.value] || 0
      }))
    },
    statusTrendChartOptions() {
      return {
        tooltip: { trigger: 'axis' },
        legend: { top: 0, data: ['已完成', '进行中', '未开始'] },
        grid: { top: 40, right: 16, bottom: 12, left: 12, containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.overview.statusTrends.map(item => item.date.slice(5))
        },
        yAxis: { type: 'value', minInterval: 1 },
        series: [
          {
            name: '已完成',
            type: 'line',
            data: this.overview.statusTrends.map(item => item.completedCount),
            itemStyle: { color: '#36b37e' }
          },
          {
            name: '进行中',
            type: 'line',
            data: this.overview.statusTrends.map(item => item.processingCount),
            itemStyle: { color: '#ffab00' }
          },
          {
            name: '未开始',
            type: 'line',
            data: this.overview.statusTrends.map(item => item.pendingCount),
            itemStyle: { color: '#0065ff' }
          }
        ]
      }
    },
    distributionChartOptions() {
      const countByStatus = (item, status) => {
        const countMap = this.overview.typeStatusCountMap[item.type]
        return countMap ? countMap[status] || 0 : 0
      }
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }},
        legend: { bottom: 0, data: ['已完成', '进行中', '未开始'] },
        grid: { top: 10, right: 16, bottom: 36, left: 12, containLabel: true },
        xAxis: { type: 'value', minInterval: 1 },
        yAxis: { type: 'category', data: this.typeDistribution.map(item => item.name) },
        series: [
          {
            name: '已完成',
            type: 'bar',
            stack: 'total',
            data: this.typeDistribution.map(
              item => countByStatus(item, PmsWorkItemStatusType.COMPLETED)
            ),
            itemStyle: { color: '#36b37e' }
          },
          {
            name: '进行中',
            type: 'bar',
            stack: 'total',
            data: this.typeDistribution.map(
              item => countByStatus(item, PmsWorkItemStatusType.PROCESSING)
            ),
            itemStyle: { color: '#ffab00' }
          },
          {
            name: '未开始',
            type: 'bar',
            stack: 'total',
            data: this.typeDistribution.map(
              item => countByStatus(item, PmsWorkItemStatusType.PENDING)
            ),
            itemStyle: { color: '#0065ff' }
          }
        ]
      }
    },
    statusDistribution() {
      const statusCountMap = {
        [PmsWorkItemStatusType.PENDING]: this.overview.pendingCount,
        [PmsWorkItemStatusType.PROCESSING]: this.overview.processingCount,
        [PmsWorkItemStatusType.COMPLETED]: this.overview.completedCount
      }
      return getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_STATUS_TYPE).map(option => ({
        name: option.label,
        count: statusCountMap[option.value],
        progressStatus: option.value === PmsWorkItemStatusType.COMPLETED
          ? 'success'
          : undefined
      }))
    },
    teamNames() {
      const names = new Set()
      this.workItemList.forEach(item => {
        if (item.assigneeUserName) names.add(item.assigneeUserName)
        const memberNames = item.memberUserNames || []
        memberNames.forEach(name => names.add(name))
      })
      return Array.from(names)
    }
  },
  async mounted() {
    this.loading = true
    try {
      const iterationResponse = await IterationApi.getIteration(Number(this.$route.params.id))
      this.iteration = iterationResponse.data
      const projectResponse = await ProjectApi.getProject(this.iteration.projectId)
      this.project = projectResponse.data
      await this.loadData()
    } finally {
      this.loading = false
    }
  },
  methods: {
    checkPermi,
    formatDate,
    getIterationStatusName,
    getIterationStatusTagType,
    async loadData() {
      if (!this.iteration) return
      this.loading = true
      try {
        const currentIteration = this.iteration
        const [overviewResponse, currentWorkItems] = await Promise.all([
          IterationApi.getIterationOverview(currentIteration.id),
          getAllPageItems((pageNo, pageSize) => WorkItemApi.getWorkItemPage({
            pageNo,
            pageSize,
            projectId: currentIteration.projectId,
            iterationId: currentIteration.id
          }))
        ])
        this.overview = overviewResponse.data
        this.workItemList = currentWorkItems
      } finally {
        this.loading = false
      }
    },
    getTypePercentage(count) {
      return this.overview.totalCount > 0
        ? Math.round((count * 100) / this.overview.totalCount)
        : 0
    },
    openStartForm() {
      if (this.iteration) this.$refs.startFormRef.open(this.iteration)
    },
    handleIterationCommand(command) {
      if (!this.iteration) return
      if (command === 'edit') {
        this.$refs.formRef.open('update', this.iteration.projectId, this.iteration.id)
        return
      }
      this.handleDelete()
    },
    async handleComplete() {
      if (!this.iteration) return
      try {
        await this.$confirm(`确认完成迭代“${this.iteration.name}”吗？`, '提示', {
          type: 'warning'
        })
        await IterationApi.completeIteration(this.iteration.id)
        this.$message.success('迭代已完成')
        await this.handleIterationChanged()
      } catch (error) {
        // 用户取消时保留详情页。
      }
    },
    async handleDelete() {
      if (!this.iteration) return
      try {
        await this.$confirm(`确认删除迭代“${this.iteration.name}”吗？`, '提示', {
          type: 'warning'
        })
        await IterationApi.deleteIteration(this.iteration.id)
        this.$message.success('删除成功')
        this.close()
      } catch (error) {
        // 用户取消时保留详情页。
      }
    },
    async handleIterationChanged() {
      if (!this.iteration || !this.iteration.id) return
      const response = await IterationApi.getIteration(this.iteration.id)
      this.iteration = response.data
      await this.loadData()
    },
    close() {
      if (!this.iteration) return
      this.$router.push({
        name: 'PmsProjectDetail',
        params: { id: this.iteration.projectId },
        query: { tabs: 'iteration' }
      })
    }
  }
}
</script>

<style scoped>
.detail-header,
.detail-heading,
.title-row,
.detail-actions,
.progress-title,
.status-row {
  display: flex;
  align-items: center;
}
.detail-header { justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.detail-heading { min-width: 0; gap: 12px; }
.detail-title-main { min-width: 0; }
.title-row { gap: 8px; }
.title-row h2 {
  margin: 0;
  overflow: hidden;
  font-size: 20px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.secondary-text { margin-top: 4px; color: #909399; font-size: 13px; }
.detail-actions { flex-shrink: 0; gap: 8px; }
.metric-value { margin-top: 8px; font-size: 24px; font-weight: 600; }
.iteration-progress { margin: 18px 0; }
.progress-title { justify-content: space-between; margin-bottom: 8px; }
.detail-row { margin-top: 16px; }
.stretch-row ::v-deep .el-col { display: flex; }
.full-height { width: 100%; height: 100%; }
.status-row { min-height: 56px; gap: 12px; }
.status-name { width: 76px; }
.status-progress { flex: 1; }
.status-count { width: 28px; text-align: right; }
.activity-list { max-height: 260px; overflow-y: auto; padding-right: 8px; }
.activity-work-item { margin-top: 3px; color: #909399; font-size: 12px; }
</style>
