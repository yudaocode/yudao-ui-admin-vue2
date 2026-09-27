<template>
  <div
    v-loading="loading"
    class="planning-board"
  >
    <div class="planning-toolbar">
      <el-input
        v-model="searchKeyword"
        clearable
        placeholder="搜索事项"
        style="width: 240px"
        @clear="getPlanningData"
        @keyup.enter.native="getPlanningData"
      />
      <el-select
        v-model="layoutMode"
        style="width: 130px"
      >
        <el-option
          label="双栏展示"
          value="double"
        />
        <el-option
          label="单栏展示"
          value="single"
        />
      </el-select>
    </div>

    <div
      class="planning-grid"
      :class="{ 'single-column': layoutMode === 'single' }"
    >
      <el-card shadow="never">
        <div
          slot="header"
          class="card-header"
        >
          <span>Backlog 共 {{ unplannedWorkItems.length }} 个事项</span>
        </div>
        <draggable
          v-model="unplannedWorkItems"
          class="planning-list backlog-list"
          :disabled="planningDisabled"
          group="pms-planning"
          @add="handleUnplanDrop"
          @end="handlePlanningSort(undefined, unplannedWorkItems, $event)"
          @start="handlePlanningDragStart"
        >
          <article
            v-for="element in unplannedWorkItems"
            :key="element.id"
            :data-work-item-id="element.id"
            class="planning-item"
          >
            <el-button
              class="item-name"
              type="text"
              @click.stop="openWorkItem(element)"
            >
              #{{ element.serialNumber }} {{ element.name }}
            </el-button>
            <div class="item-meta">
              <span
                class="priority"
                :style="{ color: getPriorityColor(element.priority) }"
              >
                <span class="priority-dot" />{{ getPriorityName(element.priority) }}
              </span>
              <el-tag
                :type="getWorkItemStatusTagType(element.status)"
                size="small"
              >
                {{ element.statusName }}
              </el-tag>
              <el-avatar :size="24">{{ getAssigneeInitial(element) }}</el-avatar>
              <el-dropdown
                v-if="editable"
                trigger="click"
                @command="handleWorkItemCommand($event, element)"
              >
                <el-button
                  aria-label="事项操作"
                  icon="el-icon-more"
                  type="text"
                  @click.stop
                />
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="edit">编辑事项</el-dropdown-item>
                  <el-dropdown-item
                    command="recycle"
                    divided
                  >移入回收站</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </article>
        </draggable>
        <el-button
          v-if="editable && !backlogCreating"
          class="create-link"
          icon="el-icon-plus"
          type="text"
          @click="backlogCreating = true"
        >
          新建事项
        </el-button>
        <div
          v-if="editable && backlogCreating"
          class="quick-create"
          @click.stop
        >
          <el-select
            v-model="backlogDraft.type"
            style="width: 110px"
          >
            <el-option
              v-for="option in getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_TYPE)"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-input
            v-model="backlogDraft.name"
            maxlength="100"
            placeholder="快速创建待规划事项"
            @keyup.enter.native="createQuickWorkItem(backlogDraft)"
          />
          <el-button
            v-hasPermi="['pms:pm:work-item:create']"
            :loading="creatingKey === 'backlog'"
            type="primary"
            @click="createQuickWorkItem(backlogDraft)"
          >
            创建
          </el-button>
          <el-button @click="backlogCreating = false">取消</el-button>
        </div>
      </el-card>

      <div class="iteration-column">
        <el-empty
          v-if="iterationList.length === 0"
          description="暂无可规划迭代"
        />
        <el-card
          v-for="iteration in iterationList"
          :key="iteration.id"
          class="iteration-card"
          shadow="never"
        >
          <div
            slot="header"
            class="iteration-header"
            @click="toggleIteration(iteration)"
            @dragover.prevent
            @drop.prevent="handleCollapsedIterationDrop(iteration)"
          >
            <div class="iteration-heading">
              <i :class="iteration.expanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right'" />
              <span class="iteration-name">{{ iteration.name }}</span>
              <span class="secondary-text">共 {{ iteration.list.length }} 个事项</span>
              <el-dropdown
                v-if="editable"
                trigger="click"
                @command="handleIterationCommand($event, iteration)"
              >
                <el-button
                  aria-label="迭代操作"
                  icon="el-icon-more"
                  type="text"
                  @click.stop
                />
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-if="iteration.status === PmsIterationStatus.PLANNED"
                    v-hasPermi="['pms:pm:iteration:update']"
                    command="start"
                  >
                    开始迭代
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="iteration.status === PmsIterationStatus.ACTIVE"
                    v-hasPermi="['pms:pm:iteration:update']"
                    command="complete"
                  >
                    完成迭代
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-hasPermi="['pms:pm:iteration:update']"
                    command="edit"
                  >
                    编辑迭代
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-hasPermi="['pms:pm:iteration:delete']"
                    command="delete"
                    divided
                  >
                    删除迭代
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div class="iteration-status">
              <span class="secondary-text">
                {{ formatDate(iteration.startTime, 'YYYY-MM-DD') || '--' }} 至
                {{ formatDate(iteration.endTime, 'YYYY-MM-DD') || '--' }}
              </span>
              <el-tag :type="getIterationStatusTagType(iteration.status)">
                {{ getIterationStatusName(iteration.status) }}
              </el-tag>
            </div>
          </div>

          <draggable
            v-show="iteration.expanded"
            v-model="iteration.list"
            class="planning-list iteration-planning-list"
            :disabled="planningDisabled"
            group="pms-planning"
            @add="handlePlanDrop(iteration, $event)"
            @end="handlePlanningSort(iteration.id, iteration.list, $event)"
            @start="handlePlanningDragStart"
          >
            <article
              v-for="element in iteration.list"
              :key="element.id"
              :data-work-item-id="element.id"
              class="planning-item"
            >
              <el-button
                class="item-name"
                type="text"
                @click.stop="openWorkItem(element)"
              >
                #{{ element.serialNumber }} {{ element.name }}
              </el-button>
              <div class="item-meta">
                <span
                  class="priority"
                  :style="{ color: getPriorityColor(element.priority) }"
                >
                  <span class="priority-dot" />{{ getPriorityName(element.priority) }}
                </span>
                <el-tag
                  :type="getWorkItemStatusTagType(element.status)"
                  size="small"
                >
                  {{ element.statusName }}
                </el-tag>
                <el-avatar :size="24">{{ getAssigneeInitial(element) }}</el-avatar>
                <el-dropdown
                  v-if="editable"
                  trigger="click"
                  @command="handleWorkItemCommand($event, element)"
                >
                  <el-button
                    aria-label="事项操作"
                    icon="el-icon-more"
                    type="text"
                    @click.stop
                  />
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="edit">编辑事项</el-dropdown-item>
                    <el-dropdown-item
                      command="recycle"
                      divided
                    >移入回收站</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </article>
          </draggable>
          <el-button
            v-if="editable && iteration.expanded && creatingIterationId !== iteration.id"
            class="create-link"
            icon="el-icon-plus"
            type="text"
            @click="creatingIterationId = iteration.id"
          >
            新建事项
          </el-button>
          <div
            v-if="editable && iteration.expanded && creatingIterationId === iteration.id"
            class="quick-create"
            @click.stop
          >
            <el-select
              v-model="iterationDrafts[iteration.id].type"
              style="width: 110px"
            >
              <el-option
                v-for="option in getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_TYPE)"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-input
              v-model="iterationDrafts[iteration.id].name"
              maxlength="100"
              :placeholder="`在“${iteration.name}”中快速创建事项`"
              @keyup.enter.native="createQuickWorkItem(iterationDrafts[iteration.id], iteration.id)"
            />
            <el-button
              v-hasPermi="['pms:pm:work-item:create']"
              :loading="creatingKey === `iteration-${iteration.id}`"
              type="primary"
              @click="createQuickWorkItem(iterationDrafts[iteration.id], iteration.id)"
            >
              创建
            </el-button>
            <el-button @click="creatingIterationId = undefined">取消</el-button>
          </div>
        </el-card>

        <el-button
          v-if="editable && !iterationCreating"
          class="new-iteration-button"
          icon="el-icon-plus"
          type="text"
          @click="iterationCreating = true"
        >
          新建迭代
        </el-button>
        <el-card
          v-if="editable && iterationCreating"
          shadow="never"
        >
          <div class="quick-create quick-iteration">
            <el-input
              v-model="quickIterationName"
              maxlength="100"
              placeholder="快速创建迭代"
              @keyup.enter.native="createQuickIteration"
            />
            <el-button
              v-hasPermi="['pms:pm:iteration:create']"
              :loading="creatingKey === 'iteration'"
              type="primary"
              @click="createQuickIteration"
            >
              创建迭代
            </el-button>
            <el-button @click="iterationCreating = false">取消</el-button>
          </div>
        </el-card>
      </div>
    </div>

    <WorkItemForm
      ref="workItemFormRef"
      @success="getPlanningData"
    />
    <WorkItemDetail
      ref="workItemDetailRef"
      @success="getPlanningData"
    />
    <IterationForm
      ref="iterationFormRef"
      @success="getPlanningData"
    />
    <IterationStartForm
      ref="iterationStartFormRef"
      @success="getPlanningData"
    />
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as IterationApi from '@/api/pms/pm/iteration'
import * as WorkItemApi from '@/api/pms/pm/workitem'
import { formatDate } from '@/utils/formatTime'
import {
  PmsIterationStatus,
  PmsWorkItemDefectType,
  PmsWorkItemPriority,
  PmsWorkItemType
} from '@/views/pms/pm/utils/constants'
import { getAllPageItems } from '@/utils/page'
import WorkItemDetail from '@/views/pms/pm/workitem/detail/WorkItemDetail.vue'
import WorkItemForm from '@/views/pms/pm/workitem/form/WorkItemForm.vue'
import IterationForm from '@/views/pms/pm/iteration/components/IterationForm.vue'
import IterationStartForm from '@/views/pms/pm/iteration/components/IterationStartForm.vue'
import {
  getIterationStatusName,
  getIterationStatusTagType,
  getPriorityColor,
  getPriorityName,
  getWorkItemStatusTagType
} from '@/views/pms/pm/utils/format'

