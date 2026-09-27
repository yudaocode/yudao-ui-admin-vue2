<template>
  <div class="work-item-subtask-list">
    <el-divider v-if="showTitle" content-position="left">子工作项</el-divider>
    <div v-if="editable" class="subtask-create">
      <el-input
        v-model="newSubtaskName"
        maxlength="100"
        placeholder="输入子工作项标题，按回车保存"
        @keyup.enter.native="handleCreate"
      />
      <el-button :loading="creating" type="primary" @click="handleCreate">添加</el-button>
    </div>
    <el-table v-loading="loading" :data="subtaskList" size="small">
      <el-table-column align="center" label="完成" width="64">
        <template slot-scope="scope">
          <el-checkbox
            :disabled="!editable || statusSavingId === scope.row.id"
            :value="scope.row.status === PmsWorkItemStatusType.COMPLETED"
            @change="handleStatusChange(scope.row, $event === true)"
          />
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="240">
        <template slot-scope="scope">
          <div v-if="editingId === scope.row.id" class="subtask-edit">
            <el-input
              v-model="editingName"
              maxlength="100"
              size="small"
              @keyup.enter.native="handleRename(scope.row)"
            />
            <el-button type="text" @click="handleRename(scope.row)">保存</el-button>
            <el-button type="text" @click="editingId = undefined">取消</el-button>
          </div>
          <span v-else>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="statusName" width="120" />
      <el-table-column label="负责人" prop="assigneeUserName" width="110" />
      <el-table-column v-if="editable" align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-button type="text" @click="startRename(scope.row)">改名</el-button>
          <el-popconfirm
            cancel-button-text="取消"
            confirm-button-text="确定"
            :title="`确认删除子工作项“${scope.row.name}”吗？删除后可在回收站恢复。`"
            @confirm="handleRecycle(scope.row)"
          >
            <el-button slot="reference" class="subtask-delete" type="text">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-empty
      v-if="!loading && subtaskList.length === 0"
      :image-size="56"
      description="暂无子工作项"
    />
  </div>
</template>

<script>
import * as WorkItemApi from '@/api/pms/pm/workitem'
import * as WorkItemStatusApi from '@/api/pms/pm/workitem/status'
import { PmsWorkItemLifecycleStatus, PmsWorkItemStatusType } from '@/views/pms/pm/utils/constants'
import { getAllPageItems } from '@/utils/page'

export default {
  name: 'PmsWorkItemSubtaskList',
  props: {
    parentWorkItem: { type: Object, required: true },
    editable: { type: Boolean, required: true },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      PmsWorkItemStatusType,
      loading: false,
      creating: false,
      statusSavingId: undefined,
      subtaskList: [],
      statusList: [],
      newSubtaskName: '',
      editingId: undefined,
      editingName: ''
    }
  },
  watch: {
    'parentWorkItem.id': { immediate: true, handler: 'getSubtaskList' }
  },
  methods: {
    async getSubtaskList() {
      if (!this.parentWorkItem.id) return
      this.loading = true
      try {
        const params = {
          projectId: this.parentWorkItem.projectId,
          type: this.parentWorkItem.type,
          lifecycleStatus: PmsWorkItemLifecycleStatus.ACTIVE,
          parentId: this.parentWorkItem.id
        }
        const [page, statusResponse] = await Promise.all([
          getAllPageItems((pageNo, pageSize) => WorkItemApi.getWorkItemPage({
            ...params,
            pageNo,
            pageSize
          })),
          WorkItemStatusApi.getWorkItemStatusList(this.parentWorkItem.projectId, this.parentWorkItem.type)
        ])
        this.subtaskList = page
        this.statusList = statusResponse.data
      } finally {
        this.loading = false
      }
    },
    async handleCreate() {
      const name = this.newSubtaskName.trim()
      if (!name) {
        this.$message.warning('请输入子工作项标题')
        return
      }
      this.creating = true
      try {
        await WorkItemApi.createWorkItem({
          projectId: this.parentWorkItem.projectId,
          type: this.parentWorkItem.type,
          name,
          priority: this.parentWorkItem.priority,
          assigneeUserId: this.parentWorkItem.assigneeUserId,
          memberUserIds: this.parentWorkItem.memberUserIds,
          iterationId: this.parentWorkItem.iterationId,
          parentId: this.parentWorkItem.id,
          relatedRequirementId: this.parentWorkItem.relatedRequirementId,
          defectType: this.parentWorkItem.defectType,
          progress: 0,
          fileUrls: [],
          labelIds: []
        })
        this.newSubtaskName = ''
        this.$message.success('子工作项创建成功')
        await this.getSubtaskList()
        this.$emit('changed')
      } finally {
        this.creating = false
      }
    },
    startRename(workItem) {
      this.editingId = workItem.id
      this.editingName = workItem.name
    },
    async handleRename(workItem) {
      const name = this.editingName.trim()
      if (!name) {
        this.$message.warning('请输入子工作项标题')
        return
      }
      await WorkItemApi.updateWorkItemName(workItem.id, name)
      this.editingId = undefined
      this.$message.success('子工作项名称已更新')
      await this.getSubtaskList()
      this.$emit('changed')
    },
    async handleStatusChange(workItem, completed) {
      const targetType = completed
        ? PmsWorkItemStatusType.COMPLETED
        : PmsWorkItemStatusType.PENDING
      const targetStatus = this.statusList.find(status => status.statusType === targetType)
      if (!targetStatus) {
        this.$message.warning(completed ? '请先配置已完成状态' : '请先配置未开始状态')
        return
      }
      this.statusSavingId = workItem.id
      try {
        await WorkItemApi.updateWorkItemStatus(workItem.id, targetStatus.id)
        await this.getSubtaskList()
        this.$emit('changed')
      } finally {
        this.statusSavingId = undefined
      }
    },
    async handleRecycle(workItem) {
      await WorkItemApi.recycleWorkItem(workItem.id)
      this.$message.success('子工作项已移入回收站')
      await this.getSubtaskList()
      this.$emit('changed')
    }
  }
}
</script>

<style scoped>
.subtask-create, .subtask-edit { display: flex; gap: 8px; }
.subtask-create { margin-bottom: 12px; }
.subtask-delete { color: #f56c6c; margin-left: 10px; }
</style>
