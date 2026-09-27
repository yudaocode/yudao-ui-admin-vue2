<!--
  The Vue3 model page renders one category through this component.  Keep the
  same boundary in the Vue2 app so category/model sorting, form previews and
  model actions are independently reusable.  The implementation deliberately
  uses Element UI and the Options API; no Vue3-only compiler syntax is used.
-->
<template>
  <div class="category-draggable-model">
    <div class="category-header">
      <div class="category-title">
        <el-tooltip v-if="isCategorySorting" content="拖动排序" placement="top">
          <i class="el-icon-rank category-drag-icon" />
        </el-tooltip>
        <h3>{{ categoryInfo.name }}</h3>
        <span>({{ modelList.length }})</span>
      </div>

      <div v-if="!isCategorySorting" class="category-actions">
        <div
          v-if="modelList.length > 0"
          class="category-expand"
          :class="isExpand ? 'is-expanded' : ''"
          @click="isExpand = !isExpand"
        >
          <i class="el-icon-arrow-down" />
        </div>
        <template v-if="!isModelSorting">
          <el-button
            v-if="modelList.length > 0"
            v-hasPermi="['bpm:model:update']"
            type="text"
            class="category-action"
            icon="el-icon-sort"
            :disabled="!canManageModels"
            @click.stop="startModelSort"
          >排序</el-button>
          <el-button
            v-else
            v-hasPermi="['bpm:model:create']"
            type="text"
            class="category-action"
            icon="el-icon-plus"
            @click.stop="openModelForm('create')"
          >新建</el-button>
          <el-dropdown
            v-if="hasCategoryPermission"
            trigger="click"
            @command="handleCategoryCommand"
          >
            <el-button type="text" class="category-action" icon="el-icon-setting">分类</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-if="hasCategoryUpdate"
                command="rename"
              >重命名</el-dropdown-item>
              <el-dropdown-item
                v-if="hasCategoryDelete"
                command="delete"
              >删除该类</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button @click.stop="cancelModelSort">取 消</el-button>
          <el-button type="primary" @click.stop="saveModelSort">保存排序</el-button>
        </template>
      </div>
    </div>

    <el-collapse-transition>
      <div v-show="isExpand">
        <el-table
          v-if="modelList.length > 0"
          ref="modelTable"
          :data="modelList"
          row-key="id"
          :header-cell-style="tableHeaderStyle"
          :cell-style="tableCellStyle"
          :row-style="{ height: '68px' }"
        >
          <el-table-column label="流程名" prop="name" min-width="150">
            <template slot-scope="scope">
              <div class="model-name-cell">
                <el-tooltip v-if="isModelSorting" content="拖动排序" placement="top">
                  <i class="el-icon-rank model-drag-icon" />
                </el-tooltip>
                <el-image
                  v-if="scope.row.icon"
                  :src="scope.row.icon"
                  class="model-flow-image"
                  fit="cover"
                />
                <div v-else class="flow-icon">
                  <span>{{ subString(scope.row.name, 0, 2) }}</span>
                </div>
                <span>{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="可见范围" min-width="150">
            <template slot-scope="scope">
              <el-tooltip
                v-if="visibleScopeText(scope.row).length > 18"
                :content="visibleScopeText(scope.row)"
                placement="top"
              >
                <span>{{ visibleScopeText(scope.row) }}</span>
              </el-tooltip>
              <span v-else>{{ visibleScopeText(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="流程类型" prop="type" min-width="120">
            <template slot-scope="scope">
              <dict-tag :value="scope.row.type" :type="DICT_TYPE.BPM_MODEL_TYPE" />
            </template>
          </el-table-column>
          <el-table-column label="表单信息" prop="formType" min-width="150">
            <template slot-scope="scope">
              <el-button
                v-if="Number(scope.row.formType) === Number(BpmModelFormType.NORMAL)"
                type="text"
                @click="handleFormDetail(scope.row)"
              >{{ scope.row.formName || '查看表单' }}</el-button>
              <el-button
                v-else-if="Number(scope.row.formType) === Number(BpmModelFormType.CUSTOM)"
                type="text"
                @click="handleFormDetail(scope.row)"
              >{{ scope.row.formCustomCreatePath }}</el-button>
              <span v-else>暂无表单</span>
            </template>
          </el-table-column>
          <el-table-column label="最后发布" min-width="250">
            <template slot-scope="scope">
              <div class="deployment-cell">
                <span v-if="scope.row.processDefinition" class="deployment-time">
                  {{ formatDate(scope.row.processDefinition.deploymentTime) }}
                </span>
                <el-tag v-if="scope.row.processDefinition">
                  v{{ scope.row.processDefinition.version }}
                </el-tag>
                <el-tag v-else type="warning">未部署</el-tag>
                <el-tag
                  v-if="scope.row.processDefinition && scope.row.processDefinition.suspensionState === 2"
                  type="warning"
                >已停用</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="215" fixed="right">
            <template slot-scope="scope">
              <el-button
                v-hasPermi="['bpm:model:update']"
                type="text"
                :disabled="!isModelManager(scope.row)"
                @click="openModelForm('update', scope.row.id)"
              >修改</el-button>
              <el-button
                v-hasPermi="['bpm:model:update']"
                type="text"
                :disabled="!isModelManager(scope.row)"
                @click="openModelForm('copy', scope.row.id)"
              >复制</el-button>
              <el-button
                v-hasPermi="['bpm:model:deploy']"
                type="text"
                :disabled="!isModelManager(scope.row)"
                @click="handleDeploy(scope.row)"
              >发布</el-button>
              <el-dropdown
                v-if="hasModelMorePermission"
                trigger="click"
                @command="(command) => handleModelCommand(command, scope.row)"
              >
                <el-button type="text">更多</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-if="hasPermiDefinition"
                    command="definition"
                  >历史</el-dropdown-item>
                  <el-dropdown-item v-if="hasPermiExport" command="export">导出</el-dropdown-item>
                  <el-dropdown-item
                    v-if="hasPermiReport"
                    command="report"
                    :disabled="!scope.row.processDefinition || !isModelManager(scope.row)"
                  >报表</el-dropdown-item>
                  <el-dropdown-item
                    v-if="hasPermiUpdate"
                    command="state"
                    :disabled="!scope.row.processDefinition || !isModelManager(scope.row)"
                  >{{ scope.row.processDefinition && scope.row.processDefinition.suspensionState === 1 ? '停用' : '启用' }}</el-dropdown-item>
                  <el-dropdown-item
                    v-if="hasPermiClean"
                    command="clean"
                    :disabled="!isModelManager(scope.row)"
                  >清理</el-dropdown-item>
                  <el-dropdown-item
                    v-if="hasPermiDelete"
                    command="delete"
                    :disabled="!isModelManager(scope.row)"
                    divided
                  >删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-collapse-transition>

    <CategoryForm ref="categoryForm" @success="handleChildSuccess" />
    <Dialog
      title="表单详情"
      v-model="formDetailVisible"
    >
      <form-create
        :rule="formDetail.rule"
        :option="formDetail.option"
      />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import Sortable from 'sortablejs'
import CategoryForm from '../category/CategoryForm.vue'
import * as CategoryApi from '@/api/bpm/category'
import * as ModelApi from '@/api/bpm/model'
import * as FormApi from '@/api/bpm/form'
import { setConfAndFields2 } from '@/utils/formCreate'
import { BpmModelFormType } from '@/utils/constants'
import { DICT_TYPE } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { formatDate, deepClone } from '@/utils'
import download from '@/plugins/download'

function subString(str, start, end) {
  if (!str) return ''
  return String(str).length > end ? String(str).slice(start, end) : String(str)
}

export default {
  name: 'CategoryDraggableModel',
  components: { CategoryForm, Dialog },
  props: {
    categoryInfo: {
      type: Object,
      required: true
    },
    isCategorySorting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      DICT_TYPE,
      BpmModelFormType,
      modelList: [],
      originalModelList: [],
      isExpand: false,
      isModelSorting: false,
      sortable: null,
      formDetailVisible: false,
      formDetail: { rule: [], option: {} }
    }
  },
  computed: {
    hasPermiUpdate() { return this.hasPermission(['bpm:model:update']) },
    hasPermiDelete() { return this.hasPermission(['bpm:model:delete']) },
    hasPermiDeploy() { return this.hasPermission(['bpm:model:deploy']) },
    hasPermiExport() { return this.hasPermission(['bpm:model:export']) },
    hasPermiClean() { return this.hasPermission(['bpm:model:clean']) },
    hasPermiDefinition() { return this.hasPermission(['bpm:process-definition:query']) },
    hasPermiReport() { return this.hasPermission(['bpm:process-instance:manager-query']) },
    hasCategoryUpdate() { return this.hasPermission(['bpm:category:update']) },
    hasCategoryDelete() { return this.hasPermission(['bpm:category:delete']) },
    hasCategoryPermission() { return this.hasCategoryUpdate || this.hasCategoryDelete },
    hasModelMorePermission() {
      return this.hasPermiDefinition || this.hasPermiExport || this.hasPermiReport ||
        this.hasPermiUpdate || this.hasPermiClean || this.hasPermiDelete
    },
    currentUserId() {
      return this.$store && this.$store.getters ? this.$store.getters.userId : undefined
    },
    canManageModels() {
      return this.modelList.length > 0 && this.modelList.every((item) => this.isModelManager(item))
    },
    tableHeaderStyle() {
      return { backgroundColor: '#edeff0', paddingLeft: '10px' }
    },
    tableCellStyle() {
      return { paddingLeft: '10px' }
    }
  },
  watch: {
    categoryInfo: {
      deep: true,
      immediate: true,
      handler(value) {
        const list = value && Array.isArray(value.modelList) ? value.modelList : []
        this.modelList = deepClone(list)
        if (list.length > 0 && !this.isModelSorting) this.isExpand = true
      }
    },
    isCategorySorting(value) {
      if (value) {
        this.isExpand = false
        this.destroySortable()
      }
    },
    isModelSorting(value) {
      if (value) this.$nextTick(this.initSortable)
      else this.destroySortable()
    }
  },
  beforeDestroy() {
    this.destroySortable()
  },
  methods: {
    formatDate,
    subString,
    hasPermission(permissions) {
      try {
        return checkPermi(permissions)
      } catch (e) {
        return false
      }
    },
    handleChildSuccess() {
      this.$emit('success')
    },
    visibleScopeText(row) {
      const users = Array.isArray(row && row.startUsers) ? row.startUsers : []
      const depts = Array.isArray(row && row.startDepts) ? row.startDepts : []
      if (!users.length && !depts.length) return '全部可见'
      if (users.length === 1) return users[0].nickname || users[0].name || ''
      if (depts.length === 1) return depts[0].name || ''
      if (depts.length > 1) return `${depts[0].name || ''}等 ${depts.length} 个部门可见`
      return `${users[0].nickname || users[0].name || ''}等 ${users.length} 人可见`
    },
    isModelManager(row) {
      const ids = row && Array.isArray(row.managerUserIds) ? row.managerUserIds : []
      return ids.some((id) => String(id) === String(this.currentUserId))
    },
    async openModelForm(type, id) {
      const route = type === 'create'
        ? { name: 'BpmModelCreate' }
        : { name: 'BpmModelUpdate', params: { type, id } }
      await this.$router.push(route)
    },
    async handleFormDetail(row) {
      if (Number(row.formType) === Number(BpmModelFormType.NORMAL)) {
        const response = await FormApi.getForm(row.formId)
        const data = response.data
        setConfAndFields2(this.formDetail, data.conf, data.fields)
        this.formDetailVisible = true
      } else {
        await this.$router.push({ path: row.formCustomCreatePath })
      }
    },
    async handleDeploy(row) {
      if (!this.isModelManager(row)) return this.$message.warning('当前用户不是该流程模型的负责人')
      try {
        await this.$modal.confirm(`确认发布流程模型「${row.name}」？`)
        await ModelApi.deployModel(row.id)
        this.$modal.msgSuccess('发布成功')
        this.$emit('success')
      } catch (e) {}
    },
    async handleModelCommand(command, row) {
      if (command === 'definition') {
        return this.$router.push({ name: 'BpmProcessDefinition', query: { key: row.key } })
      }
      if (command === 'report') {
        if (!row.processDefinition) return this.$message.warning('请先发布流程')
        return this.$router.push({
          name: 'BpmProcessInstanceReport',
          query: { processDefinitionId: row.processDefinition.id, processDefinitionKey: row.key }
        })
      }
      if (!this.isModelManager(row)) return this.$message.warning('当前用户不是该流程模型的负责人')
      try {
        if (command === 'export') {
          const response = await ModelApi.exportModel(row.id)
          const data = response.data
          download.json(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `${row.key || row.name || 'model'}.json`)
          this.$modal.msgSuccess('导出成功')
        } else if (command === 'state') {
          const state = row.processDefinition && row.processDefinition.suspensionState
          const next = state === 1 ? 2 : 1
          const text = state === 1 ? '停用' : '启用'
          await this.$modal.confirm(`是否确认${text}流程名字为"${row.name}"的数据项?`)
          await ModelApi.updateModelState(row.id, next)
          this.$modal.msgSuccess(`${text}成功`)
          this.$emit('success')
        } else if (command === 'clean') {
          await this.$modal.confirm(`确认清理流程模型「${row.name}」的历史定义？`)
          await ModelApi.cleanModel(row.id)
          this.$modal.msgSuccess('清理成功')
          this.$emit('success')
        } else if (command === 'delete') {
          await this.$modal.confirm(`确认删除流程模型「${row.name}」？`)
          await ModelApi.deleteModel(row.id)
          this.$modal.msgSuccess('删除成功')
          this.$emit('success')
        }
      } catch (e) {}
    },
    handleCategoryCommand(command) {
      if (command === 'rename') this.openCategoryForm('update', this.categoryInfo.id)
      if (command === 'delete') this.handleDeleteCategory()
    },
    openCategoryForm(type, id) {
      const form = this.$refs.categoryForm
      if (form && form.open) {
        form.open(type, id, type === 'update' ? { compact: true, title: '重命名分类' } : {})
      }
    },
    async handleDeleteCategory() {
      if (this.modelList.length > 0) return this.$message.warning('该分类下仍有流程定义,不允许删除')
      try {
        await this.$modal.confirm('确认删除分类吗?')
        await CategoryApi.deleteCategory(this.categoryInfo.id)
        this.$modal.msgSuccess('删除成功')
        this.$emit('success')
      } catch (e) {}
    },
    startModelSort() {
      if (!this.canManageModels) return this.$message.warning('当前用户不是该分类下全部流程模型的负责人，无法排序')
      this.originalModelList = deepClone(this.modelList)
      this.isModelSorting = true
    },
    cancelModelSort() {
      this.modelList = deepClone(this.originalModelList)
      this.originalModelList = []
      this.isModelSorting = false
    },
    async saveModelSort() {
      if (!this.canManageModels) return this.$message.warning('当前用户不是该分类下全部流程模型的负责人，无法保存排序')
      try {
        await ModelApi.updateModelSortBatch(this.modelList.map((item) => item.id))
        this.$modal.msgSuccess('排序模型成功')
        this.isModelSorting = false
        this.originalModelList = []
        this.$emit('success')
      } catch (e) {}
    },
    initSortable() {
      const table = this.$el && this.$el.querySelector('.el-table__body-wrapper tbody')
      if (!table || this.sortable) return
      this.sortable = Sortable.create(table, {
        animation: 150,
        draggable: '.el-table__row',
        handle: '.model-drag-icon',
        onEnd: (event) => {
          const oldIndex = event.oldIndex
          const newIndex = event.newIndex !== undefined ? event.newIndex : event.newDraggableIndex
          if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
          const moved = this.modelList.splice(oldIndex, 1)[0]
          this.modelList.splice(newIndex, 0, moved)
        }
      })
    },
    destroySortable() {
      if (this.sortable) {
        this.sortable.destroy()
        this.sortable = null
      }
    }
  }
}
</script>

<style scoped>
.category-draggable-model {
  background: #fff;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 50px;
  padding: 0 20px;
}

.category-title,
.category-actions,
.model-name-cell,
.deployment-cell {
  display: flex;
  align-items: center;
}

.category-title h3 {
  margin: 0 8px 0 20px;
  font-size: 18px;
  font-weight: 600;
}

.category-title span {
  color: #606266;
  font-size: 16px;
}

.category-drag-icon,
.model-drag-icon {
  color: #8a909c;
  cursor: move;
}

.category-drag-icon {
  margin-left: 0;
  font-size: 22px;
}

.category-expand {
  margin-right: 20px;
  color: #999;
  cursor: pointer;
  transition: transform .2s;
}

.category-expand.is-expanded {
  transform: rotate(180deg);
}

.category-action {
  margin-left: 10px;
  color: #909399;
}

.model-drag-icon {
  margin-right: 10px;
}

.model-flow-image,
.flow-icon {
  width: 38px;
  height: 38px;
  margin-right: 10px;
  border-radius: 4px;
  flex: none;
}

.flow-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #409eff;
}

.flow-icon span {
  color: #fff;
  font-size: 12px;
}

.deployment-cell {
  gap: 10px;
}

.deployment-time {
  display: inline-block;
  width: 150px;
}

::v-deep .el-table__cell {
  overflow: hidden;
  border-bottom: none !important;
}
</style>