export default {
  name: 'PmsPlanningBoard',
  components: {
    draggable,
    IterationForm,
    IterationStartForm,
    WorkItemDetail,
    WorkItemForm
  },
  props: {
    projectId: { type: Number, required: true },
    projectType: { type: Number, required: true },
    editable: { type: Boolean, required: true }
  },
  data() {
    return {
      DICT_TYPE,
      PmsIterationStatus,
      loading: true,
      saving: false,
      creatingKey: '',
      searchKeyword: '',
      layoutMode: 'double',
      backlogCreating: false,
      creatingIterationId: undefined,
      iterationCreating: false,
      expandedIterationIds: [],
      iterationList: [],
      unplannedWorkItems: [],
      backlogDraft: { name: '', type: PmsWorkItemType.TASK },
      iterationDrafts: {},
      quickIterationName: '',
      draggedWorkItemId: undefined
    }
  },
  computed: {
    planningDisabled() {
      return !this.editable || this.saving || Boolean(this.searchKeyword.trim())
    }
  },
  mounted() {
    this.getPlanningData()
  },
  methods: {
    formatDate,
    getIntDictOptions,
    getIterationStatusName,
    getIterationStatusTagType,
    getPriorityColor,
    getPriorityName,
    getWorkItemStatusTagType,
    getAssigneeInitial(workItem) {
      return workItem.assigneeUserName ? workItem.assigneeUserName.slice(0, 1) : '未'
    },
    async getPlanningData() {
      this.loading = true
      try {
        const [plannedIterations, activeIterations, fetchedUnplannedWorkItems] =
          await Promise.all([
            this.getIterationList(PmsIterationStatus.PLANNED),
            this.getIterationList(PmsIterationStatus.ACTIVE),
            this.getWorkItemList({
              projectId: this.projectId,
              unplannedOnly: true,
              name: this.searchKeyword.trim() || undefined
            })
          ])
        const projectIterations = [...activeIterations, ...plannedIterations]
        this.iterationList = await Promise.all(projectIterations.map(async iteration => {
          const iterationId = iteration.id
          if (!this.iterationDrafts[iterationId]) {
            this.$set(this.iterationDrafts, iterationId, {
              name: '',
              type: PmsWorkItemType.TASK
            })
          }
          return {
            ...iteration,
            id: iterationId,
            status: iteration.status,
            expanded: this.expandedIterationIds.includes(iterationId),
            list: await this.getWorkItemList({
              projectId: this.projectId,
              iterationId,
              name: this.searchKeyword.trim() || undefined
            })
          }
        }))
        this.unplannedWorkItems = fetchedUnplannedWorkItems
      } finally {
        this.loading = false
      }
    },
    getIterationList(status) {
      return getAllPageItems((pageNo, pageSize) => IterationApi.getIterationPage({
        pageNo,
        pageSize,
        projectId: this.projectId,
        status
      }))
    },
    getWorkItemList(params) {
      return getAllPageItems((pageNo, pageSize) => WorkItemApi.getWorkItemPage({
        ...params,
        planningOnly: true,
        pageNo,
        pageSize
      }))
    },
    toggleIteration(iteration) {
      iteration.expanded = !iteration.expanded
      const index = this.expandedIterationIds.indexOf(iteration.id)
      if (iteration.expanded && index < 0) this.expandedIterationIds.push(iteration.id)
      else if (!iteration.expanded && index >= 0) this.expandedIterationIds.splice(index, 1)
    },
    handleWorkItemCommand(command, workItem) {
      if (command === 'edit') {
        this.$refs.workItemFormRef.open('update', workItem.id)
      } else if (command === 'recycle') {
        this.handleRecycleWorkItem(workItem)
      }
    },
    async handleRecycleWorkItem(workItem) {
      try {
        await this.$confirm(`确认将事项“${workItem.name}”移入回收站吗？`, '提示', {
          type: 'warning'
        })
        await WorkItemApi.recycleWorkItem(workItem.id)
        this.$message.success('已移入回收站')
        await this.getPlanningData()
      } catch (error) {
        // 用户取消时不改变规划数据。
      }
    },
    handleIterationCommand(command, iteration) {
      if (command === 'start') {
        this.$refs.iterationStartFormRef.open(iteration)
      } else if (command === 'complete') {
        this.handleCompleteIteration(iteration)
      } else if (command === 'edit') {
        this.$refs.iterationFormRef.open('update', this.projectId, iteration.id)
      } else if (command === 'delete') {
        this.handleDeleteIteration(iteration)
      }
    },
    async handleCompleteIteration(iteration) {
      try {
        await this.$confirm(`确认完成迭代“${iteration.name}”吗？`, '提示', {
          type: 'warning'
        })
        await IterationApi.completeIteration(iteration.id)
        this.removeExpandedIteration(iteration.id)
        this.$message.success('迭代已完成')
        await this.getPlanningData()
      } catch (error) {
        // 用户取消时不改变规划数据。
      }
    },
    async handleDeleteIteration(iteration) {
      try {
        await this.$confirm(`确认删除迭代“${iteration.name}”吗？`, '提示', {
          type: 'warning'
        })
        await IterationApi.deleteIteration(iteration.id)
        this.removeExpandedIteration(iteration.id)
        this.$message.success('删除成功')
        await this.getPlanningData()
      } catch (error) {
        // 用户取消时不改变规划数据。
      }
    },
    removeExpandedIteration(iterationId) {
      const index = this.expandedIterationIds.indexOf(iterationId)
      if (index >= 0) this.expandedIterationIds.splice(index, 1)
    },
    handlePlanningDragStart(event) {
      const workItemId = event.item && event.item.dataset.workItemId
      this.draggedWorkItemId = workItemId ? Number(workItemId) : undefined
    },
    async handleCollapsedIterationDrop(iteration) {
      const workItemId = this.draggedWorkItemId
      if (
        iteration.expanded ||
        !workItemId ||
        iteration.list.some(item => item.id === workItemId)
      ) return
      this.saving = true
      try {
        await WorkItemApi.updateWorkItemIteration(workItemId, iteration.id)
        await WorkItemApi.updateWorkItemPlanningSort(this.projectId, iteration.id, [
          ...iteration.list.map(item => item.id),
          workItemId
        ])
        this.$message.success(`已规划到“${iteration.name}”`)
        await this.getPlanningData()
      } catch (error) {
        await this.getPlanningData()
      } finally {
        this.saving = false
        this.draggedWorkItemId = undefined
      }
    },
    openWorkItem(workItem) {
      this.$refs.workItemDetailRef.open(workItem.id)
    },
    async handlePlanDrop(iteration, event) {
      const workItem = iteration.list[event.newIndex]
      if (!workItem) return
      this.saving = true
      try {
        await WorkItemApi.updateWorkItemIteration(workItem.id, iteration.id)
        await WorkItemApi.updateWorkItemPlanningSort(
          this.projectId,
          iteration.id,
          iteration.list.map(item => item.id)
        )
        this.$message.success(`已规划到“${iteration.name}”`)
      } catch (error) {
        await this.getPlanningData()
      } finally {
        this.saving = false
      }
    },
    async handleUnplanDrop(event) {
      const workItem = this.unplannedWorkItems[event.newIndex]
      if (!workItem) return
      this.saving = true
      try {
        await WorkItemApi.updateWorkItemIteration(workItem.id)
        await WorkItemApi.updateWorkItemPlanningSort(
          this.projectId,
          undefined,
          this.unplannedWorkItems.map(item => item.id)
        )
        this.$message.success('已移回待规划')
      } catch (error) {
        await this.getPlanningData()
      } finally {
        this.saving = false
      }
    },
    async handlePlanningSort(iterationId, list, event) {
      if (event.from !== event.to || event.oldIndex === event.newIndex || this.saving) return
      this.saving = true
      try {
        await WorkItemApi.updateWorkItemPlanningSort(
          this.projectId,
          iterationId,
          list.map(item => item.id)
        )
        this.$message.success('排序已保存')
      } catch (error) {
        await this.getPlanningData()
      } finally {
        this.saving = false
      }
    },
    async createQuickWorkItem(draft, iterationId) {
      const name = draft.name.trim()
      if (!name) {
        this.$message.warning('请输入事项标题')
        return
      }
      this.creatingKey = iterationId ? `iteration-${iterationId}` : 'backlog'
      try {
        await WorkItemApi.createWorkItem({
          projectId: this.projectId,
          type: draft.type,
          name,
          priority: PmsWorkItemPriority.MEDIUM,
          memberUserIds: [],
          defectType: draft.type === PmsWorkItemType.DEFECT
            ? PmsWorkItemDefectType.FUNCTION
            : undefined,
          iterationId,
          fileUrls: [],
          labelIds: []
        })
        draft.name = ''
        this.backlogCreating = false
        this.creatingIterationId = undefined
        this.$message.success('事项创建成功')
        await this.getPlanningData()
      } finally {
        this.creatingKey = ''
      }
    },
    async createQuickIteration() {
      const name = this.quickIterationName.trim()
      if (!name) {
        this.$message.warning('请输入迭代名称')
        return
      }
      this.creatingKey = 'iteration'
      try {
        await IterationApi.createIteration({ projectId: this.projectId, name })
        this.quickIterationName = ''
        this.iterationCreating = false
        this.$message.success('迭代创建成功')
        await this.getPlanningData()
      } finally {
        this.creatingKey = ''
      }
    },
    refresh() {
      return this.getPlanningData()
    }
  }
}
</script>

