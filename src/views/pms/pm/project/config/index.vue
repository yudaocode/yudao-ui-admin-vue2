<template>
  <el-card shadow="never" class="app-container" v-loading="loading">
    <!-- 项目设置标题 -->
    <div class="mb-16px flex items-center gap-12px">
      <div
        class="project-icon"
      >
        <Icon :icon="project.icon || 'ep:folder'" :size="30" />
      </div>
      <div class="min-w-0">
        <h2 class="m-0 truncate text-20px font-600">项目设置</h2>
        <div class="mt-4px text-13px text-[var(--el-text-color-secondary)]">
          {{ project.name || '项目' }}
        </div>
      </div>
    </div>

    <!-- 项目设置页签 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <el-tab-pane label="基本信息" name="basic">
        <ProjectBasicInfo
          v-if="project.id"
          :editable="editable"
          :project="project"
          @success="getProject"
        />
      </el-tab-pane>
      <el-tab-pane label="成员" lazy name="member">
        <ProjectMemberList v-if="project.id" :editable="editable" :project="project" />
      </el-tab-pane>
      <el-tab-pane label="项目公告" lazy name="announcement">
        <ProjectAnnouncementList v-if="project.id" :editable="editable" :project-id="project.id" />
      </el-tab-pane>
      <el-tab-pane label="协作配置" name="configuration">
        <ProjectCollaborationConfig
          v-if="project.id"
          :project-id="project.id"
          :project-type="project.type"
        />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import * as ProjectApi from '@/api/pms/pm/project'
import { Icon } from '@/components/Icon'
import { PmsProjectStatus } from '@/views/pms/pm/utils/constants'
import ProjectAnnouncementList from './ProjectAnnouncementList.vue'
import ProjectBasicInfo from './ProjectBasicInfo.vue'
import ProjectCollaborationConfig from './ProjectCollaborationConfig.vue'
import ProjectMemberList from './ProjectMemberList.vue'
export default {
  name: 'PmsProjectConfig',
  components: { Icon, ProjectAnnouncementList, ProjectBasicInfo, ProjectCollaborationConfig, ProjectMemberList },
  data() { return { loading: false, project: {}, activeTab: 'basic' } },
  computed: {
    projectId() { return Number(this.$route.params.id) },
    editable() { return this.project.writeStatus && this.project.status === PmsProjectStatus.ACTIVE }
  },
  watch: {
    '$route.query.tabs'() { this.initActiveTab() },
    '$route.params.id'() { this.init() }
  },
  mounted() { this.init() },
  methods: {
    async getProject() {
      this.loading = true
      try {
        const response = await ProjectApi.getProject(this.projectId)
        this.project = response.data
      } finally { this.loading = false }
    },
    handleTabChange(tab) {
      const url = this.$router.resolve({
        name: this.$route.name, params: this.$route.params, query: { ...this.$route.query, tabs: tab.name }
      }).href
      window.history.replaceState(window.history.state, '', url)
    },
    initActiveTab() { this.activeTab = String(this.$route.query.tabs || 'basic') },
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      return this.$router.push({ name: 'PmsProjectDetail', params: { id: this.projectId } })
    },
    init() {
      if (!this.projectId || Number.isNaN(this.projectId)) {
        this.$message.warning('参数错误，项目不能为空！')
        return this.close()
      }
      this.initActiveTab()
      return this.getProject()
    }
  }
}
</script>

<style scoped>
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.mb-16px { margin-bottom: 16px; }
.ml-8px { margin-left: 8px; }
.mt-4px { margin-top: 4px; }
.m-0 { margin: 0; }
.gap-8px { gap: 8px; }
.gap-12px { gap: 12px; }
.gap-16px { gap: 16px; }
.text-13px { font-size: 13px; color: #909399; }
.text-18px { font-size: 18px; }
.text-20px { font-size: 20px; }
.font-600 { font-weight: 600; }
.whitespace-pre-wrap { white-space: pre-wrap; }
.line-clamp-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.leading-22px { line-height: 22px; }
.leading-20px { line-height: 20px; }
.delete-button { color: #f56c6c; }
.project-icon { width: 48px; height: 48px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid #ebeef5; border-radius: 6px; background: #f5f7fa; color: #409eff; }
.min-w-0 { min-width: 0; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
