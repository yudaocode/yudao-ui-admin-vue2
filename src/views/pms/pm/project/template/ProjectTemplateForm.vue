<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    append-to-body
    width="1100px"
    @closed="handleClosed"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="96px"
    >
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="基本信息" name="basic">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="模板名称" prop="name">
                <el-input
                  v-model="formData.name"
                  maxlength="100"
                  placeholder="请输入模板名称"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目类型" prop="projectType">
                <el-select
                  v-model="formData.projectType"
                  class="full-width"
                  placeholder="请选择项目类型"
                  @change="handleProjectTypeChange"
                >
                  <el-option label="通用项目" :value="PmsProjectType.GENERAL" />
                  <el-option label="敏捷开发项目" :value="PmsProjectType.AGILE" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="模板状态" prop="status">
                <el-radio-group v-model="formData.status">
                  <el-radio
                    v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                    :key="dict.value"
                    :label="dict.value"
                  >
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="显示顺序" prop="sort">
                <el-input-number v-model="formData.sort" :min="0" class="full-width" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="模板描述" prop="description">
            <el-input
              v-model="formData.description"
              :rows="4"
              maxlength="500"
              placeholder="请输入模板适用场景"
              show-word-limit
              type="textarea"
            />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane :label="'事项类型（' + formData.itemTypes.length + '）'" name="itemType">
          <el-alert
            :closable="false"
            class="tab-alert"
            description="项目创建时会根据这里的事项类型初始化可用能力；取消事项类型会同步移除其状态和看板"
            title="事项类型是模板的全局关系；项目创建后不提供项目级维护"
            type="info"
          />
          <el-form-item class="item-type-form-item" label="事项类型" prop="itemTypes">
            <el-checkbox-group v-model="formData.itemTypes" @change="handleItemTypesChange">
              <el-checkbox
                v-for="item in getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_TYPE)"
                :key="item.value"
                :label="item.value"
              >
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane :label="'状态（' + formData.statuses.length + '）'" name="status">
          <div class="tab-toolbar">
            <el-alert
              :closable="false"
              class="toolbar-alert"
              title="拖拽调整状态顺序；每种事项类型必须且只能配置一个初始状态"
              type="info"
            />
            <el-button type="primary" @click="addStatus">
              <Icon class="button-icon" icon="ep:plus" />新增状态
            </el-button>
          </div>
          <div class="status-groups">
            <div v-for="group in statusGroups" :key="group.value" class="status-group">
              <div class="status-group-title">
                <span>{{ group.label }}</span>
                <span class="secondary-text">（{{ group.statuses.length }}）</span>
              </div>
              <el-table
                :ref="'statusTable-' + group.value"
                :data="group.statuses"
                max-height="430px"
                row-key="code"
              >
                <el-table-column align="center" width="44">
                  <template slot-scope="scope">
                    <el-tooltip content="拖动排序" placement="top">
                      <Icon
                        :key="scope.row.code"
                        class="status-drag-handle drag-handle"
                        icon="ep:rank"
                      />
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column label="编码" min-width="150">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.code" placeholder="如 task_todo" />
                  </template>
                </el-table-column>
                <el-table-column label="名称" min-width="130">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.name" placeholder="请输入状态名称" />
                  </template>
                </el-table-column>
                <el-table-column label="事项类型" min-width="130">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.workItemType" @change="handleStatusTypeChange">
                      <el-option
                        v-for="item in enabledWorkItemTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="语义状态" min-width="130">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.statusType">
                      <el-option
                        v-for="item in getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_STATUS_TYPE)"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="初始" width="80">
                  <template slot-scope="scope">
                    <el-radio
                      :label="true"
                      :value="scope.row.defaultStatus"
                      class="default-status-radio"
                      @change="handleDefaultStatusChange(scope.row)"
                    >
                      初始
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column align="center" fixed="right" label="操作" width="70">
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      class="danger-text-button"
                      @click="removeStatusByItem(group.statuses[scope.$index])"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="'看板（' + formData.boards.length + '）'" name="board">
          <div class="tab-toolbar">
            <el-alert
              :closable="false"
              class="toolbar-alert"
              title="拖拽调整看板列顺序；同一状态只能归属一个看板列"
              type="info"
            />
            <el-button type="primary" @click="addBoard">
              <Icon class="button-icon" icon="ep:plus" />新增看板列
            </el-button>
          </div>
          <el-table ref="boardTable" :data="formData.boards" max-height="430px">
            <el-table-column align="center" width="44">
              <template slot-scope="scope">
                <el-tooltip content="拖动排序" placement="top">
                  <Icon
                    :key="scope.row.code"
                    class="board-drag-handle drag-handle"
                    icon="ep:rank"
                  />
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="编码" min-width="140">
              <template slot-scope="scope">
                <el-input v-model="scope.row.code" placeholder="如 todo" />
              </template>
            </el-table-column>
            <el-table-column label="名称" min-width="130">
              <template slot-scope="scope">
                <el-input v-model="scope.row.name" placeholder="请输入看板列名称" />
              </template>
            </el-table-column>
            <el-table-column label="事项类型" min-width="130">
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.workItemType"
                  @change="scope.row.statusCodes = []"
                >
                  <el-option
                    v-for="item in enabledWorkItemTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="关联状态" min-width="260">
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.statusCodes"
                  class="full-width"
                  multiple
                  placeholder="请选择关联状态"
                >
                  <el-option
                    v-for="status in getStatusOptions(scope.row.workItemType, scope.row.code)"
                    :key="status.code"
                    :label="status.name || status.code"
                    :value="status.code"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column align="center" fixed="right" label="操作" width="70">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  class="danger-text-button"
                  @click="removeBoard(scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Sortable from 'sortablejs'
