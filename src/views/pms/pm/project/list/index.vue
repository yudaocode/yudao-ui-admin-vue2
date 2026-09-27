<template>
  <div class="app-container project-center">
  <doc-alert
    title="【PMS】项目中心、工作台与项目管理"
    url="https://doc.iocoder.cn/pms/pm/project/"
  />

  <el-card shadow="never" v-loading="favoriteLoading">
    <!-- 星标项目 -->
    <div class="mb-16px flex items-baseline gap-12px">
      <span class="text-16px font-600">星标项目</span>
      <span class="text-13px text-[var(--el-text-color-secondary)]"> 快速访问经常使用的项目 </span>
    </div>
    <div
      v-if="favoriteProjectList.length"
      class="favorite-grid"
    >
      <div
        v-for="project in favoriteProjectList"
        :key="project.id"
        class="favorite-card"
        @click="openProjectDetail(project)"
      >
        <span
          class="project-icon"
        >
          <Icon :icon="project.icon || 'ep:folder'" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="truncate project-name">
            {{ project.name }}
          </div>
          <div class="mt-4px truncate text-12px text-[var(--el-text-color-secondary)]">
            {{ project.description || `${formatProjectType(project.type)} · 暂无项目描述` }}
          </div>
          <el-progress
            class="mt-10px"
            :percentage="formatProjectCompletionRate(project)"
            :stroke-width="5"
            :show-text="false"
          />
          <Echart
            v-if="project.completedTrends"
            class="mt-6px"
            :height="56"
            :options="getFavoriteTrendChartOptions(project)"
          />
        </div>
        <el-tooltip content="取消星标" placement="top">
          <el-button
            aria-label="取消星标"
            class="favorite-star"
            type="text"
            @click.stop="handleCollect(project)"
          >
            <Icon :size="20" icon="ep:star-filled" />
          </el-button>
        </el-tooltip>
        <div class="favorite-more" @click.stop>
          <el-dropdown @command="(command) => handleProjectCommand(command, project)">
            <el-button aria-label="更多操作" type="text">
              <Icon :size="18" icon="ep:more-filled" />
            </el-button>
            <template slot="dropdown">
              <el-dropdown-menu>
                <el-dropdown-item
                  v-if="project.adminStatus"
                  v-hasPermi="['pms:pm:project:update']"
                  command="config"
                >
                  项目设置
                </el-dropdown-item>
                <template v-if="project.memberStatus">
                  <el-dropdown-item disabled divided>移动到分组</el-dropdown-item>
                  <el-dropdown-item
                    v-for="group in movableGroupList"
                    :key="group.id"
                    :command="`group:${group.id}`"
                  >
                    {{ group.name }}
                  </el-dropdown-item>
                </template>
                <el-dropdown-item
                  v-if="project.exitStatus"
                  v-hasPermi="['pms:pm:project-member:query']"
                  command="exit"
                  divided
                >
                  退出项目
                </el-dropdown-item>
                <template v-if="checkPermi(['pms:pm:project:update'])">
                  <el-dropdown-item
                    v-if="project.adminStatus"
                    command="archive"
                    :divided="!project.exitStatus"
                  >
                    归档项目
                  </el-dropdown-item>
                  <el-dropdown-item v-if="project.adminStatus" command="recycle">
                    移入回收站
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    <el-empty v-else :image-size="72" description="暂无星标项目" />
  </el-card>

  <el-card shadow="never">
    <!-- 搜索 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="项目名称" prop="name">
        <el-input
          v-model="queryParams.name"
          style="width: 240px"
          clearable
          placeholder="请输入项目名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="排序方式" prop="sortType">
        <el-select v-model="queryParams.sortType" style="width: 240px" @change="handleQuery">
          <el-option label="按访问时间" :value="PmsProjectSortType.ACCESS_TIME" />
          <el-option label="按创建时间" :value="PmsProjectSortType.CREATE_TIME" />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="queryParams.sceneType === PmsProjectSceneType.PARTICIPATED"
        label="个人分组"
        prop="groupId"
      >
        <el-select
          v-model="queryParams.groupId"
          style="width: 240px"
          placeholder="请选择个人分组"
          @change="handleQuery"
        >
          <el-option
            v-for="group in groupList"
            :key="group.id"
            :label="`${group.name}（${group.projectCount}）`"
            :value="group.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" />
          重置
        </el-button>
        <el-button
          v-hasPermi="['pms:pm:project:create']"
          type="primary"
          @click="openForm('create')"
        >
          新建项目
        </el-button>
        <el-button v-hasPermi="['pms:pm:project-group:query']" @click="openGroupManageDialog">
          管理分组
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>

  <el-card shadow="never">
    <!-- 项目范围 -->
    <el-tabs v-model="sceneTab" class="-mt-8px" @tab-click="handleSceneChange">
      <el-tab-pane label="全部项目" :name="String(PmsProjectSceneType.ALL)" />
      <el-tab-pane label="我负责的" :name="String(PmsProjectSceneType.MANAGED)" />
      <el-tab-pane label="我参与的" :name="String(PmsProjectSceneType.PARTICIPATED)" />
    </el-tabs>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="projectList" :show-overflow-tooltip="true">
      <el-table-column fixed="left" label="项目名称" min-width="220">
        <template slot-scope="scope">
          <div class="flex items-center">
            <span
              class="project-icon table-icon"
            >
              <Icon :icon="scope.row.icon || 'ep:folder'" />
            </span>
            <div class="flex min-w-0 items-center gap-8px">
              <div
                class="truncate project-name"
                @click="openProjectDetail(scope.row)"
              >
                {{ scope.row.name }}
              </div>
              <el-tag effect="plain" size="small" type="info">
                {{ formatProjectTypeShort(scope.row.type) }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="完成度" min-width="200">
        <template slot-scope="scope">
          <div class="flex items-center gap-12px">
            <el-progress
              class="flex-1"
              :percentage="formatProjectCompletionRate(scope.row)"
              :show-text="false"
            />
            <el-tooltip content="已完成 / 未开始 / 进行中" placement="top">
              <span class="whitespace-nowrap text-12px text-[var(--el-text-color-secondary)]">
                {{ formatProjectWorkItemCounts(scope.row) }}
              </span>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="截止时间" prop="endTime" width="140">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.endTime" effect="plain" type="info">
            {{ formatDeadline(scope.row.endTime) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="170"
      />
      <el-table-column label="管理员" min-width="140">
        <template slot-scope="scope">{{ scope.row.adminNames.join('、') || '-' }}</template>
      </el-table-column>
      <el-table-column
        v-if="queryParams.sceneType !== PmsProjectSceneType.ALL"
        align="center"
        width="72"
      >
        <template slot="header">
          <el-tooltip content="是否星标" placement="top">
            <Icon :size="17" icon="ep:star" />
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <el-switch :value="scope.row.favoriteStatus" @change="handleCollect(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="76">
        <template slot-scope="scope">
          <el-dropdown @command="(command) => handleProjectCommand(command, scope.row)">
            <el-button type="text">更多</el-button>
            <template slot="dropdown">
              <el-dropdown-menu>
                <el-dropdown-item
                  v-if="scope.row.adminStatus"
                  v-hasPermi="['pms:pm:project:update']"
                  command="config"
                >
                  项目设置
                </el-dropdown-item>
                <template v-if="isParticipatedProjectScene && scope.row.memberStatus">
                  <el-dropdown-item disabled divided>移动到分组</el-dropdown-item>
                  <el-dropdown-item
                    v-for="group in movableGroupList"
                    :key="group.id"
                    :command="`group:${group.id}`"
                  >
                    {{ group.name }}
                  </el-dropdown-item>
                </template>
                <el-dropdown-item
                  v-if="scope.row.exitStatus"
                  v-hasPermi="['pms:pm:project-member:query']"
                  command="exit"
                  divided
                >
                  退出项目
                </el-dropdown-item>
                <template v-if="checkPermi(['pms:pm:project:update'])">
                  <el-dropdown-item
                    v-if="scope.row.adminStatus"
                    command="archive"
                    :divided="!scope.row.exitStatus"
                  >
                    归档项目
                  </el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.adminStatus" command="recycle">
                    移入回收站
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNo"
      :total="total"
      @pagination="getProjectList"
    />
  </el-card>

  <!-- 新建或修改项目 -->
  <ProjectForm ref="formRef" @success="handleProjectChanged" />
  <!-- 管理项目分组 -->
  <ProjectGroupList ref="groupListRef" @success="getGroupList" />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils/formatTime'
import { checkPermi } from '@/utils/permission'
import { Icon } from '@/components/Icon'
import Echart from '../detail/PmsEchart.vue'
import * as ProjectApi from '@/api/pms/pm/project'
import * as ProjectFavoriteApi from '@/api/pms/pm/project/favorite'
import * as ProjectMemberApi from '@/api/pms/pm/project/member'
import * as ProjectGroupApi from '@/api/pms/pm/project/group'
import { PmsProjectGroupType, PmsProjectSceneType, PmsProjectSortType, PmsProjectStatus, PmsProjectType } from '@/views/pms/pm/utils/constants'
import { formatProjectCompletionRate, formatProjectType, formatProjectTypeShort, formatProjectWorkItemCounts } from '@/views/pms/pm/utils/format'
import ProjectForm from '../components/ProjectForm.vue'
import ProjectGroupList from './components/group/ProjectGroupList.vue'
const PROJECT_SCENE_TAB_MAP = {
  [PmsProjectSceneType.ALL]: 'all', [PmsProjectSceneType.MANAGED]: 'owner', [PmsProjectSceneType.PARTICIPATED]: 'participate'
}
export default {
  name: 'PmsProjectList',
  components: { Icon, Echart, ProjectForm, ProjectGroupList },
  data() {
    return {
      PmsProjectSceneType, PmsProjectSortType,
      initialized: false, loading: true, favoriteLoading: false, total: 0,
      projectList: [], favoriteProjectList: [], groupList: [],
      queryParams: { pageNo: 1, pageSize: 10, name: '', sceneType: this.getProjectSceneByRoute(),
        groupId: undefined, status: PmsProjectStatus.ACTIVE, sortType: PmsProjectSortType.ACCESS_TIME }
    }
  },
  computed: {
    sceneTab: {
      get() { return String(this.queryParams.sceneType) },
      set(value) { this.queryParams.sceneType = Number(value) }
    },
    isParticipatedProjectScene() { return this.queryParams.sceneType === PmsProjectSceneType.PARTICIPATED },
    movableGroupList() { return this.groupList.filter(group => group.type !== PmsProjectGroupType.ALL) }
  },
  watch: {
    '$route.query.tabs': async function() {
      if (!this.initialized) return
      this.queryParams.status = PmsProjectStatus.ACTIVE
      this.queryParams.sceneType = this.getProjectSceneByRoute()
      this.queryParams.pageNo = 1
      await Promise.all([this.getProjectList(), this.getFavoriteProjectList()])
    }
  },
  mounted() { this.init() },
  methods: {
    dateFormatter, checkPermi, formatProjectCompletionRate, formatProjectType, formatProjectTypeShort, formatProjectWorkItemCounts,
    formatDeadline(value) {
      const date = new Date(value)
      return (date.getMonth() + 1) + '月' + date.getDate() + '日截止'
    },
    getFavoriteTrendChartOptions(project) {
      const trends = project.completedTrends || []
      return {
        animation: false, grid: { top: 8, right: 8, bottom: 8, left: 8 },
        xAxis: { type: 'category', show: false, data: trends.map(item => item.date.slice(5)) },
        yAxis: { type: 'value', show: false, minInterval: 1 },
        series: [{ type: 'line', smooth: true, symbol: 'none', data: trends.map(item => item.count),
          lineStyle: { width: 2, color: '#409eff' }, areaStyle: { color: 'rgba(64, 158, 255, 0.12)' } }]
      }
    },
    getProjectSceneByRoute() {
      const tabs = this.$route.query.tabs
      const entry = Object.entries(PROJECT_SCENE_TAB_MAP).find(([, tab]) => tab === tabs)
      return entry ? Number(entry[0]) : PmsProjectSceneType.PARTICIPATED
    },
    async getProjectList() {
      this.loading = true
      try {
        const response = await ProjectApi.getProjectPage(this.queryParams)
        this.projectList = response.data.list
        this.total = response.data.total
      } finally { this.loading = false }
    },
    async getFavoriteProjectList() {
      this.favoriteLoading = true
      try {
        const response = await ProjectApi.getFavoriteProjectList()
        this.favoriteProjectList = await Promise.all(response.data.map(async project => {
          const overviewResponse = await ProjectApi.getProjectOverview(project.id)
          return { ...project, completedTrends: overviewResponse.data.completedTrends }
        }))
      } finally { this.favoriteLoading = false }
    },
    async getGroupList() {
      const response = await ProjectGroupApi.getProjectGroupList()
      this.groupList = response.data
      if (!this.queryParams.groupId) {
        const allGroup = this.groupList.find(group => group.type === PmsProjectGroupType.ALL)
        this.queryParams.groupId = allGroup && allGroup.id
      }
    },
    openProjectDetail(project) {
      return this.$router.push({ name: 'PmsProjectDetail', params: { id: project.id },
        query: project.type === PmsProjectType.AGILE ? { tabs: 'planning' } : undefined })
    },
    handleQuery() { this.queryParams.pageNo = 1; return this.getProjectList() },
    resetQuery() {
      this.$refs.queryFormRef.resetFields()
      this.queryParams.sceneType = this.getProjectSceneByRoute()
      this.queryParams.status = PmsProjectStatus.ACTIVE
      this.queryParams.sortType = PmsProjectSortType.ACCESS_TIME
      const allGroup = this.groupList.find(group => group.type === PmsProjectGroupType.ALL)
      this.queryParams.groupId = allGroup && allGroup.id
      return this.handleQuery()
    },
    handleSceneChange() {
      const tabs = PROJECT_SCENE_TAB_MAP[this.queryParams.sceneType]
      if (tabs === this.$route.query.tabs) return
      return this.$router.replace({ name: 'PmsProjectList', query: { ...this.$route.query, tabs } })
    },
    openForm(type, id) { this.$refs.formRef.open(type, id) },
    openProjectConfig(id) { return this.$router.push({ name: 'PmsProjectConfig', params: { id } }) },
    openGroupManageDialog() { this.$refs.groupListRef.open() },
    async handleMoveGroup(projectId, groupId) {
      await ProjectGroupApi.moveProjectToGroup({ projectId, groupId })
      this.$message.success('项目分组已更新')
      await Promise.all([this.getProjectList(), this.getGroupList()])
    },
    async handleCollect(project) {
      if (project.favoriteStatus) await ProjectFavoriteApi.deleteProjectFavorite(project.id)
      else await ProjectFavoriteApi.createProjectFavorite(project.id)
      this.$message.success(project.favoriteStatus ? '已取消星标' : '星标成功')
      await Promise.all([this.getProjectList(), this.getFavoriteProjectList()])
    },
    async handleExit(project) {
      try {
        await this.$confirm('确认退出项目“' + project.name + '”吗？退出后将不能访问该项目，需要项目管理员重新邀请才能加入。', '提示', { type: 'warning' })
      } catch (error) { if (error === 'cancel' || error === 'close') return; throw error }
      await ProjectMemberApi.exitProject(project.id)
      this.$message.success('已退出项目')
      await this.handleProjectChanged()
    },
    async handleProjectCommand(command, project) {
      if (command === 'config') return this.openProjectConfig(project.id)
      if (command === 'exit') return this.handleExit(project)
      if (command.startsWith('group:')) return this.handleMoveGroup(project.id, Number(command.substring(6)))
      if (command !== 'archive' && command !== 'recycle') return
      try {
        await this.$confirm(command === 'archive' ? '确认归档项目“' + project.name + '”吗？' : '确认将项目“' + project.name + '”移入回收站吗？', '提示', { type: 'warning' })
      } catch (error) { if (error === 'cancel' || error === 'close') return; throw error }
      if (command === 'archive') await ProjectApi.archiveProject(project.id)
      else await ProjectApi.recycleProject(project.id)
      this.$message.success(command === 'archive' ? '项目已归档' : '项目已移入回收站')
      await this.handleProjectChanged()
    },
    async handleProjectChanged() {
      await Promise.all([this.getProjectList(), this.getGroupList(), this.getFavoriteProjectList()])
    },
    async init() {
      if (typeof this.$route.query.tabs !== 'string' || !Object.values(PROJECT_SCENE_TAB_MAP).includes(this.$route.query.tabs)) {
        await this.$router.replace({ name: 'PmsProjectList', query: { ...this.$route.query, tabs: PROJECT_SCENE_TAB_MAP[PmsProjectSceneType.PARTICIPATED] } })
        this.queryParams.sceneType = this.getProjectSceneByRoute()
      }
      await this.getGroupList()
      await Promise.all([this.getProjectList(), this.getFavoriteProjectList()])
      this.initialized = true
    }
  }
}
</script>

<style scoped>
.project-center > .el-card { margin-bottom: 16px; }
.favorite-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); gap: 12px; }
.favorite-card { position: relative; display: flex; min-width: 0; cursor: pointer; align-items: flex-start; gap: 12px; border-radius: 6px; border: 1px solid #ebeef5; background: #f5f7fa; padding: 16px 52px 16px 16px; transition: border-color .2s; }
.favorite-card:hover { border-color: #a0cfff; }
.project-icon { display: inline-flex; width: 34px; height: 34px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 6px; background: #ecf5ff; color: #409eff; }
.table-icon { margin-right: 10px; }
.project-name { color: #409eff; font-weight: 500; cursor: pointer; }
.favorite-star { position: absolute; top: 12px; right: 12px; color: #e6a23c; padding: 0; }
.favorite-more { position: absolute; bottom: 8px; right: 12px; }
.favorite-more .el-button { padding: 0; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.min-w-0 { min-width: 0; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }
.gap-8px { gap: 8px; }
.gap-12px { gap: 12px; }
.mb-16px { margin-bottom: 16px; }
.mt-4px { margin-top: 4px; }
.mt-6px { margin-top: 6px; }
.mt-10px { margin-top: 10px; }
.text-12px { font-size: 12px; color: #909399; }
.text-13px { font-size: 13px; color: #909399; }
.text-16px { font-size: 16px; }
.font-600 { font-weight: 600; }
.truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.whitespace-nowrap { white-space: nowrap; }
</style>

