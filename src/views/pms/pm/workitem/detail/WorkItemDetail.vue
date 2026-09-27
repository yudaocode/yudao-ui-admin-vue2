<template>
  <div>
    <el-drawer
      :visible.sync="drawerVisible"
      append-to-body
      custom-class="pms-work-item-detail-drawer"
      destroy-on-close
      size="76%"
      :with-header="false"
    >
      <div v-loading="loading" class="detail-shell">
        <header class="detail-header">
          <div class="detail-title-area">
            <div class="detail-created">创建于 {{ formatDate(workItem && workItem.createTime) }}</div>
            <div class="detail-title-line">
              <i class="el-icon-tickets title-icon" />
              <h2>#{{ workItem && workItem.serialNumber }} {{ workItem && workItem.name }}</h2>
            </div>
            <div class="detail-badges">
              <el-tag
                v-for="label in workItemLabels"
                :key="label.id"
                :color="label.color"
                effect="dark"
                size="small"
              >{{ label.name }}</el-tag>
              <el-tooltip
                v-for="name in workItemMemberNames"
                :key="name"
                :content="name"
                placement="top"
              >
                <el-avatar :size="26">{{ name.slice(0, 1) }}</el-avatar>
              </el-tooltip>
            </div>
          </div>
          <div class="detail-actions">
            <el-dropdown v-if="editable" trigger="click" @command="handleMoreCommand">
              <el-button aria-label="更多操作" icon="el-icon-more" />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item v-if="canUpdate" command="archive">归档</el-dropdown-item>
                <el-dropdown-item v-if="canUpdate" command="recycle" divided>移入回收站</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button aria-label="关闭" circle icon="el-icon-close" @click="drawerVisible = false" />
          </div>
        </header>

        <div class="detail-grid">
          <main class="detail-main">
            <section class="detail-section">
              <div v-if="editable" class="description-actions">
                <el-button type="text" icon="el-icon-edit" @click="openEditForm">编辑描述</el-button>
                <el-button type="text" icon="el-icon-paperclip" @click="openEditForm">上传附件</el-button>
              </div>
              <h3>{{ workItemTypeName }}描述</h3>
              <div
                v-if="workItem && workItem.description"
                v-dompurify-html="workItem.description"
                class="description-html"
              />
              <div v-else class="empty-copy">暂无描述</div>
            </section>

            <section v-if="workItemFileUrls.length" class="detail-section">
              <h3>附件</h3>
              <div class="file-list">
                <el-link
                  v-for="fileUrl in workItemFileUrls"
                  :key="fileUrl"
                  class="file-link"
                  :href="fileUrl"
                  target="_blank"
                  type="primary"
                >
                  <i class="el-icon-paperclip" /> {{ getFileNameFromUrl(fileUrl) }}
                </el-link>
              </div>
            </section>

            <section v-if="workItem && workItem.id">
              <h3>活动日志</h3>
              <el-tabs v-model="activeTab">
                <el-tab-pane label="评论" name="comment">
                  <WorkItemComment
                    :editable="editable"
                    :show-title="false"
                    :work-item-id="workItem.id"
                    @changed="handleCommentChanged"
                  />
                </el-tab-pane>
                <el-tab-pane label="活动" name="activity">
                  <WorkItemActivity
                    ref="workItemActivityRef"
                    :show-title="false"
                    :work-item-id="workItem.id"
                  />
                </el-tab-pane>
                <el-tab-pane label="子工作项" name="subtask">
                  <WorkItemSubtaskList
                    :editable="editable"
                    :parent-work-item="workItem"
                    :show-title="false"
                    @changed="handleExtensionChanged"
                  />
                </el-tab-pane>
                <el-tab-pane label="工时记录" name="worklog">
                  <WorkItemWorkLogList
                    :editable="editable"
                    :show-title="false"
                    :work-item-id="workItem.id"
                    @changed="handleExtensionChanged"
                  />
                </el-tab-pane>
              </el-tabs>
            </section>
          </main>

          <aside class="detail-aside">
            <el-collapse v-model="expandedPanels">
              <el-collapse-item name="basic" title="基础信息">
                <div class="property-list">
                  <div class="property-row">
                    <span>状态</span>
                    <WorkItemStatusSelect
                      v-if="workItem && canUpdate && isInlineEditing('statusId')"
                      v-model="workItem.statusId"
                      class="property-control"
                      :project-id="workItem.projectId"
                      :work-item-type="workItem.type"
                      @change="handleQuickStatusChange"
                      @blur="cancelInlineEditing"
                      @keyup.esc.stop="cancelInlineEditing"
                    />
                    <el-button
                      v-else-if="workItem && canUpdate"
                      class="property-button"
                      type="text"
                      @click="startInlineEditing('statusId')"
                    >{{ workItem.statusName }}</el-button>
                    <el-tag v-else :type="getWorkItemStatusTagType(workItem && workItem.status)">
                      {{ workItem && workItem.statusName }}
                    </el-tag>
                  </div>
                  <div class="property-row">
                    <span>负责人</span>
                    <ProjectMemberSelect
                      v-if="workItem && canUpdate && isInlineEditing('assigneeUserId')"
                      v-model="workItem.assigneeUserId"
                      class="property-control"
                      :project-id="workItem.projectId"
                      @update:modelValue="saveInlineWorkItem"
                      @blur="cancelInlineEditing"
                      @keyup.esc.stop="cancelInlineEditing"
                    />
                    <el-button
                      v-else-if="workItem && canUpdate"
                      class="property-button"
                      type="text"
                      @click="startInlineEditing('assigneeUserId')"
                    >{{ workItem.assigneeUserName || '未分配' }}</el-button>
                    <strong v-else>{{ workItem && (workItem.assigneeUserName || '未分配') }}</strong>
                  </div>
                  <div class="property-row">
                    <span>优先级</span>
                    <el-select
                      v-if="workItem && canUpdate && isInlineEditing('priority')"
                      v-model="workItem.priority"
                      class="property-control"
                      @change="saveInlineWorkItem"
                      @blur="cancelInlineEditing"
                      @keyup.esc.native.capture.stop="cancelInlineEditing"
                    >
                      <el-option
                        v-for="option in getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_PRIORITY)"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                    <el-button
                      v-else-if="workItem && canUpdate"
                      class="property-button"
                      type="text"
                      @click="startInlineEditing('priority')"
                    >{{ getPriorityName(workItem.priority) }}</el-button>
                    <strong v-else>{{ getPriorityName(workItem && workItem.priority) }}</strong>
                  </div>
                  <div v-if="projectType === PmsProjectType.AGILE" class="property-row">
                    <span>所属迭代</span>
                    <IterationSelect
                      v-if="workItem && canUpdate && isInlineEditing('iterationId')"
                      v-model="workItem.iterationId"
                      class="property-control"
                      :project-id="workItem.projectId"
                      @update:modelValue="saveInlineWorkItem"
                      @blur="cancelInlineEditing"
                      @keyup.esc.stop="cancelInlineEditing"
                    />
                    <el-button
                      v-else-if="workItem && canUpdate"
                      class="property-button"
                      type="text"
                      @click="startInlineEditing('iterationId')"
                    >{{ workItem.iterationName || '待规划' }}</el-button>
                    <strong v-else>{{ workItem && (workItem.iterationName || '待规划') }}</strong>
                  </div>
                  <div
                    v-if="projectType === PmsProjectType.AGILE && workItem && workItem.type !== PmsWorkItemType.REQUIREMENT"
                    class="property-row"
                  >
                    <span>关联需求</span>
                    <WorkItemSelect
                      v-if="canUpdate && isInlineEditing('relatedRequirementId')"
                      v-model="workItem.relatedRequirementId"
                      class="property-control"
                      placeholder="请选择关联需求"
                      :project-id="workItem.projectId"
                      :type="PmsWorkItemType.REQUIREMENT"
                      @update:modelValue="saveInlineWorkItem"
                      @blur="cancelInlineEditing"
                      @keyup.esc.stop="cancelInlineEditing"
                    />
                    <el-button
                      v-else-if="canUpdate"
                      class="property-button"
                      type="text"
                      @click="startInlineEditing('relatedRequirementId')"
                    >{{ workItem.relatedRequirementName || '未关联' }}</el-button>
                    <strong v-else>{{ workItem.relatedRequirementName || '未关联' }}</strong>
                  </div>
                  <div v-if="workItem && workItem.type === PmsWorkItemType.DEFECT" class="property-row">
                    <span>缺陷类型</span>
                    <strong>{{ getWorkItemDefectTypeName(workItem.defectType) }}</strong>
                  </div>
                  <div class="property-row">
                    <span>完成进度</span>
                    <el-input-number
                      v-if="workItem && canUpdate && isInlineEditing('progress')"
                      v-model="workItem.progress"
                      class="property-control"
                      :controls="false"
                      :max="100"
                      :min="0"
                      @change="saveInlineWorkItem"
                      @keydown.esc.native.stop
                      @keyup.esc.native.capture.stop="cancelInlineEditing"
                    />
                    <el-button
                      v-else-if="workItem && canUpdate"
                      class="property-button"
                      type="text"
                      @click="startInlineEditing('progress')"
                    >{{ workItem.progress || 0 }}%</el-button>
                    <strong v-else>{{ (workItem && workItem.progress) || 0 }}%</strong>
                  </div>
                  <div class="property-row">
                    <span>预估工时</span>
                    <el-input-number
                      v-if="workItem && canUpdate && isInlineEditing('estimatedHours')"
                      v-model="workItem.estimatedHours"
                      class="property-control"
                      :min="0"
                      @change="saveInlineWorkItem"
                      @blur="cancelInlineEditing"
                      @keydown.esc.native.stop
                      @keyup.esc.native.capture.stop="cancelInlineEditing"
                    />
                    <el-button
                      v-else-if="workItem && canUpdate"
                      class="property-button"
                      type="text"
                      @click="startInlineEditing('estimatedHours')"
                    >{{ formatHours(workItem.estimatedHours) }}</el-button>
                    <strong v-else>{{ formatHours(workItem && workItem.estimatedHours) }}</strong>
                  </div>
                  <div class="property-row">
                    <span>开始时间</span>
                    <el-date-picker
                      v-if="workItem && canUpdate && isInlineEditing('startTime')"
                      v-model="workItem.startTime"
                      class="property-control"
                      clearable
                      placeholder="请选择开始时间"
                      type="datetime"
                      value-format="timestamp"
                      @change="saveInlineWorkItem"
                      @blur="cancelInlineEditing"
                      @keydown.esc.native.stop
                      @keyup.esc.native.capture.stop="cancelInlineEditing"
                    />
                    <el-button
                      v-else-if="workItem && canUpdate"
                      class="property-button"
                      type="text"
                      @click="startInlineEditing('startTime')"
                    >{{ formatDate(workItem.startTime) || '-' }}</el-button>
                    <strong v-else>{{ formatDate(workItem && workItem.startTime) || '-' }}</strong>
                  </div>
                  <div class="property-row">
                    <span>截止时间</span>
                    <el-date-picker
                      v-if="workItem && canUpdate && isInlineEditing('endTime')"
                      v-model="workItem.endTime"
                      class="property-control"
                      clearable
                      placeholder="请选择截止时间"
                      type="datetime"
                      value-format="timestamp"
                      @change="saveInlineWorkItem"
                      @blur="cancelInlineEditing"
                      @keydown.esc.native.stop
                      @keyup.esc.native.capture.stop="cancelInlineEditing"
                    />
                    <el-button
                      v-else-if="workItem && canUpdate"
                      class="property-button"
                      type="text"
                      @click="startInlineEditing('endTime')"
                    >{{ formatDate(workItem.endTime) || '-' }}</el-button>
                    <strong v-else>{{ formatDate(workItem && workItem.endTime) || '-' }}</strong>
                  </div>
                  <div class="property-row">
                    <span>创建时间</span>
                    <strong>{{ formatDate(workItem && workItem.createTime) || '-' }}</strong>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </aside>
        </div>
      </div>
    </el-drawer>
    <WorkItemForm ref="workItemFormRef" @success="handleFormSuccess" />
  </div>
