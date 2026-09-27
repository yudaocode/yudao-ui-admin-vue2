<template>
  <div>
    <el-dialog
      :visible.sync="dialogVisible"
      append-to-body
      :title="`${getWorkItemTypeName(type)}状态设置`"
      width="900px"
    >
      <el-alert
        class="status-alert"
        :closable="false"
        :description="activeTab === 'status'
          ? '状态用于业务流转，初始状态用于新建工作项。'
          : '拖动状态到看板列；未放入看板的状态仍可用于工作项流转，但不会显示为看板列。'"
        type="info"
        show-icon
      />
      <el-tabs v-model="activeTab" v-loading="loading">
        <el-tab-pane label="状态管理" name="status">
          <el-form label-width="0">
            <draggable v-model="statusList" handle=".status-drag-handle">
              <div v-for="element in statusList" :key="element.id" class="status-row">
                <i class="el-icon-rank status-drag-handle" />
                <el-input v-model="element.name" maxlength="50" placeholder="状态名称" />
                <el-select v-model="element.statusType" class="status-type-select">
                  <el-option
                    v-for="option in getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_STATUS_TYPE)"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-input v-model="element.description" maxlength="255" placeholder="状态描述" />
                <el-radio v-model="defaultStatusId" :label="element.id">初始</el-radio>
                <el-button
                  :disabled="element.id === defaultStatusId"
                  type="text"
                  class="danger-button"
                  @click="handleDelete(element)"
                >删除</el-button>
              </div>
            </draggable>
            <el-button class="add-status-button" plain type="primary" @click="handleAdd">添加状态</el-button>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="看板配置" name="board">
          <div class="unassigned-board">
            <div class="board-label">未放入看板</div>
            <draggable
              v-model="unassignedStatuses"
              class="status-tags"
              group="work-item-board-status"
            >
              <el-tag v-for="status in unassignedStatuses" :key="status.id" class="status-tag" effect="plain">
                {{ status.name }}
              </el-tag>
            </draggable>
          </div>
          <draggable v-model="boardList" handle=".board-drag-handle">
            <div v-for="(board, index) in boardList" :key="board.id" class="board-row">
              <div class="board-heading">
                <i class="el-icon-rank board-drag-handle" />
                <el-input v-model="board.name" maxlength="50" placeholder="请输入看板列名称" />
                <el-button type="text" class="danger-button" @click="handleDeleteBoard(index)">删除列</el-button>
              </div>
              <draggable
                v-model="board.statuses"
                class="status-tags board-status-tags"
                group="work-item-board-status"
              >
                <el-tag v-for="status in board.statuses" :key="status.id" class="status-tag" effect="plain">
                  {{ status.name }}
                </el-tag>
              </draggable>
            </div>
          </draggable>
          <el-button plain type="primary" icon="el-icon-plus" @click="handleAddBoard">添加看板列</el-button>
        </el-tab-pane>
      </el-tabs>
      <span slot="footer">
        <el-button :disabled="loading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <WorkItemStatusDeleteForm ref="deleteFormRef" @success="handleDeleteSuccess" />
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as WorkItemStatusApi from '@/api/pms/pm/workitem/status'
import { PmsWorkItemStatusType, PmsWorkItemType } from '@/views/pms/pm/utils/constants'
import { getWorkItemTypeName } from '@/views/pms/pm/utils/format'
import WorkItemStatusDeleteForm from './WorkItemStatusDeleteForm.vue'

