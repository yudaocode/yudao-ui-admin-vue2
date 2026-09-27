<template>
  <div
    v-loading="loading"
    class="app-container pms-project-detail"
  >
    <div class="detail-header">
      <div class="detail-title-wrap">
        <el-button
          aria-label="返回项目列表"
          circle
          icon="el-icon-arrow-left"
          @click="close"
        />
        <div class="detail-title-main">
          <h2>{{ project.name }}</h2>
          <div class="detail-description">{{ project.description || '暂无项目描述' }}</div>
        </div>
      </div>
      <el-dropdown
        v-if="project.id"
        trigger="click"
        @command="handleProjectCommand"
      >
        <el-button>
          更多<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-if="project.memberStatus"
            command="favorite"
          >
            {{ project.favoriteStatus ? '取消星标' : '星标项目' }}
          </el-dropdown-item>
          <el-dropdown-item
            v-if="project.adminStatus"
            command="config"
          >
            项目设置
          </el-dropdown-item>
          <el-dropdown-item
            v-if="project.exitStatus"
            command="exit"
            divided
          >
            退出项目
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-tabs
      v-if="project.id"
      v-model="activeTab"
      @tab-click="handleTabChange"
    >
      <el-tab-pane
        label="项目概况"
        lazy
        name="overview"
      >
        <ProjectOverview
          v-if="activeTab === 'overview'"
          :editable="editable"
          :project="project"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="agileProject"
        label="待规划"
        lazy
        name="planning"
      >
        <PlanningBoard
          :editable="editable"
          :project-id="project.id"
          :project-type="project.type"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="agileProject"
        label="迭代"
        lazy
        name="iteration"
      >
        <IterationList
          :editable="editable"
          :project-id="project.id"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="agileProject"
        label="全部事项"
        lazy
        name="all"
      >
        <WorkItemAllList
          :editable="editable"
          :project-id="project.id"
          :project-type="project.type"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="agileProject"
        label="需求"
        lazy
        name="requirement"
      >
        <WorkItemList
          :editable="editable"
          :project-id="project.id"
          :project-type="project.type"
          :type="PmsWorkItemType.REQUIREMENT"
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
          :project-id="project.id"
          :project-type="project.type"
          :type="PmsWorkItemType.TASK"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="agileProject"
        label="缺陷"
        lazy
        name="defect"
      >
        <WorkItemList
          :editable="editable"
          :project-id="project.id"
          :project-type="project.type"
          :type="PmsWorkItemType.DEFECT"
        />
      </el-tab-pane>
      <el-tab-pane
        label="甘特图"
        lazy
        name="gantt"
      >
        <ProjectGantt
          :editable="editable"
          :project-id="project.id"
          :project-type="project.type"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="agileProject"
        label="工时"
        lazy
        name="worklog"
      >
        <ProjectWorkLog
          :editable="editable"
          :project-id="project.id"
          :project-type="project.type"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import * as ProjectApi from '@/api/pms/pm/project'
import * as ProjectFavoriteApi from '@/api/pms/pm/project/favorite'
import * as ProjectMemberApi from '@/api/pms/pm/project/member'
import { PmsProjectStatus, PmsProjectType, PmsWorkItemType } from '@/views/pms/pm/utils/constants'
import IterationList from '@/views/pms/pm/iteration/list/IterationList.vue'
import WorkItemAllList from '@/views/pms/pm/workitem/list/WorkItemAllList.vue'
import WorkItemList from '@/views/pms/pm/workitem/list/WorkItemList.vue'
import PlanningBoard from './PlanningBoard.vue'
import ProjectGantt from './ProjectGantt.vue'
import ProjectOverview from './ProjectOverview.vue'
import ProjectWorkLog from './ProjectWorkLog.vue'

export default {
  name: 'PmsProjectDetail',
  components: {
    IterationList,
    PlanningBoard,
    ProjectGantt,
    ProjectOverview,
    ProjectWorkLog,
    WorkItemAllList,
    WorkItemList
  },
  data() {
    return {
      PmsWorkItemType,
      loading: true,
      project: {},
      activeTab: 'task',
      agileTabs: [
        'overview',
        'planning',
        'iteration',
        'all',
        'requirement',
        'task',
        'defect',
        'gantt',
        'worklog'
      ],
      generalTabs: ['overview', 'task', 'gantt']
    }
  },
  computed: {
    agileProject() {
      return this.project.type === PmsProjectType.AGILE
    },
    editable() {
      return Boolean(
        this.project.writeStatus && this.project.status === PmsProjectStatus.ACTIVE
      )
    }
  },
  watch: {
    '$route.query.tabs'() {
      if (this.project.id) this.initActiveTab()
    }
  },
  mounted() {
    const projectId = Number(this.$route.params.id)
    if (!this.$route.params.id || Number.isNaN(projectId)) {
      this.$message.warning('参数错误，项目不能为空！')
      this.close()
      return
    }
    this.getProject()
  },
  methods: {
    async getProject() {
      this.loading = true
      try {
        const response = await ProjectApi.getProject(Number(this.$route.params.id))
        this.project = response.data
        this.initActiveTab()
      } finally {
        this.loading = false
      }
    },
    initActiveTab() {
      const availableTabs = this.agileProject ? this.agileTabs : this.generalTabs
      const requestedTab = typeof this.$route.query.tabs === 'string'
        ? this.$route.query.tabs
        : undefined
      this.activeTab = requestedTab && availableTabs.includes(requestedTab)
        ? requestedTab
        : 'task'
    },
    handleTabChange(tab) {
      this.$router.replace({
        query: {
          ...this.$route.query,
          tabs: String(tab.name)
        }
      })
    },
    async handleCollect() {
      if (this.project.favoriteStatus) {
        await ProjectFavoriteApi.deleteProjectFavorite(this.project.id)
      } else {
        await ProjectFavoriteApi.createProjectFavorite(this.project.id)
      }
      this.project.favoriteStatus = !this.project.favoriteStatus
      this.$message.success(this.project.favoriteStatus ? '收藏成功' : '已取消收藏')
    },
    handleProjectCommand(command) {
      if (command === 'favorite') {
        this.handleCollect()
      } else if (command === 'config') {
        this.openProjectConfig()
      } else if (command === 'exit') {
        this.handleExit()
      }
    },
    openProjectConfig() {
      this.$router.push({ name: 'PmsProjectConfig', params: { id: this.project.id }})
    },
    async handleExit() {
      try {
        await this.$confirm(
          `确认退出项目“${this.project.name}”吗？退出后将不能访问该项目，需要项目管理员重新邀请才能加入。`,
          '提示',
          { type: 'warning' }
        )
        await ProjectMemberApi.exitProject(this.project.id)
        this.$message.success('已退出项目')
        this.close()
      } catch (error) {
        // 用户取消时保持当前页面。
      }
    },
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ name: 'PmsProject' })
    }
  }
}
</script>

<style scoped>
.pms-project-detail { min-height: calc(100vh - 84px); }
.detail-header,
.detail-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.detail-title-wrap { min-width: 0; justify-content: flex-start; gap: 12px; }
.detail-title-main { min-width: 0; }
.detail-title-main h2 {
  margin: 0;
  overflow: hidden;
  font-size: 20px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-description { margin-top: 4px; color: #909399; font-size: 13px; }
.pms-project-detail ::v-deep .el-tabs__header { margin-bottom: 20px; }
</style>