import { Icon } from '@/components/Icon'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as ProjectTemplateApi from '@/api/pms/pm/project/template'
import {
  PmsProjectType,
  PmsWorkItemStatusType,
  PmsWorkItemType
} from '@/views/pms/pm/utils/constants'
import { getWorkItemTypeCode } from '@/views/pms/pm/utils/format'

function createStatus(code, name, workItemType, statusType, defaultStatus, sort) {
  return { code, name, workItemType, statusType, defaultStatus, sort, boardCode: code }
}

function createBoard(code, name, workItemType, sort, statusCodes) {
  return { code, name, workItemType, sort, statusCodes }
}

function getDefaultWorkItemTypeConfig(workItemType) {
  const prefix = getWorkItemTypeCode(workItemType)
  return {
    statuses: [
      createStatus(
        prefix + '_todo',
        '待处理',
        workItemType,
        PmsWorkItemStatusType.PENDING,
        true,
        10
      ),
      createStatus(
        prefix + '_doing',
        '进行中',
        workItemType,
        PmsWorkItemStatusType.PROCESSING,
        false,
        20
      ),
      createStatus(
        prefix + '_done',
        '已完成',
        workItemType,
        PmsWorkItemStatusType.COMPLETED,
        false,
        30
      )
    ],
    boards: [
      createBoard(prefix + '_todo', '待处理', workItemType, 10, [prefix + '_todo']),
      createBoard(prefix + '_doing', '进行中', workItemType, 20, [prefix + '_doing']),
      createBoard(prefix + '_done', '已完成', workItemType, 30, [prefix + '_done'])
    ]
  }
}

function getDefaultCollaborationConfig(projectType) {
  const itemTypes = projectType === PmsProjectType.AGILE
    ? [PmsWorkItemType.REQUIREMENT, PmsWorkItemType.TASK, PmsWorkItemType.DEFECT]
    : [PmsWorkItemType.TASK]
  const configs = itemTypes.map(getDefaultWorkItemTypeConfig)
  return {
    itemTypes,
    statuses: configs.reduce((result, config) => result.concat(config.statuses), []),
    boards: configs.reduce((result, config) => result.concat(config.boards), [])
  }
}