export default {
  name: 'PmsWorkItemStatusList',
  components: { draggable, WorkItemStatusDeleteForm },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      loading: false,
      projectId: 0,
      type: PmsWorkItemType.TASK,
      statusList: [],
      activeTab: 'status',
      boardList: [],
      unassignedStatuses: [],
      defaultStatusId: undefined
    }
  },
  methods: {
    getIntDictOptions,
    getWorkItemTypeName,
    async open(currentProjectId, currentType) {
      this.dialogVisible = true
      this.projectId = currentProjectId
      this.type = currentType
      this.activeTab = 'status'
      await this.getStatusList()
    },
    async getStatusList() {
      this.loading = true
      try {
        const response = await WorkItemStatusApi.getWorkItemStatusList(this.projectId, this.type)
        this.statusList = response.data
        const defaultStatus = this.statusList.find(status => status.defaultStatus)
        this.defaultStatusId = defaultStatus && defaultStatus.id
        await this.getBoardConfig()
      } finally {
        this.loading = false
      }
    },
    async getBoardConfig() {
      const response = await WorkItemStatusApi.getWorkItemBoardConfig(this.projectId, this.type)
      const config = response.data
      const statusMap = new Map(this.statusList.map(status => [status.id, status]))
      this.boardList = (config.boards || []).map(board => ({
        ...board,
        statuses: (board.statusIds || []).map(statusId => statusMap.get(statusId)).filter(Boolean)
      }))
      this.unassignedStatuses = (config.unassignedStatusIds || [])
        .map(statusId => statusMap.get(statusId))
        .filter(Boolean)
    },
    handleAdd() {
      const status = {
        id: -Date.now(),
        projectId: this.projectId,
        workItemType: this.type,
        name: '',
        statusType: PmsWorkItemStatusType.PROCESSING,
        defaultStatus: false,
        sort: this.statusList.length + 1
      }
      this.statusList.push(status)
      this.unassignedStatuses.push(status)
    },
    handleAddBoard() {
      this.boardList.push({ id: -Date.now(), name: '', statusIds: [], statuses: [] })
    },
    handleDeleteBoard(index) {
      this.unassignedStatuses.push(...this.boardList[index].statuses)
      this.boardList.splice(index, 1)
    },
    handleDelete(status) {
      if (status.id < 0) {
        this.statusList = this.statusList.filter(item => item.id !== status.id)
        this.unassignedStatuses = this.unassignedStatuses.filter(item => item.id !== status.id)
        this.boardList.forEach(board => {
          board.statuses = board.statuses.filter(item => item.id !== status.id)
        })
        return
      }
      this.$refs.deleteFormRef.open(status.id)
    },
    async handleDeleteSuccess() {
      await this.getStatusList()
      this.$emit('success')
    },
    async submitForm() {
      const names = this.statusList.map(status => status.name.trim())
      const boardNames = this.boardList.map(board => board.name.trim())
      if (names.some(name => !name)) return this.$message.warning('状态名称不能为空')
      if (new Set(names).size !== names.length) return this.$message.warning('状态名称不能重复')
      if (boardNames.some(name => !name)) return this.$message.warning('看板列名称不能为空')
      if (new Set(boardNames).size !== boardNames.length) return this.$message.warning('看板列名称不能重复')
      if (!this.defaultStatusId) return this.$message.warning('请选择初始状态')
      this.loading = true
      try {
        for (const status of this.statusList) {
          const data = {
            id: status.id,
            projectId: status.id < 0 ? this.projectId : status.projectId,
            workItemType: status.id < 0 ? this.type : status.workItemType,
            name: status.name.trim(),
            statusType: status.statusType,
            description: status.description,
            defaultStatus: status.defaultStatus,
            sort: status.sort
          }
          if (status.id < 0) {
            const oldId = status.id
            const response = await WorkItemStatusApi.createWorkItemStatus(data)
            status.id = response.data
            if (this.defaultStatusId === oldId) this.defaultStatusId = status.id
          } else {
            await WorkItemStatusApi.updateWorkItemStatusConfig(data)
          }
        }
        await WorkItemStatusApi.updateDefaultWorkItemStatus(this.defaultStatusId)
        await WorkItemStatusApi.updateWorkItemStatusSort(this.statusList.map(status => status.id))
        await WorkItemStatusApi.updateWorkItemBoardConfig(
          this.projectId,
          this.type,
          this.boardList.map(board => ({
            id: board.id,
            name: board.name.trim(),
            statusIds: board.statuses.map(status => status.id)
          }))
        )
        this.$message.success('状态设置已保存')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.status-alert { margin-bottom: 16px; }
.status-row { display: grid; grid-template-columns: 24px minmax(120px, 1fr) 120px minmax(150px, 1fr) 64px 46px; align-items: center; gap: 12px; margin-bottom: 12px; }
.status-drag-handle, .board-drag-handle { color: #909399; cursor: move; }
.status-type-select { width: 120px; }
.status-row .el-radio { margin-right: 0; }
.danger-button { color: #f56c6c; }
.add-status-button { margin-top: 8px; }
.unassigned-board { margin-bottom: 14px; padding: 12px; border-radius: 6px; background: #f5f7fa; }
.board-label { margin-bottom: 8px; font-size: 13px; font-weight: 600; }
.status-tags { display: flex; min-height: 38px; flex-wrap: wrap; gap: 8px; }
.status-tag { cursor: move; }
.board-row { margin-bottom: 12px; padding: 12px; border: 1px solid #dcdfe6; border-radius: 6px; }
.board-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.board-status-tags { padding: 8px; border-radius: 4px; background: #f5f7fa; }
</style>