</template>

<script>
import * as ProjectApi from '@/api/pms/pm/project'
import * as WorkItemApi from '@/api/pms/pm/workitem'
import { checkPermi } from '@/utils/permission'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { getFileNameFromUrl } from '@/utils/file'
import {
  PmsProjectStatus,
  PmsProjectType,
  PmsWorkItemLifecycleStatus,
  PmsWorkItemType
} from '@/views/pms/pm/utils/constants'
import {
  getPriorityName,
  getWorkItemDefectTypeName,
  getWorkItemStatusTagType,
  getWorkItemTypeName
} from '@/views/pms/pm/utils/format'
import WorkItemStatusSelect from '../status/WorkItemStatusSelect.vue'
import IterationSelect from '../../iteration/components/IterationSelect.vue'
import ProjectMemberSelect from '../../project/components/ProjectMemberSelect.vue'
import WorkItemSelect from '../components/WorkItemSelect.vue'
import WorkItemWorkLogList from '../worklog/WorkItemWorkLogList.vue'
import WorkItemActivity from './WorkItemActivity.vue'
import WorkItemComment from './WorkItemComment.vue'
import WorkItemForm from '../form/WorkItemForm.vue'
import WorkItemSubtaskList from './WorkItemSubtaskList.vue'

export default {
  name: 'PmsWorkItemDetail',
  components: {
    WorkItemStatusSelect,
    IterationSelect,
    ProjectMemberSelect,
    WorkItemSelect,
    WorkItemWorkLogList,
    WorkItemActivity,
    WorkItemComment,
    WorkItemForm,
    WorkItemSubtaskList
  },
  data() {
    return {
      DICT_TYPE,
      PmsProjectType,
      PmsWorkItemType,
      drawerVisible: false,
      loading: false,
      editable: false,
      projectType: PmsProjectType.GENERAL,
      workItem: undefined,
      activeTab: 'comment',
      expandedPanels: ['basic'],
      inlineEditingField: undefined
    }
  },
  computed: {
    workItemTypeName() {
      return getWorkItemTypeName(this.workItem ? this.workItem.type : 0)
    },
    canUpdate() {
      return this.editable && checkPermi(['pms:pm:work-item:update'])
    },
    workItemLabels() {
      return (this.workItem && this.workItem.labels) || []
    },
    workItemMemberNames() {
      return (this.workItem && this.workItem.memberUserNames) || []
    },
    workItemFileUrls() {
      return (this.workItem && this.workItem.fileUrls) || []
    }
  },
  methods: {
    formatDate,
    getFileNameFromUrl,
    getPriorityName,
    getWorkItemDefectTypeName,
    getWorkItemStatusTagType,
    getIntDictOptions,
    async open(id) {
      this.drawerVisible = true
      this.activeTab = 'comment'
      this.inlineEditingField = undefined
      await this.getWorkItem(id)
    },
    startInlineEditing(field) {
      if (this.canUpdate) this.inlineEditingField = field
    },
    cancelInlineEditing() {
      this.inlineEditingField = undefined
    },
    isInlineEditing(field) {
      return this.inlineEditingField === field
    },
    async getWorkItem(id) {
      this.loading = true
      try {
        const workItemResponse = await WorkItemApi.getWorkItem(id)
        const currentWorkItem = workItemResponse.data
        const projectResponse = await ProjectApi.getProject(currentWorkItem.projectId)
        const project = projectResponse.data
        this.workItem = currentWorkItem
        this.projectType = project.type
        this.editable = Boolean(
          project.writeStatus &&
          project.status === PmsProjectStatus.ACTIVE &&
          currentWorkItem.lifecycleStatus === PmsWorkItemLifecycleStatus.ACTIVE
        )
      } finally {
        this.loading = false
      }
    },
    openEditForm() {
      if (this.workItem && this.workItem.id) this.$refs.workItemFormRef.open('update', this.workItem.id)
    },
    async handleQuickStatusChange(statusId) {
      if (!this.workItem || !this.workItem.id) return
      this.cancelInlineEditing()
      await WorkItemApi.updateWorkItemStatus(this.workItem.id, statusId)
      await this.getWorkItem(this.workItem.id)
      this.$message.success('状态已更新')
      this.refreshActivity()
      this.$emit('success')
    },
    async saveInlineWorkItem() {
      if (!this.workItem || !this.workItem.id) return
      const id = this.workItem.id
      this.cancelInlineEditing()
      try {
        await WorkItemApi.updateWorkItem(this.workItem)
        await this.getWorkItem(id)
        this.refreshActivity()
        this.$message.success('工作项已更新')
        this.$emit('success')
      } catch (error) {
        await this.getWorkItem(id)
      }
    },
    refreshActivity() {
      if (this.$refs.workItemActivityRef) this.$refs.workItemActivityRef.getWorkItemActivityList()
    },
    handleCommentChanged() {
      this.refreshActivity()
    },
    handleExtensionChanged() {
      this.refreshActivity()
      this.$emit('success')
    },
    async handleFormSuccess() {
      if (!this.workItem || !this.workItem.id) return
      await this.getWorkItem(this.workItem.id)
      this.$emit('success')
    },
    handleMoreCommand(command) {
      if (command === 'edit') return this.openEditForm()
      if (command === 'archive') return this.handleArchive()
      return this.handleRecycle()
    },
    async handleArchive() {
      if (!this.workItem || !this.workItem.id) return
      try {
        await this.$confirm(`确认归档${this.workItemTypeName}“${this.workItem.name}”吗？`, '提示', { type: 'warning' })
        await WorkItemApi.archiveWorkItem(this.workItem.id)
        this.$message.success('归档成功')
        this.drawerVisible = false
        this.$emit('success')
      } catch (error) {
        // 用户取消归档
      }
    },
    async handleRecycle() {
      if (!this.workItem || !this.workItem.id) return
      try {
        await this.$confirm(`确认将${this.workItemTypeName}“${this.workItem.name}”移入回收站吗？`, '提示', { type: 'warning' })
        await WorkItemApi.recycleWorkItem(this.workItem.id)
        this.$message.success('已移入回收站')
        this.drawerVisible = false
        this.$emit('success')
      } catch (error) {
        // 用户取消移入回收站
      }
    },
    formatHours(hours) {
      return hours == null ? '-' : `${hours} 小时`
    }
  }
}
</script>

