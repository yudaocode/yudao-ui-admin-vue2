<template>
  <div class="app-container pms-workbench">
    <doc-alert title="PMS 手册（功能开启）" url="https://doc.iocoder.cn/pms/build/" />

    <el-card class="filter-card" shadow="never">
      <el-form
        ref="queryFormRef"
        :inline="true"
        :model="queryParams"
        class="query-form"
        label-width="68px"
      >
        <el-form-item label="项目" prop="projectId">
          <ProjectSelect v-model="queryParams.projectId" @change="handleProjectChange" />
        </el-form-item>
        <el-form-item label="事项" prop="name">
          <el-input
            v-model="queryParams.name"
            class="filter-control"
            clearable
            placeholder="搜索标题或编号"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" class="filter-control" clearable placeholder="全部状态">
            <el-option label="未开始" :value="PmsWorkItemStatusType.PENDING" />
            <el-option label="进行中" :value="PmsWorkItemStatusType.PROCESSING" />
            <el-option label="已完成" :value="PmsWorkItemStatusType.COMPLETED" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="queryParams.priority" class="filter-control" clearable placeholder="全部优先级">
            <el-option
              v-for="option in priorityOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="queryParams.projectId" label="迭代" prop="iterationId">
          <IterationSelect
            v-model="queryParams.iterationId"
            :project-id="queryParams.projectId"
            class="filter-control"
            placeholder="全部迭代"
          />
        </el-form-item>
        <el-form-item label="截止日期" prop="endTime">
          <el-date-picker
            v-model="queryParams.endTime"
            class="filter-control"
            end-placeholder="结束日期"
            range-separator="至"
            start-placeholder="开始日期"
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><Icon class="button-icon" icon="ep:search" />搜索</el-button>
          <el-button @click="resetQuery"><Icon class="button-icon" icon="ep:refresh" />重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-tabs v-model="activeTab" class="workbench-tabs" @tab-click="handleTabChange">
        <el-tab-pane v-for="tab in tabs" :key="tab.value" :name="tab.value">
          <span slot="label" class="tab-label">
            <el-badge :hidden="displayCountData[tab.countKey] === 0" :value="displayCountData[tab.countKey]">
              <span>{{ tab.label }}</span>
            </el-badge>
          </span>
        </el-tab-pane>
      </el-tabs>

      <el-table
        v-if="activeTab !== PmsWorkbenchTab.ITERATION"
        v-loading="loading"
        :data="workItemList"
        show-overflow-tooltip
      >
        <el-table-column align="center" label="ID" width="90">
          <template slot-scope="scope">#{{ scope.row.serialNumber }}</template>
        </el-table-column>
        <el-table-column label="标题" min-width="240">
          <template slot-scope="scope">
            <el-button type="text" @click="openWorkItem(scope.row)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="优先级" width="120">
          <template slot-scope="scope">
            <el-select
              v-if="isQuickEditing(scope.row, 'priority')"
              v-model="scope.row.priority"
              @blur="cancelQuickEdit"
              @change="handleQuickUpdate(scope.row, 'priority')"
              @keyup.esc.native.stop="cancelQuickEdit"
            >
              <el-option v-for="option in priorityOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
            <el-button v-else-if="scope.row.writeStatus" type="text" @click="startQuickEdit(scope.row, 'priority')">
              {{ getPriorityName(scope.row.priority) }}
            </el-button>
            <span v-else>{{ getPriorityName(scope.row.priority) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" width="140">
          <template slot-scope="scope">
            <el-select
              v-if="isQuickEditing(scope.row, 'statusId')"
              v-model="scope.row.statusId"
              @blur="cancelQuickEdit"
              @visible-change="getStatusOptions(scope.row, $event)"
              @change="handleStatusChange(scope.row)"
              @keyup.esc.native.stop="cancelQuickEdit"
            >
              <el-option
                v-for="status in getStatusOptionList(scope.row)"
                :key="status.id"
                :label="status.name"
                :value="status.id"
              />
            </el-select>
            <el-button v-else-if="scope.row.writeStatus" type="text" @click="startQuickEdit(scope.row, 'statusId')">
              {{ scope.row.statusName }}
            </el-button>
            <span v-else>{{ scope.row.statusName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="处理人" min-width="150">
          <template slot-scope="scope">
            <el-select
              v-if="isQuickEditing(scope.row, 'assigneeUserId')"
              v-model="scope.row.assigneeUserId"
              clearable
              filterable
              @blur="cancelQuickEdit"
              @visible-change="getMemberOptions(scope.row.projectId, $event)"
              @change="handleQuickUpdate(scope.row, 'assigneeUserId')"
              @keyup.esc.native.stop="cancelQuickEdit"
            >
              <el-option
                v-for="member in getMemberOptionList(scope.row)"
                :key="member.userId"
                :label="member.nickname"
                :value="member.userId"
              />
            </el-select>
            <el-button v-else-if="scope.row.writeStatus" type="text" @click="startQuickEdit(scope.row, 'assigneeUserId')">
              {{ scope.row.assigneeUserName || '未分配' }}
            </el-button>
            <span v-else>{{ scope.row.assigneeUserName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建人" min-width="120" prop="creatorUserName" />
        <el-table-column label="所属项目" min-width="180" prop="projectName" />
        <el-table-column align="center" label="截止日期" width="190">
          <template slot-scope="scope">
            <el-date-picker
              v-if="isQuickEditing(scope.row, 'endTime')"
              v-model="scope.row.endTime"
              class="quick-date"
              clearable
              placeholder="截止日期"
              type="datetime"
              value-format="timestamp"
              @blur="cancelQuickEdit"
              @change="handleQuickUpdate(scope.row, 'endTime')"
              @keyup.esc.native.stop="cancelQuickEdit"
            />
            <el-button v-else-if="scope.row.writeStatus" type="text" @click="startQuickEdit(scope.row, 'endTime')">
              {{ formatDate(scope.row.endTime) || '未设置' }}
            </el-button>
            <span v-else>{{ formatDate(scope.row.endTime) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建日期" width="180">
          <template slot-scope="scope">{{ formatDate(scope.row.createTime) }}</template>
        </el-table-column>
      </el-table>

      <el-table v-else v-loading="loading" :data="iterationList" show-overflow-tooltip>
        <el-table-column align="center" label="ID" width="100" prop="id" />
        <el-table-column label="标题" min-width="260">
          <template slot-scope="scope">
            <el-button type="text" @click="openIteration(scope.row)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" width="120">
          <template slot-scope="scope">{{ getIterationStatusName(scope.row.status) }}</template>
        </el-table-column>
        <el-table-column label="所属项目" min-width="180" prop="projectName" />
        <el-table-column align="center" label="开始日期" width="180">
          <template slot-scope="scope">{{ formatDate(scope.row.startTime) }}</template>
        </el-table-column>
        <el-table-column align="center" label="截止日期" width="180">
          <template slot-scope="scope">{{ formatDate(scope.row.endTime) }}</template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :limit.sync="queryParams.pageSize"
        :page.sync="queryParams.pageNo"
        :total="total"
        @pagination="getWorkbenchItemList"
      />
    </el-card>

    <WorkItemDetail ref="workItemDetailRef" @success="refreshWorkbench" />
  </div>
</template>

<script>
import * as ProjectMemberApi from '@/api/pms/pm/project/member'
import * as WorkbenchApi from '@/api/pms/pm/workbench'
import * as WorkItemApi from '@/api/pms/pm/workitem'
import * as WorkItemStatusApi from '@/api/pms/pm/workitem/status'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import {
  PmsWorkbenchTab,
  PmsWorkbenchTabOptions,
  PmsWorkItemStatusType,
  PmsWorkItemType
} from '@/views/pms/pm/utils/constants'
import { getIterationStatusName, getPriorityName } from '@/views/pms/pm/utils/format'
import { Icon } from '@/components/Icon'
import WorkItemDetail from '@/views/pms/pm/workitem/detail/WorkItemDetail.vue'
import IterationSelect from '@/views/pms/pm/iteration/components/IterationSelect.vue'
import ProjectSelect from './components/ProjectSelect.vue'

function getDefaultCountData() {
  return { requirementCount: 0, taskCount: 0, defectCount: 0, iterationCount: 0 }
}

export default {
  name: 'PmsWorkbench',
  components: { Icon, WorkItemDetail, IterationSelect, ProjectSelect },
  data() {
    return {
      PmsWorkbenchTab,
      PmsWorkItemStatusType,
      activeTab: PmsWorkbenchTab.ALL,
      tabs: PmsWorkbenchTabOptions,
      priorityOptions: getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_PRIORITY),
      countData: getDefaultCountData(),
      loading: false,
      workItemList: [],
      iterationList: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 20,
        projectId: undefined,
        name: undefined,
        status: undefined,
        priority: undefined,
        iterationId: undefined,
        endTime: undefined
      },
      statusOptionMap: {},
      memberOptionMap: {},
      quickEditingKey: undefined
    }
  },
  computed: {
    displayCountData() {
      return {
        ...this.countData,
        allCount: this.countData.requirementCount + this.countData.taskCount + this.countData.defectCount
      }
    }
  },
  mounted() {
    document.addEventListener('pointerdown', this.handleDocumentPointerDown, true)
    this.refreshWorkbench()
  },
  beforeDestroy() {
    document.removeEventListener('pointerdown', this.handleDocumentPointerDown, true)
  },
  methods: {
    formatDate,
    getIterationStatusName,
    getPriorityName,
    getQuickEditKey(item, field) {
      return `${item.id}-${field}`
    },
    isQuickEditing(item, field) {
      return this.quickEditingKey === this.getQuickEditKey(item, field)
    },
    async startQuickEdit(item, field) {
      this.quickEditingKey = this.getQuickEditKey(item, field)
      if (field === 'statusId') await this.getStatusOptions(item, true)
      if (field === 'assigneeUserId') await this.getMemberOptions(item.projectId, true)
    },
    cancelQuickEdit() {
      this.quickEditingKey = undefined
    },
    handleDocumentPointerDown(event) {
      if (!this.quickEditingKey || !(event.target instanceof Element)) return
      const activeEditor = document.querySelector('.pms-workbench .el-table .el-select, .pms-workbench .el-table .el-date-editor')
      const isEditorClick = activeEditor && activeEditor.contains(event.target)
      const isPopupClick = event.target.closest('.el-select-dropdown, .el-picker-panel')
      if (!isEditorClick && !isPopupClick) this.cancelQuickEdit()
    },
    async getWorkbenchItemList() {
      this.loading = true
      try {
        const params = { ...this.queryParams, type: this.getWorkItemType() }
        if (this.activeTab === PmsWorkbenchTab.ITERATION) {
          const response = await WorkbenchApi.getWorkbenchIterationPage(params)
          this.iterationList = response.data.list
          this.workItemList = []
          this.total = response.data.total
          return
        }
        const response = await WorkbenchApi.getWorkbenchWorkItemPage(params)
        this.workItemList = response.data.list
        this.iterationList = []
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    async getCount() {
      const response = await WorkbenchApi.getWorkbenchCount(this.queryParams)
      this.countData = response.data
    },
    getWorkItemType() {
      return {
        [PmsWorkbenchTab.REQUIREMENT]: PmsWorkItemType.REQUIREMENT,
        [PmsWorkbenchTab.TASK]: PmsWorkItemType.TASK,
        [PmsWorkbenchTab.DEFECT]: PmsWorkItemType.DEFECT
      }[this.activeTab]
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.refreshWorkbench()
    },
    resetQuery() {
      this.queryParams.name = undefined
      this.queryParams.status = undefined
      this.queryParams.priority = undefined
      this.queryParams.iterationId = undefined
      this.queryParams.endTime = undefined
      return this.handleQuery()
    },
    getWorkItemOptionKey(item) {
      return `${item.projectId}-${item.type}`
    },
    getStatusOptionList(item) {
      return this.statusOptionMap[this.getWorkItemOptionKey(item)] || [{
        id: item.statusId,
        projectId: item.projectId,
        workItemType: item.type,
        name: item.statusName,
        statusType: item.status,
        boardName: '',
        defaultStatus: false,
        sort: 0
      }]
    },
    getMemberOptionList(item) {
      if (this.memberOptionMap[item.projectId]) return this.memberOptionMap[item.projectId]
      return item.assigneeUserId ? [{
        userId: item.assigneeUserId,
        nickname: item.assigneeUserName || `用户 #${item.assigneeUserId}`,
        level: 0,
        creatorStatus: false
      }] : []
    },
    async getStatusOptions(item, visible) {
      const key = this.getWorkItemOptionKey(item)
      if (!visible || this.statusOptionMap[key]) return
      const response = await WorkItemStatusApi.getWorkItemStatusList(item.projectId, item.type)
      this.$set(this.statusOptionMap, key, response.data)
    },
    async getMemberOptions(projectId, visible) {
      if (!visible || this.memberOptionMap[projectId]) return
      const response = await ProjectMemberApi.getProjectMemberList(projectId)
      this.$set(this.memberOptionMap, projectId, response.data)
    },
    async handleStatusChange(item) {
      this.cancelQuickEdit()
      try {
        await WorkItemApi.updateWorkItemStatus(item.id, item.statusId)
        this.$message.success('状态已更新')
      } finally {
        await this.refreshWorkbench()
      }
    },
    async handleQuickUpdate(item, field) {
      this.cancelQuickEdit()
      try {
        const response = await WorkItemApi.getWorkItem(item.id)
        await WorkItemApi.updateWorkItem({ ...response.data, [field]: item[field] })
        this.$message.success('工作项已更新')
      } finally {
        await this.refreshWorkbench()
      }
    },
    openWorkItem(item) {
      this.$refs.workItemDetailRef.open(item.id)
    },
    openIteration(item) {
      return this.$router.push({ name: 'PmsIterationDetail', params: { id: item.id }})
    },
    async handleProjectChange() {
      this.queryParams.pageNo = 1
      this.queryParams.iterationId = undefined
      await this.refreshWorkbench()
    },
    handleTabChange() {
      this.queryParams.pageNo = 1
      return this.getWorkbenchItemList()
    },
    refreshWorkbench() {
      return Promise.all([this.getCount(), this.getWorkbenchItemList()])
    }
  }
}
</script>

<style scoped>
.filter-card { margin-bottom: 16px; }
.query-form { margin-bottom: -15px; }
.filter-control { width: 240px; }
.button-icon { margin-right: 5px; }
.workbench-tabs { margin-top: -8px; }
.workbench-tabs >>> .el-tabs__header { margin-bottom: 0; }
.tab-label { display: inline-block; padding: 0 6px; }
.quick-date { width: 170px; }
</style>
