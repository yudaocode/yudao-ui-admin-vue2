<template>
  <div class="work-item-list">
    <div class="list-toolbar">
      <div class="toolbar-left">
        <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="query-form">
          <el-form-item>
            <el-input
              v-model="searchKeyword"
              class="search-input"
              clearable
              :placeholder="`请输入${workItemTypeName}标题`"
            />
          </el-form-item>
          <el-form-item>
            <el-popover v-model="showFilterPopover" placement="bottom-start" width="420" trigger="click">
              <el-button slot="reference" icon="el-icon-plus">高级筛选</el-button>
              <div class="advanced-filter">
                <el-form-item class="filter-item" label="数据范围" prop="lifecycleStatus">
                  <el-radio-group v-model="queryParams.lifecycleStatus">
                    <el-radio-button :label="PmsWorkItemLifecycleStatus.ACTIVE">当前</el-radio-button>
                    <el-radio-button :label="PmsWorkItemLifecycleStatus.ARCHIVED">已归档</el-radio-button>
                    <el-radio-button :label="PmsWorkItemLifecycleStatus.RECYCLED">回收站</el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item class="filter-item" label="语义状态" prop="statuses">
                  <el-select v-model="queryParams.statuses" class="full-width" clearable collapse-tags multiple placeholder="全部状态">
                    <el-option
                      v-for="option in getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_STATUS_TYPE)"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
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
                    @loaded="memberOptions = $event"
                  />
                </el-form-item>
                <el-form-item class="filter-item" label="标签" prop="labelIds">
                  <WorkItemLabelSelect v-model="queryParams.labelIds" class="full-width" placeholder="全部标签" />
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
        <el-radio-group v-model="viewMode" @change="getWorkItemList">
          <el-radio-button label="list">列表</el-radio-button>
          <el-radio-button label="board" :disabled="!isActiveLifecycle">看板</el-radio-button>
        </el-radio-group>
      </div>

      <div class="toolbar-actions">
        <el-button
          v-if="editable && isActiveLifecycle"
          v-hasPermi="['pms:pm:work-item:create']"
          type="primary"
          @click="openCreateForm"
        >创建{{ workItemTypeName }}</el-button>
        <el-dropdown trigger="click" @command="handleToolbarCommand">
          <el-button aria-label="更多操作" icon="el-icon-more" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-if="editable && isActiveLifecycle && checkPermi(['pms:pm:work-item:update'])"
              command="status-config"
            >状态设置</el-dropdown-item>
            <el-dropdown-item
              v-if="editable && isActiveLifecycle && checkPermi(['pms:pm:work-item:import'])"
              command="import"
            >导入</el-dropdown-item>
            <el-dropdown-item v-if="checkPermi(['pms:pm:work-item:export'])" command="export">导出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <template v-if="viewMode === 'list'">
      <el-table v-loading="loading" :data="filteredWorkItemList" show-overflow-tooltip>
        <el-table-column :label="`${workItemTypeName}编号`" width="100">
          <template slot-scope="scope">#{{ scope.row.serialNumber }}</template>
        </el-table-column>
        <el-table-column :label="`${workItemTypeName}标题`" min-width="220">
          <template slot-scope="scope">
            <el-button type="text" @click="openDetail(scope.row)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="优先级" width="90">
          <template slot-scope="scope">
            <el-tag :type="getPriorityTagType(scope.row.priority)">{{ getPriorityName(scope.row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="140">
          <template slot-scope="scope">
            <el-select
              v-if="editable && isActiveLifecycle"
              v-model="scope.row.statusId"
              size="small"
              @change="handleStatusChange(scope.row)"
            >
              <el-option v-for="status in statusOptions" :key="status.id" :label="status.name" :value="status.id" />
            </el-select>
            <span v-else>{{ scope.row.statusName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="负责人" min-width="110" prop="assigneeUserName" />
        <el-table-column label="标签" min-width="150">
          <template slot-scope="scope">
            <div class="table-labels">
              <el-tag
                v-for="label in scope.row.labels || []"
                :key="label.id"
                :color="label.color"
                effect="dark"
                size="small"
              >{{ label.name }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="projectType === PmsProjectType.AGILE"
          label="所属迭代"
          min-width="130"
          prop="iterationName"
        />
        <el-table-column align="center" label="进度" width="150">
          <template slot-scope="scope"><el-progress :percentage="scope.row.progress || 0" :stroke-width="8" /></template>
        </el-table-column>
        <el-table-column :formatter="dateFormatter" label="截止时间" prop="endTime" width="180" />
        <el-table-column align="center" fixed="right" label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              v-if="editable && isActiveLifecycle"
              v-hasPermi="['pms:pm:work-item:update']"
              type="text"
              @click="openEditForm(scope.row)"
            >编辑</el-button>
            <el-button v-else type="text" @click="openDetail(scope.row)">查看</el-button>
            <el-button
              v-if="editable && isActiveLifecycle"
              v-hasPermi="['pms:pm:work-item:update']"
              type="text"
              @click="handleArchive(scope.row)"
            >归档</el-button>
            <el-button
              v-if="editable && queryParams.lifecycleStatus !== PmsWorkItemLifecycleStatus.RECYCLED"
              v-hasPermi="['pms:pm:work-item:update']"
              class="danger-button"
              type="text"
              @click="handleRecycle(scope.row)"
            >回收站</el-button>
            <el-button
              v-if="editable && !isActiveLifecycle"
              v-hasPermi="['pms:pm:work-item:update']"
              type="text"
              @click="handleRestore(scope.row)"
            >恢复</el-button>
            <el-button
              v-if="editable && queryParams.lifecycleStatus === PmsWorkItemLifecycleStatus.RECYCLED"
              v-hasPermi="['pms:pm:work-item:delete']"
              class="danger-button"
              type="text"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-if="!normalizedSearchKeyword && total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getWorkItemList"
      />
    </template>

    <div v-else v-loading="loading" class="board-scroll">
      <section v-for="column in filteredBoard" :key="column.name" class="board-column">
        <header class="board-column-header">
          <div>
            <span>{{ column.name }}</span>
            <div v-if="column.statuses.length > 1" class="board-status-names">
              {{ getBoardColumnStatusNames(column) }}
            </div>
          </div>
          <el-tag size="small" type="info">{{ getBoardColumnItemCount(column) }}</el-tag>
        </header>
        <div v-for="statusGroup in column.statusGroups" :key="statusGroup.status.id" class="board-status-group">
          <div v-if="column.statusGroups.length > 1" class="board-status-title">{{ statusGroup.status.name }}</div>
          <draggable
            v-model="statusGroup.items"
            class="board-drop-zone"
            :disabled="boardSaving || !editable"
            group="pms-work-items"
            @add="handleBoardAdd($event, statusGroup)"
            @update="handleBoardSort(statusGroup)"
          >
            <article
              v-for="element in statusGroup.items"
              :key="element.id"
              class="board-card"
              @click="openDetail(element)"
            >
              <div class="board-card-title">{{ element.name }}</div>
              <div v-if="element.endTime" class="board-card-deadline">
                <el-tag :type="isWorkItemOverdue(element) ? 'danger' : 'info'" size="small">
                  {{ formatDate(element.endTime, 'MM月DD日') }}截止
                </el-tag>
              </div>
              <div class="board-card-footer">
                <span class="board-number"><i class="el-icon-tickets" /> #{{ element.serialNumber }}</span>
                <div class="board-card-meta">
                  <span class="priority-copy" :style="{ color: getPriorityColor(element.priority) }">
                    <span class="priority-dot" />{{ getPriorityName(element.priority) }}
                  </span>
                  <el-tag :type="getWorkItemStatusTagType(element.status)" size="small">{{ element.statusName }}</el-tag>
                  <el-tooltip :content="element.assigneeUserName || '未分配'" placement="top">
                    <el-avatar :size="24" :src="getMemberAvatar(element.assigneeUserId)">
                      {{ element.assigneeUserName ? element.assigneeUserName.slice(0, 1) : '未' }}
                    </el-avatar>
                  </el-tooltip>
                </div>
              </div>
            </article>
          </draggable>
        </div>
      </section>
    </div>

    <WorkItemForm ref="formRef" @success="handleDataChanged" />
    <WorkItemDetail ref="detailRef" @success="handleDataChanged" />
    <WorkItemStatusList ref="statusListRef" @success="getWorkItemList" />
    <WorkItemImportForm ref="importFormRef" @success="getWorkItemList" />
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import * as WorkItemApi from '@/api/pms/pm/workitem'
import * as WorkItemStatusApi from '@/api/pms/pm/workitem/status'
import {
  PmsProjectType,
  PmsWorkItemLifecycleStatus,
  PmsWorkItemStatusType
} from '@/views/pms/pm/utils/constants'
import WorkItemDetail from '../detail/WorkItemDetail.vue'
import WorkItemForm from '../form/WorkItemForm.vue'
import WorkItemStatusList from '../status/WorkItemStatusList.vue'
import WorkItemImportForm from '../import/WorkItemImportForm.vue'
import { getAllPageItems } from '@/utils/page'
import {
  getPriorityColor,
  getPriorityName,
  getPriorityTagType,
  getWorkItemStatusTagType,
  getWorkItemTypeName
} from '@/views/pms/pm/utils/format'
import IterationSelect from '@/views/pms/pm/iteration/components/IterationSelect.vue'
import ProjectMemberSelect from '@/views/pms/pm/project/components/ProjectMemberSelect.vue'
import WorkItemLabelSelect from '@/views/pms/pm/workitem/label/WorkItemLabelSelect.vue'

function getDefaultQuery(projectId, type, iterationId, assigneeUserId) {
  return {
    pageNo: 1,
    pageSize: 10,
    projectId,
    type,
    statuses: [],
    priorities: [],
    iterationId,
    iterationIds: [],
    excludedIterationIds: [],
    assigneeUserIds: assigneeUserId ? [Number(assigneeUserId)] : [],
    labelIds: [],
    rootOnly: true,
    lifecycleStatus: PmsWorkItemLifecycleStatus.ACTIVE
  }
}

export default {
  name: 'PmsWorkItemList',
  components: {
    draggable,
    WorkItemDetail,
    WorkItemForm,
    WorkItemStatusList,
    WorkItemImportForm,
    IterationSelect,
    ProjectMemberSelect,
    WorkItemLabelSelect
  },
  props: {
    projectId: { type: Number, required: true },
    projectType: { type: Number, required: true },
    type: { type: Number, required: true },
    editable: { type: Boolean, required: true },
    defaultViewMode: { type: String, default: 'list' },
    iterationId: { type: Number, default: undefined }
  },
  data() {
    return {
      DICT_TYPE,
      PmsProjectType,
      PmsWorkItemLifecycleStatus,
      loading: true,
      boardSaving: false,
      showFilterPopover: false,
      viewMode: this.defaultViewMode || 'list',
      searchKeyword: '',
      total: 0,
      workItemList: [],
      searchableWorkItemList: [],
      board: [],
      statusOptions: [],
      memberOptions: [],
      queryParams: getDefaultQuery(this.projectId, this.type, this.iterationId, this.$route.query.assigneeUserId)
    }
  },
  computed: {
    workItemTypeName() {
      return getWorkItemTypeName(this.type)
    },
    normalizedSearchKeyword() {
      return this.searchKeyword.trim().toLowerCase()
    },
    filteredWorkItemList() {
      return this.normalizedSearchKeyword
        ? this.searchableWorkItemList.filter(item => this.matchSearchKeyword(item))
        : this.workItemList
    },
    filteredBoard() {
      if (!this.normalizedSearchKeyword) return this.board
      return this.board.map(column => ({
        ...column,
        items: column.items.filter(item => this.matchSearchKeyword(item)),
        statusGroups: column.statusGroups.map(statusGroup => ({
          ...statusGroup,
          items: statusGroup.items.filter(item => this.matchSearchKeyword(item))
        }))
      }))
    },
    memberMap() {
      return new Map(this.memberOptions.map(member => [member.userId, member]))
    },
    isActiveLifecycle() {
      return this.queryParams.lifecycleStatus === PmsWorkItemLifecycleStatus.ACTIVE
    },
    hasBoardFilter() {
      return Boolean(
        this.normalizedSearchKeyword ||
        this.queryParams.statuses.length ||
        this.queryParams.priorities.length ||
        this.queryParams.iterationId ||
        this.queryParams.iterationIds.length ||
        this.queryParams.excludedIterationIds.length ||
        this.queryParams.assigneeUserIds.length ||
        this.queryParams.labelIds.length
      )
    }
  },
  watch: {
    projectId(value) {
      this.queryParams.projectId = value
      this.getWorkItemList()
    },
    type(value) {
      this.queryParams.type = value
      this.getWorkItemList()
    },
    iterationId(value) {
      this.queryParams.iterationId = value
      this.getWorkItemList()
    }
  },
  mounted() {
    this.getWorkItemList()
  },
  methods: {
    dateFormatter,
    formatDate,
    checkPermi,
    getIntDictOptions,
    getPriorityColor,
    getPriorityName,
    getPriorityTagType,
    getWorkItemStatusTagType,
    async getWorkItemList() {
      this.loading = true
      try {
        if (this.viewMode === 'board') {
          const boardResponse = await WorkItemApi.getWorkItemBoard(this.queryParams)
          this.board = boardResponse.data.map(column => ({
            ...column,
            statusGroups: column.statuses.map(status => ({
              status,
              items: column.items.filter(item => item.statusId === status.id)
            }))
          }))
        } else {
          const [pageResponse, searchableItems] = await Promise.all([
            WorkItemApi.getWorkItemPage(this.queryParams),
            getAllPageItems((pageNo, pageSize) => WorkItemApi.getWorkItemPage({
              ...this.queryParams,
              pageNo,
              pageSize
            }))
          ])
          this.workItemList = pageResponse.data.list
          this.total = pageResponse.data.total
          this.searchableWorkItemList = searchableItems
        }
        const statusResponse = await WorkItemStatusApi.getWorkItemStatusList(this.projectId, this.type)
        this.statusOptions = statusResponse.data
      } finally {
        this.loading = false
      }
    },
    matchSearchKeyword(workItem) {
      const name = String(workItem.name || '').toLowerCase()
      return name.includes(this.normalizedSearchKeyword) ||
        String(workItem.serialNumber || '').includes(this.normalizedSearchKeyword)
    },
    getBoardColumnStatusNames(column) {
      return column.statuses.map(item => item.name).join(' · ')
    },
    getBoardColumnItemCount(column) {
      return column.statusGroups.reduce((count, group) => count + group.items.length, 0)
    },
    handleAdvancedQuery() {
      this.showFilterPopover = false
      this.queryParams.pageNo = 1
      if (!this.isActiveLifecycle) this.viewMode = 'list'
      return this.getWorkItemList()
    },
    resetQuery() {
      if (this.$refs.queryFormRef) this.$refs.queryFormRef.resetFields()
      this.searchKeyword = ''
      this.showFilterPopover = false
      this.queryParams.pageNo = 1
      return this.getWorkItemList()
    },
    openDetail(workItem) {
      this.$refs.detailRef.open(workItem.id)
    },
    openCreateForm() {
      this.$refs.formRef.open('create', undefined, {
        projectId: this.projectId,
        projectType: this.projectType,
        type: this.type,
        iterationId: this.iterationId
      })
    },
    async handleDataChanged() {
      await this.getWorkItemList()
      this.$emit('changed')
    },
    openEditForm(workItem) {
      this.$refs.formRef.open('update', workItem.id)
    },
    async confirmAction(message, action, successMessage) {
      try {
        await this.$confirm(message, '提示', { type: 'warning' })
        await action()
        this.$message.success(successMessage)
        await this.handleDataChanged()
      } catch (error) {
        // 用户取消操作
      }
    },
    handleArchive(workItem) {
      return this.confirmAction(
        `确认归档${this.workItemTypeName}“${workItem.name}”吗？`,
        () => WorkItemApi.archiveWorkItem(workItem.id),
        '归档成功'
      )
    },
    handleRecycle(workItem) {
      return this.confirmAction(
        `确认将${this.workItemTypeName}“${workItem.name}”移入回收站吗？`,
        () => WorkItemApi.recycleWorkItem(workItem.id),
        '已移入回收站'
      )
    },
    handleRestore(workItem) {
      return this.confirmAction(
        `确认恢复${this.workItemTypeName}“${workItem.name}”吗？`,
        () => WorkItemApi.restoreWorkItem(workItem.id),
        '恢复成功'
      )
    },
    handleDelete(workItem) {
      return this.confirmAction(
        `确认彻底删除${this.workItemTypeName}“${workItem.name}”吗？`,
        () => WorkItemApi.deleteWorkItem(workItem.id),
        '删除成功'
      )
    },
    openStatusConfig() {
      this.$refs.statusListRef.open(this.projectId, this.type)
    },
    handleToolbarCommand(command) {
      if (command === 'status-config') return this.openStatusConfig()
      if (command === 'import') return this.$refs.importFormRef.open(this.projectId, this.type)
      if (command === 'export') return this.handleExport()
    },
    isWorkItemOverdue(workItem) {
      return workItem.status !== PmsWorkItemStatusType.COMPLETED &&
        Boolean(workItem.endTime) && new Date(workItem.endTime).getTime() < Date.now()
    },
    async handleStatusChange(workItem) {
      try {
        await WorkItemApi.updateWorkItemStatus(workItem.id, workItem.statusId)
        this.$message.success('状态已更新')
        await this.handleDataChanged()
      } catch (error) {
        await this.getWorkItemList()
      }
    },
    async handleBoardAdd(event, statusGroup) {
      if (this.boardSaving || event.newIndex === undefined) return
      const statusId = statusGroup.status.id
      const workItem = statusGroup.items[event.newIndex]
      if (!workItem || workItem.statusId === statusId) return
      this.boardSaving = true
      try {
        await WorkItemApi.updateWorkItemStatus(workItem.id, statusId)
        if (!this.hasBoardFilter) {
          await WorkItemApi.updateWorkItemSort(statusId, statusGroup.items.map(item => item.id))
        }
        this.$message.success('状态已更新')
        this.$emit('changed')
      } finally {
        await this.getWorkItemList()
        this.boardSaving = false
      }
    },
    async handleBoardSort(statusGroup) {
      if (this.boardSaving) return
      if (this.hasBoardFilter) {
        await this.getWorkItemList()
        return
      }
      this.boardSaving = true
      try {
        await WorkItemApi.updateWorkItemSort(statusGroup.status.id, statusGroup.items.map(item => item.id))
      } catch (error) {
        await this.getWorkItemList()
      } finally {
        this.boardSaving = false
      }
    },
    async handleExport() {
      const data = await WorkItemApi.exportWorkItemList(this.queryParams)
      this.$download.excel(data, `${this.workItemTypeName}.xlsx`)
    },
    getMemberAvatar(userId) {
      const member = this.memberMap.get(userId || 0)
      return member && member.avatar
    },
    refresh() {
      return this.getWorkItemList()
    }
  }
}
</script>

<style scoped>
.work-item-list {
  --el-text-color-secondary: #909399;
  --el-color-success: #67c23a;
  --el-color-warning: #e6a23c;
  --el-color-danger: #f56c6c;
}
.list-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.toolbar-left, .toolbar-actions, .filter-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.query-form { display: flex; align-items: center; gap: 8px; margin: 0; }
.query-form .el-form-item { margin-right: 0; margin-bottom: 0; }
.search-input { width: 240px; }
.advanced-filter { max-height: 360px; padding-right: 4px; overflow-y: auto; }
.filter-item { display: block; margin-bottom: 12px !important; font-weight: 600; }
.filter-item >>> .el-form-item__label { float: none; line-height: 28px; }
.filter-actions { justify-content: flex-end; margin-top: 12px; }
.filter-actions .el-button, .toolbar-actions .el-button { margin-left: 0; }
.full-width { width: 100%; }
.table-labels { display: flex; flex-wrap: wrap; gap: 6px; }
.danger-button { color: #f56c6c; }
.board-scroll { display: flex; min-height: 460px; gap: 16px; padding-bottom: 12px; overflow-x: auto; }
.board-column { flex: 0 0 300px; padding: 12px; border-radius: 8px; background: #f5f7fa; }
.board-column-header { display: flex; align-items: center; justify-content: space-between; padding: 0 4px 12px; font-weight: 600; }
.board-status-names { margin-top: 4px; font-size: 11px; font-weight: 400; opacity: .7; }
.board-status-group { margin-bottom: 12px; }
.board-status-group:last-child { margin-bottom: 0; }
.board-status-title { margin-bottom: 6px; color: #909399; font-size: 12px; font-weight: 500; }
.board-drop-zone { min-height: 90px; padding: 6px; border: 1px dashed #dcdfe6; border-radius: 4px; }
.board-card { margin-bottom: 10px; padding: 12px; border: 1px solid #ebeef5; border-radius: 6px; background: #fff; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .04); cursor: pointer; }
.board-card:last-child { margin-bottom: 0; }
.board-card-title { display: -webkit-box; overflow: hidden; font-size: 14px; font-weight: 500; line-height: 21px; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.board-card-deadline { margin-top: 8px; }
.board-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 12px; }
.board-number { display: flex; align-items: center; gap: 4px; color: #909399; font-size: 12px; }
.board-card-meta { display: flex; min-width: 0; align-items: center; gap: 8px; }
.priority-copy { display: flex; align-items: center; gap: 4px; font-size: 12px; white-space: nowrap; }
.priority-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
</style>