<style scoped>
.detail-shell { display: flex; height: 100%; min-width: 900px; flex-direction: column; background: #fff; }
.detail-header { display: flex; flex-shrink: 0; align-items: flex-start; justify-content: space-between; gap: 24px; padding: 20px 28px; }
.detail-title-area { flex: 1; min-width: 0; }
.detail-created { margin-bottom: 4px; color: #909399; font-size: 12px; }
.detail-title-line { display: flex; min-width: 0; align-items: center; gap: 10px; }
.detail-title-line h2 { margin: 0; overflow: hidden; font-size: 22px; font-weight: 600; line-height: 32px; text-overflow: ellipsis; white-space: nowrap; }
.title-icon { flex-shrink: 0; color: #409eff; font-size: 22px; }
.detail-badges { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px; }
.detail-actions { display: flex; flex-shrink: 0; align-items: center; gap: 8px; }
.detail-grid { display: grid; min-height: 0; flex: 1; grid-template-columns: minmax(0, 1fr) 300px; border-top: 1px solid #ebeef5; }
.detail-main { min-width: 0; padding: 24px 32px; overflow-y: auto; }
.detail-section { margin-bottom: 28px; }
.detail-main h3 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
.description-actions { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
.description-actions .el-button { margin-left: 0; }
.description-html { min-height: 48px; font-size: 14px; line-height: 24px; overflow-wrap: anywhere; }
.description-html >>> img { max-width: 100%; }
.description-html >>> p { margin: 8px 0; }
.empty-copy { padding: 8px 0; color: #909399; font-size: 13px; }
.file-list { display: flex; flex-wrap: wrap; gap: 10px; }
.file-link { padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px; }
.detail-aside { padding: 20px; overflow-y: auto; border-left: 1px solid #ebeef5; background: #fff; }
.property-list { display: flex; flex-direction: column; gap: 2px; }
.property-row { display: grid; min-height: 42px; grid-template-columns: 86px minmax(0, 1fr); align-items: center; gap: 12px; font-size: 13px; }
.property-row > span { color: #909399; }
.property-row strong { min-width: 0; overflow: hidden; color: #606266; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.property-control { width: 100%; }
.property-button { min-width: 0; padding-right: 0; padding-left: 0; overflow: hidden; font-weight: 500; text-align: left; text-overflow: ellipsis; white-space: nowrap; }
</style>

<style>
.pms-work-item-detail-drawer .el-drawer__body { height: 100%; overflow: hidden; }
</style>