<style scoped>
.planning-toolbar,
.card-header,
.planning-item,
.item-meta,
.iteration-header,
.iteration-heading,
.iteration-status,
.quick-create {
  display: flex;
  align-items: center;
}
.planning-toolbar { justify-content: space-between; margin-bottom: 16px; gap: 12px; }
.planning-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.planning-grid.single-column { grid-template-columns: 1fr; }
.card-header { justify-content: space-between; font-weight: 600; }
.planning-list { min-height: 72px; padding: 4px; }
.backlog-list { min-height: 420px; }
.planning-item {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fff;
  cursor: move;
}
.planning-item:hover { border-color: #a0cfff; }
.item-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-meta { flex-shrink: 0; gap: 10px; }
.priority { display: flex; align-items: center; gap: 4px; font-size: 12px; }
.priority-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.create-link { margin-top: 8px; }
.quick-create { gap: 8px; padding-top: 12px; border-top: 1px solid #ebeef5; }
.iteration-column { display: flex; flex-direction: column; gap: 12px; }
.iteration-header { justify-content: space-between; gap: 16px; cursor: pointer; }
.iteration-heading { min-width: 0; gap: 8px; }
.iteration-name { overflow: hidden; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.secondary-text { flex-shrink: 0; color: #909399; font-size: 12px; }
.iteration-status { flex-shrink: 0; gap: 12px; }
.new-iteration-button { align-self: flex-start; }
.quick-iteration { padding-top: 0; border-top: 0; }
@media (max-width: 1200px) {
  .planning-grid { grid-template-columns: 1fr; }
}
</style>
