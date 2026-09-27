<template>
  <div class="work-item-all-list">
    <div class="list-toolbar">
      <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="query-form">
        <el-form-item prop="name">
          <el-input
            v-model="queryParams.name"
            class="search-input"
            clearable
            placeholder="搜索事项"
            @clear="handleQuery"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-popover v-model="showFilterPopover" placement="bottom-start" width="420" trigger="click">
            <el-button slot="reference" icon="el-icon-plus">高级筛选</el-button>
            <div class="advanced-filter">
              <el-form-item class="filter-item" label="事项类型" prop="types">
                <el-select
                  v-model="queryParams.types"
                  class="full-width"
                  clearable
                  collapse-tags
                  multiple
                  placeholder="全部类型"
                >
                  <el-option v-if="projectType === PmsProjectType.AGILE" label="需求" :value="PmsWorkItemType.REQUIREMENT" />
                  <el-option label="任务" :value="PmsWorkItemType.TASK" />
                  <el-option v-if="projectType === PmsProjectType.AGILE" label="缺陷" :value="PmsWorkItemType.DEFECT" />
                </el-select>
              </el-form-item>
              <el-form-item class="filter-item" label="状态" prop="statuses">
                <el-select v-model="queryParams.statuses" class="full-width" clearable collapse-tags multiple placeholder="全部状态">
                  <el-option label="未开始" :value="PmsWorkItemStatusType.PENDING" />
                  <el-option label="进行中" :value="PmsWorkItemStatusType.PROCESSING" />
                  <el-option label="已完成" :value="PmsWorkItemStatusType.COMPLETED" />
                </el-select>
              </el-form-item>
              <el-form-item class="filter-item" label="优先级" prop="priorities">
                <el-select v-model="queryParams.priorities" class="full-width" clearable collapse-tags multiple placeholder="全部优先级">
                  <el-option
                    v-for="option in getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_PRIORITY)"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="projectType === PmsProjectType.AGILE && !iterationId"
                class="filter-item"
                label="所属迭代"
                prop="iterationIds"
              >
                <IterationSelect
                  v-model="queryParams.iterationIds"
                  class="full-width"
                  multiple
                  :project-id="projectId"
                  placeholder="全部迭代"
                />
              </el-form-item>
              <el-form-item
                v-if="projectType === PmsProjectType.AGILE && !iterationId"
                class="filter-item"
                label="排除迭代"
                prop="excludedIterationIds"
              >
                <IterationSelect
                  v-model="queryParams.excludedIterationIds"
                  class="full-width"
                  multiple
                  :project-id="projectId"
                  placeholder="不显示所选迭代"
                />
              </el-form-item>
              <el-form-item class="filter-item" label="负责人" prop="assigneeUserIds">
                <ProjectMemberSelect
                  v-model="queryParams.assigneeUserIds"
                  class="full-width"
                  multiple
                  :project-id="projectId"
                  placeholder="全部负责人"
                />
              </el-form-item>
              <el-form-item class="filter-item" label="标签" prop="labelIds">
                <WorkItemLabelSelect v-model="queryParams.labelIds" class="full-width" placeholder="全部标签" />
              </el-form-item>
              <el-form-item v-if="!iterationId" prop="unplannedOnly">
                <el-checkbox v-model="queryParams.unplannedOnly">只显示未规划事项</el-checkbox>
              </el-form-item>
            </div>
            <div class="filter-actions">
              <el-button @click="resetQuery">清空</el-button>
              <el-button @click="showFilterPopover = false">取消</el-button>
              <el-button type="primary" @click="handleAdvancedQuery">确认</el-button>
            </div>
          </el-popover>
        </el-form-item>
      </el-form>
      <div class="toolbar-actions">
        <el-dropdown v-if="editable" v-hasPermi="['pms:pm:work-item:create']" @command="openCreateForm">
          <el-button type="primary">新建<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="PmsWorkItemType.REQUIREMENT">新建需求</el-dropdown-item>
            <el-dropdown-item :command="PmsWorkItemType.TASK">新建任务</el-dropdown-item>
            <el-dropdown-item :command="PmsWorkItemType.DEFECT">新建缺陷</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-hasPermi="['pms:pm:work-item:export']" @click="handleExport">导出</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="workItemList" show-overflow-tooltip>
      <el-table-column label="编号" width="90">
        <template slot-scope="scope">#{{ scope.row.serialNumber }}</template>
      </el-table-column>
      <el-table-column label="类型" width="80">
        <template slot-scope="scope">{{ getWorkItemTypeName(scope.row.type) }}</template>
      </el-table-column>
      <el-table-column label="标题" min-width="240">
        <template slot-scope="scope">
          <el-button type="text" @click="openDetail(scope.row)">{{ scope.row.name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="statusName" width="120" />
      <el-table-column label="优先级" width="90">
        <template slot-scope="scope">{{ getPriorityName(scope.row.priority) }}</template>
      </el-table-column>
      <el-table-column label="负责人" prop="assigneeUserName" width="110" />
      <el-table-column label="所属迭代" prop="iterationName" min-width="130" />
      <el-table-column align="center" label="进度" width="140">
        <template slot-scope="scope"><el-progress :percentage="scope.row.progress || 0" /></template>
      </el-table-column>
      <el-table-column :formatter="dateFormatter" label="截止时间" prop="endTime" width="180" />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getWorkItemList"
    />
    <WorkItemForm ref="formRef" @success="handleDataChanged" />
    <WorkItemDetail ref="detailRef" @success="handleDataChanged" />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as WorkItemApi from '@/api/pms/pm/workitem'
import {
  PmsProjectType,
  PmsWorkItemLifecycleStatus,
  PmsWorkItemStatusType,
  PmsWorkItemType
} from '@/views/pms/pm/utils/constants'
import WorkItemDetail from '../detail/WorkItemDetail.vue'
import WorkItemForm from '../form/WorkItemForm.vue'
import IterationSelect from '@/views/pms/pm/iteration/components/IterationSelect.vue'
import ProjectMemberSelect from '@/views/pms/pm/project/components/ProjectMemberSelect.vue'
import WorkItemLabelSelect from '@/views/pms/pm/workitem/label/WorkItemLabelSelect.vue'
import { getPriorityName, getWorkItemTypeName } from '@/views/pms/pm/utils/format'

function getDefaultQuery(projectId, iterationId, assigneeUserId) {
  return {
    pageNo: 1,
    pageSize: 10,
    projectId,
    types: [],
    name: undefined,
    statuses: [],
    priorities: [],
    iterationId,
    iterationIds: [],
    excludedIterationIds: [],
    assigneeUserIds: assigneeUserId ? [Number(assigneeUserId)] : [],
    labelIds: [],
    unplannedOnly: false,
    rootOnly: true,
    lifecycleStatus: PmsWorkItemLifecycleStatus.ACTIVE
  }
}

export default {
  name: 'PmsWorkItemAllList',
  components: { WorkItemDetail, WorkItemForm, IterationSelect, ProjectMemberSelect, WorkItemLabelSelect },
  props: {
    projectId: { type: Number, required: true },
    projectType: { type: Number, required: true },
    editable: { type: Boolean, required: true },
    iterationId: { type: Number, default: undefined }
  },
  data() {
    return {
      DICT_TYPE,
      PmsProjectType,
      PmsWorkItemStatusType,
      PmsWorkItemType,
      loading: false,
      workItemList: [],
      total: 0,
      showFilterPopover: false,
      queryParams: getDefaultQuery(this.projectId, this.iterationId, this.$route.query.assigneeUserId)
    }
  },
  watch: {
    projectId(value) {
      this.queryParams.projectId = value
      this.handleQuery()
    },
    iterationId(value) {
      this.queryParams.iterationId = value
      this.handleQuery()
    }
  },
  mounted() {
    this.getWorkItemList()
  },
  methods: {
    dateFormatter,
    getIntDictOptions,
    getPriorityName,
    getWorkItemTypeName,
    async getWorkItemList() {
      this.loading = true
      try {
        const response = await WorkItemApi.getWorkItemPage(this.queryParams)
        this.workItemList = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getWorkItemList()
    },
    handleAdvancedQuery() {
      this.showFilterPopover = false
      return this.handleQuery()
    },
    resetQuery() {
      if (this.$refs.queryFormRef) this.$refs.queryFormRef.resetFields()
      this.showFilterPopover = false
      return this.handleQuery()
    },
    openDetail(workItem) {
      this.$refs.detailRef.open(workItem.id)
    },
    openCreateForm(type) {
      this.$refs.formRef.open('create', undefined, {
        projectId: this.projectId,
        projectType: this.projectType,
        type,
        iterationId: this.iterationId
      })
    },
    async handleDataChanged() {
      await this.getWorkItemList()
      this.$emit('changed')
    },
    async handleExport() {
      const data = await WorkItemApi.exportWorkItemList(this.queryParams)
      this.$download.excel(data, '全部事项.xlsx')
    },
    refresh() {
      return this.getWorkItemList()
    }
  }
}
</script>

<style scoped>
.list-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.query-form { margin-bottom: -15px; }
.search-input { width: 240px; }
.toolbar-actions, .filter-actions { display: flex; align-items: center; gap: 12px; }
.toolbar-actions .el-button, .filter-actions .el-button { margin-left: 0; }
.advanced-filter { max-height: 360px; padding-right: 4px; overflow-y: auto; }
.filter-item { display: block; margin-right: 0; font-weight: 600; }
.filter-item >>> .el-form-item__label { float: none; line-height: 28px; }
.full-width { width: 100%; }
.filter-actions { justify-content: flex-end; margin-top: 12px; }
</style>