function getDefaultFormData() {
  const projectType = PmsProjectType.GENERAL
  return Object.assign({
    id: undefined,
    name: '',
    description: '',
    projectType,
    status: CommonStatusEnum.ENABLE,
    sort: 0
  }, getDefaultCollaborationConfig(projectType))
}

export default {
  name: 'PmsProjectTemplateForm',
  components: { Icon },
  data() {
    return {
      DICT_TYPE,
      PmsProjectType,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      activeTab: 'basic',
      previousProjectType: PmsProjectType.GENERAL,
      formData: getDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
        projectType: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
        status: [{ required: true, message: '请选择模板状态', trigger: 'change' }],
        sort: [{ required: true, message: '请输入显示顺序', trigger: 'blur' }],
        itemTypes: [{ required: true, message: '请选择事项类型', trigger: 'change' }]
      },
      statusSortables: new Map(),
      boardSortable: undefined
    }
  },
  computed: {
    enabledWorkItemTypeOptions() {
      return getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_TYPE).filter(item =>
        this.formData.itemTypes.includes(item.value)
      )
    },
    statusGroups() {
      return this.enabledWorkItemTypeOptions
        .map(item => Object.assign({}, item, {
          statuses: this.formData.statuses.filter(status => status.workItemType === item.value)
        }))
        .filter(group => group.statuses.length > 0)
    }
  },
  beforeDestroy() {
    this.handleClosed()
  },
  methods: {
    getIntDictOptions,
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = this.$t('action.' + type)
      this.formType = type
      this.activeTab = 'basic'
      this.resetForm()
      if (!id) return
      this.formLoading = true
      try {
        const response = await ProjectTemplateApi.getProjectTemplate(id)
        this.formData = response.data
        this.previousProjectType = this.formData.projectType
      } finally {
        this.formLoading = false
      }
    },
    async handleProjectTypeChange(projectType) {
      const previousConfig = getDefaultCollaborationConfig(this.previousProjectType)
      const customized =
        JSON.stringify(this.formData.itemTypes) !== JSON.stringify(previousConfig.itemTypes) ||
        JSON.stringify(this.formData.statuses) !== JSON.stringify(previousConfig.statuses) ||
        JSON.stringify(this.formData.boards) !== JSON.stringify(previousConfig.boards)
      if (customized) {
        try {
          await this.$modal.confirm('切换项目类型会恢复默认事项类型、状态和看板，确认继续吗？')
        } catch (error) {
          this.formData.projectType = this.previousProjectType
          return false
        }
      }
      const config = getDefaultCollaborationConfig(projectType)
      this.formData.itemTypes = config.itemTypes
      this.formData.statuses = config.statuses
      this.formData.boards = config.boards
      this.previousProjectType = projectType
      return true
    },
    handleItemTypesChange() {
      const itemTypeSet = new Set(this.formData.itemTypes)
      this.formData.statuses = this.formData.statuses.filter(status =>
        itemTypeSet.has(status.workItemType)
      )
      this.formData.boards = this.formData.boards.filter(board =>
        itemTypeSet.has(board.workItemType)
      )
      this.formData.itemTypes.forEach(workItemType => {
        if (this.formData.statuses.some(status => status.workItemType === workItemType)) return
        const config = getDefaultWorkItemTypeConfig(workItemType)
        this.formData.statuses.push(...config.statuses)
        this.formData.boards.push(...config.boards)
      })
      this.updateStatusSort()
      this.updateBoardSort()
    },
    handleTabClick(tab) {
      return this.handleTabChange(tab.name)
    },
    async handleTabChange(tab) {
      await this.$nextTick()
      if (tab === 'status') this.initStatusSortable()
      else if (tab === 'board') this.initBoardSortable()
    },
    initStatusSortable() {
      this.statusSortables.forEach(sortable => sortable.destroy())
      this.statusSortables.clear()
      this.statusGroups.forEach(group => {
        let table = this.$refs['statusTable-' + group.value]
        if (Array.isArray(table)) table = table[0]
        const tableBody = table && table.$el
          ? table.$el.querySelector('.el-table__body-wrapper tbody')
          : undefined
        if (!tableBody) return
        const sortable = Sortable.create(tableBody, {
          animation: 150,
          handle: '.status-drag-handle',
          onEnd: ({ newIndex, oldIndex }) => {
            if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
            const movedStatus = group.statuses[oldIndex]
            const targetStatus = group.statuses[newIndex]
            const oldGlobalIndex = this.formData.statuses.indexOf(movedStatus)
            const targetGlobalIndex = this.formData.statuses.indexOf(targetStatus)
            if (oldGlobalIndex < 0 || targetGlobalIndex < 0) return
            this.formData.statuses.splice(oldGlobalIndex, 1)
            this.formData.statuses.splice(targetGlobalIndex, 0, movedStatus)
            this.updateStatusSort()
          }
        })
        this.statusSortables.set(group.value, sortable)
      })
    },
    async handleStatusTypeChange() {
      await this.$nextTick()
      this.initStatusSortable()
    },
    initBoardSortable() {
      if (this.boardSortable) this.boardSortable.destroy()
      const tableBody = this.$refs.boardTable && this.$refs.boardTable.$el
        ? this.$refs.boardTable.$el.querySelector('.el-table__body-wrapper tbody')
        : undefined
      if (!tableBody) return
      this.boardSortable = Sortable.create(tableBody, {
        animation: 150,
        handle: '.board-drag-handle',
        onEnd: ({ newIndex, oldIndex }) => {
          if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
          this.formData.boards.splice(newIndex, 0, this.formData.boards.splice(oldIndex, 1)[0])
          this.updateBoardSort()
        }
      })
    },
    handleDefaultStatusChange(status) {
      this.formData.statuses.forEach(item => {
        if (item.workItemType === status.workItemType) item.defaultStatus = item === status
      })
    },
    updateStatusSort() {
      this.formData.statuses.forEach((status, index) => {
        status.sort = (index + 1) * 10
      })
    },
    updateBoardSort() {
      this.formData.boards.forEach((board, index) => {
        board.sort = (index + 1) * 10
      })
    },
    addStatus() {
      const workItemType = this.formData.itemTypes[0] || PmsWorkItemType.TASK
      this.formData.statuses.push({
        code: '',
        name: '',
        workItemType,
        statusType: PmsWorkItemStatusType.PENDING,
        defaultStatus: false,
        sort: this.formData.statuses.length * 10 + 10,
        boardCode: ''
      })
    },
    removeStatus(index) {
      const statusCode = this.formData.statuses[index].code
      this.formData.statuses.splice(index, 1)
      this.formData.boards.forEach(board => {
        board.statusCodes = board.statusCodes.filter(code => code !== statusCode)
      })
      this.updateStatusSort()
    },
    removeStatusByItem(status) {
      const index = this.formData.statuses.indexOf(status)
      if (index >= 0) this.removeStatus(index)
    },
    addBoard() {
      this.formData.boards.push({
        code: '',
        name: '',
        workItemType: this.formData.itemTypes[0] || PmsWorkItemType.TASK,
        sort: this.formData.boards.length * 10 + 10,
        statusCodes: []
      })
    },
    removeBoard(index) {
      this.formData.boards.splice(index, 1)
      this.updateBoardSort()
    },
    getStatusOptions(workItemType, currentBoardCode) {
      const selectedStatusCodes = new Set(
        this.formData.boards
          .filter(board => board.code !== currentBoardCode)
          .reduce((result, board) => result.concat(board.statusCodes), [])
      )
      return this.formData.statuses.filter(status =>
        status.workItemType === workItemType && !selectedStatusCodes.has(status.code)
      )
    },
    submitForm() {
      if (!this.$refs.form) return Promise.resolve(false)
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(async(valid, fields) => {
          if (!valid) {
            this.activeTab = fields && Object.prototype.hasOwnProperty.call(fields, 'itemTypes')
              ? 'itemType'
              : 'basic'
            resolve(false)
            return
          }
          if (!this.validateCollaborationConfig()) {
            resolve(false)
            return
          }
          const data = this.buildSubmitData()
          this.formLoading = true
          try {
            if (this.formType === 'create') {
              await ProjectTemplateApi.createProjectTemplate(data)
              this.$modal.msgSuccess(this.$t('common.createSuccess'))
            } else {
              await ProjectTemplateApi.updateProjectTemplate(data)
              this.$modal.msgSuccess(this.$t('common.updateSuccess'))
            }
            this.dialogVisible = false
            this.$emit('success')
            resolve(true)
          } catch (error) {
            reject(error)
          } finally {
            this.formLoading = false
          }
        })
      })
    },
    validateCollaborationConfig() {
      const statusCodeSet = new Set()
      for (const status of this.formData.statuses) {
        if (!status.code || !status.name || !this.formData.itemTypes.includes(status.workItemType)) {
          return this.warnAndSwitchTab('status', '请完整填写状态编码、名称和事项类型')
        }
        if (statusCodeSet.has(status.code)) {
          return this.warnAndSwitchTab('status', '状态编码“' + status.code + '”不能重复')
        }
        statusCodeSet.add(status.code)
      }
      for (const workItemType of this.formData.itemTypes) {
        const count = this.formData.statuses.filter(status =>
          status.workItemType === workItemType && status.defaultStatus
        ).length
        if (count !== 1) {
          return this.warnAndSwitchTab('status', '每种事项类型必须且只能配置一个初始状态')
        }
      }
      const boardCodeSet = new Set()
      const assignedStatusCountMap = new Map()
      for (const board of this.formData.boards) {
        if (!board.code || !board.name || !this.formData.itemTypes.includes(board.workItemType)) {
          return this.warnAndSwitchTab('board', '请完整填写看板编码、名称和事项类型')
        }
        if (boardCodeSet.has(board.code)) {
          return this.warnAndSwitchTab('board', '看板编码“' + board.code + '”不能重复')
        }
        boardCodeSet.add(board.code)
        for (const statusCode of board.statusCodes) {
          const status = this.formData.statuses.find(item => item.code === statusCode)
          if (!status || status.workItemType !== board.workItemType) {
            return this.warnAndSwitchTab('board', '看板只能关联相同事项类型的有效状态')
          }
          assignedStatusCountMap.set(
            statusCode,
            (assignedStatusCountMap.get(statusCode) || 0) + 1
          )
        }
      }
      if (this.formData.statuses.some(status => assignedStatusCountMap.get(status.code) !== 1)) {
        return this.warnAndSwitchTab('board', '每个状态必须且只能归属一个看板列')
      }
      return true
    },
    warnAndSwitchTab(tab, text) {
      this.activeTab = tab
      this.$modal.msgWarning(text)
      return false
    },
    buildSubmitData() {
      const data = JSON.parse(JSON.stringify(this.formData))
      const statusBoardMap = new Map()
      data.boards.forEach(board => {
        board.statusCodes.forEach(statusCode => statusBoardMap.set(statusCode, board.code))
      })
      data.statuses.forEach(status => {
        status.boardCode = statusBoardMap.get(status.code) || ''
      })
      return data
    },
    resetForm() {
      this.formData = getDefaultFormData()
      this.previousProjectType = this.formData.projectType
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    },
    handleClosed() {
      this.statusSortables.forEach(sortable => sortable.destroy())
      this.statusSortables.clear()
      if (this.boardSortable) this.boardSortable.destroy()
      this.boardSortable = undefined
    }
  }
}
</script>

<style scoped>
.full-width {
  width: 100%;
}

.tab-alert {
  margin-bottom: 20px;
}

.item-type-form-item {
  margin-bottom: 0;
}

.tab-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.toolbar-alert {
  flex: 1;
}

.status-group + .status-group {
  margin-top: 16px;
}

.status-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.secondary-text,
.drag-handle {
  color: #909399;
}

.drag-handle {
  cursor: move;
}

.button-icon {
  margin-right: 5px;
}

.default-status-radio {
  margin-right: 0;
}

.danger-text-button {
  color: #f56c6c;
}

@media (max-width: 900px) {
  .tab-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
