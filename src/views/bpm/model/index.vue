<template>
  <div class="app-container bpm-model-page">
    <doc-alert title="流程设计器" url="https://doc.iocoder.cn/bpm/model-designer-dingding/" />

    <div class="model-page-card">
      <div class="model-page-header">
        <h3>流程模型</h3>
        <el-form
          v-if="!isCategorySorting"
          ref="queryForm"
          :model="queryParams"
          size="small"
          :inline="true"
          class="model-search-form"
          @submit.native.prevent
        >
          <el-form-item prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="搜索流程"
              clearable
              class="model-search-input"
              prefix-icon="el-icon-search"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              v-hasPermi="['bpm:model:create']"
              type="primary"
              icon="el-icon-plus"
              @click="openModelForm('create')"
            >
              新建模型
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button
              v-hasPermi="['bpm:model:import']"
              icon="el-icon-upload2"
              @click="openImportDialog"
            >
              导入模型
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-dropdown trigger="click" placement="bottom-end" @command="handleHeaderCommand">
              <el-button plain class="model-setting-button" icon="el-icon-setting" />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="categoryAdd" v-hasPermi="['bpm:category:create']">
                  <i class="el-icon-circle-plus-outline" /> 新建分类
                </el-dropdown-item>
                <el-dropdown-item command="categorySort" v-hasPermi="['bpm:category:update']">
                  <i class="el-icon-sort" /> 分类排序
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-form-item>
        </el-form>
        <div v-else class="model-sort-actions">
          <el-button @click="cancelCategorySort">取 消</el-button>
          <el-button type="primary" @click="saveCategorySort">保存排序</el-button>
        </div>
      </div>

      <el-divider />

      <div v-loading="loading" class="model-category-list">
        <el-empty v-if="!loading && categoryGroup.length === 0" description="暂无流程模型" />
        <draggable
          v-model="categoryGroup"
          :disabled="!isCategorySorting"
          handle=".category-drag-icon"
          :animation="300"
        >
          <div
            v-for="category in categoryGroup"
            :key="category.id || category.code"
            class="model-category-card"
            :data-category-code="category.code"
          >
            <CategoryDraggableModel
              :category-info="category"
              :is-category-sorting="isCategorySorting"
              @success="getList"
            />
          </div>
        </draggable>
      </div>
    </div>

    <!-- 可复用表单：分类新增/重命名与模型 JSON 导入。 -->
    <CategoryForm ref="categoryForm" @success="getList" />
    <ModelImportForm ref="modelImportForm" @success="getList" />

    <el-dialog title="表单详情" :visible.sync="formDetailVisible" width="800px" append-to-body>
      <form-create v-if="formDetailVisible" :rule="formDetail.rule" :option="formDetail.option" />
    </el-dialog>

    <el-dialog title="流程图" :visible.sync="bpmnVisible" width="80%" append-to-body>
      <my-process-viewer v-if="bpmnXML" key="viewer" v-model="bpmnXML" :prefix="'flowable'" />
      <SimpleProcessViewer
        v-else-if="simpleModel"
        :flow-node="simpleModel"
        :tasks="[]"
      />
      <el-empty v-else description="暂无流程图" />
    </el-dialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import Sortable from 'sortablejs'
import {
  cleanModel,
  deleteModel,
  deployModel,
  exportModel,
  getModelList,
  updateModelSortBatch,
  updateModelState
} from '@/api/bpm/model'
import {
  deleteCategory,
  getCategorySimpleList,
  updateCategorySortBatch
} from '@/api/bpm/category'
import { getForm } from '@/api/bpm/form'
import { getProcessDefinition } from '@/api/bpm/definition'
import { setConfAndFields2 } from '@/utils/formCreate'
import { BpmModelFormType, BpmModelType } from '@/utils/constants'
import { deepClone, formatDate } from '@/utils'
import { SimpleProcessViewer } from '@/components/SimpleProcessDesignerV2/src'
import CategoryForm from '../category/CategoryForm.vue'
import ModelImportForm from './ModelImportForm.vue'
import CategoryDraggableModel from './CategoryDraggableModel.vue'

export default {
  name: 'BpmModel',
  components: {
    draggable,
    SimpleProcessViewer,
    CategoryForm,
    ModelImportForm,
    CategoryDraggableModel
  },
  data() {
    return {
      BpmModelFormType,
      BpmModelType,
      loading: false,
      queryParams: {
        name: ''
      },
      categoryGroup: [],
      originalCategoryGroup: [],
      isCategorySorting: false,
      formDetailVisible: false,
      formDetail: {
        rule: [],
        option: {}
      },
      bpmnVisible: false,
      bpmnXML: '',
      simpleModel: null
    }
  },
  computed: {
    // Hide an empty “更多” menu for roles that cannot perform any model
    // operation. Each child item still has its own v-hasPermi guard so mixed
    // permission roles only see actions granted by the backend.
    hasModelMorePermission() {
      const permissions = this.$store.getters && this.$store.getters.permissions
      if (!Array.isArray(permissions)) {
        return false
      }
      if (permissions.includes('*:*:*')) {
        return true
      }
      return [
        'bpm:process-definition:query',
        'bpm:model:export',
        'bpm:process-instance:manager-query',
        'bpm:model:update',
        'bpm:model:clean',
        'bpm:model:delete'
      ].some((permission) => permissions.includes(permission))
    },
    currentUserId() {
      return this.$store.getters && this.$store.getters.userId
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatDate,
    subString(str, start, end) {
      if (!str) {
        return ''
      }
      return str.length > end ? str.slice(start, end) : str
    },
    tableHeaderStyle() {
      return {
        backgroundColor: '#edeff0',
        paddingLeft: '10px'
      }
    },
    tableCellStyle() {
      return {
        paddingLeft: '10px'
      }
    },
    async getList() {
      this.isCategorySorting = false
      this.originalCategoryGroup = []
      this.loading = true
      try {
        const [modelResp, categoryResp] = await Promise.all([
          getModelList(this.queryParams.name || undefined),
          getCategorySimpleList()
        ])
        this.buildCategoryGroup(modelResp.data, categoryResp.data)
      } finally {
        this.loading = false
      }
    },
    buildCategoryGroup(modelList, categoryList) {
      const previousMap = {}
      this.categoryGroup.forEach((item) => {
        previousMap[item.code] = item
      })
      const group = categoryList.map((category) => {
        const prev = previousMap[category.code] || {}
        return {
          ...category,
          expanded: prev.expanded !== undefined ? prev.expanded : true,
          isModelSorting: false,
          originalModelList: [],
          modelList: modelList.filter((model) => model.categoryName === category.name || model.category === category.code)
        }
      })
      const groupedIds = new Set(group.reduce((result, item) => {
        return result.concat(item.modelList.map((model) => model.id))
      }, []))
      const otherModels = modelList.filter((model) => !groupedIds.has(model.id))
      if (otherModels.length > 0) {
        group.push({
          id: '__empty__',
          code: '__empty__',
          name: '未分类',
          expanded: true,
          isModelSorting: false,
          originalModelList: [],
          modelList: otherModels
        })
      }
      this.categoryGroup = group
    },
    handleHeaderCommand(command) {
      if (command === 'categoryAdd') {
        this.openCategoryForm('create')
      } else if (command === 'categorySort') {
        this.startCategorySort()
      }
    },
    startCategorySort() {
      this.originalCategoryGroup = deepClone(this.categoryGroup)
      this.categoryGroup.forEach((category) => {
        category.expanded = false
      })
      this.isCategorySorting = true
    },
    cancelCategorySort() {
      this.categoryGroup = deepClone(this.originalCategoryGroup)
      this.originalCategoryGroup = []
      this.isCategorySorting = false
    },
    async saveCategorySort() {
      const ids = this.categoryGroup
        .map((item) => item.id)
        .filter((id) => id && id !== '__empty__')
      await updateCategorySortBatch(ids)
      this.$modal.msgSuccess('排序分类成功')
      this.isCategorySorting = false
      this.originalCategoryGroup = []
      this.getList()
    },
    handleQuery() {
      this.getList()
    },
    openModelForm(type, id) {
      const route = type === 'create'
        ? { name: 'BpmModelCreate' }
        : { name: 'BpmModelUpdate', params: { type, id }}
      this.$router.push(route)
    },
    openImportDialog() {
      const form = this.$refs.modelImportForm
      if (form && form.open) {
        form.open()
      }
    },
    async handleExport(row) {
      try {
        const response = await exportModel(row.id)
        const data = response.data
        const fileName = `${row.key || row.name || 'model'}.json`
        this.$download.json(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), fileName)
        this.$modal.msgSuccess('导出成功')
      } catch (e) {
        // request interceptor already displays the backend error
      }
    },
    async startModelSort(category) {
      if (!this.canManageModels(category)) {
        this.$message.warning('当前用户不是该分类下全部流程模型的负责人，无法排序')
        return
      }
      category.originalModelList = deepClone(category.modelList)
      category.isModelSorting = true
      await this.$nextTick()
      this.initModelSort(category)
    },
    initModelSort(category) {
      const table = this.$el.querySelector(`[data-category-code="${category.code}"] .el-table__body-wrapper tbody`)
      if (!table || table._sortable) {
        return
      }
      table._sortable = Sortable.create(table, {
        animation: 150,
        draggable: '.el-table__row',
        handle: '.model-drag-icon',
        onEnd: ({ newIndex, oldIndex }) => {
          if (oldIndex === newIndex) {
            return
          }
          category.modelList.splice(newIndex, 0, category.modelList.splice(oldIndex, 1)[0])
        }
      })
    },
    cancelModelSort(category) {
      category.modelList = deepClone(category.originalModelList)
      category.originalModelList = []
      category.isModelSorting = false
    },
    async saveModelSort(category) {
      if (!this.canManageModels(category)) {
        this.$message.warning('当前用户不是该分类下全部流程模型的负责人，无法保存排序')
        return
      }
      const ids = category.modelList.map((item) => item.id)
      await updateModelSortBatch(ids)
      this.$modal.msgSuccess('排序模型成功')
      category.isModelSorting = false
      category.originalModelList = []
      this.getList()
    },
    async handleDeploy(row) {
      if (!this.isModelManager(row)) {
        this.$message.warning('当前用户不是该流程模型的负责人')
        return
      }
      await this.$modal.confirm(`确认发布流程模型「${row.name}」？`)
      await deployModel(row.id)
      this.$modal.msgSuccess('发布成功')
      this.getList()
    },
    async handleChangeState(row) {
      if (!this.isModelManager(row)) {
        this.$message.warning('当前用户不是该流程模型的负责人')
        return
      }
      const state = row.processDefinition.suspensionState
      const newState = state === 1 ? 2 : 1
      const text = state === 1 ? '停用' : '启用'
      await this.$modal.confirm(`是否确认${text}流程名字为"${row.name}"的数据项?`)
      await updateModelState(row.id, newState)
      this.$modal.msgSuccess(`${text}成功`)
      this.getList()
    },
    handleDefinitionList(row) {
      this.$router.push({
        name: 'BpmProcessDefinition',
        query: { key: row.key }
      })
    },
    handleReport(row) {
      if (!row.processDefinition) {
        this.$message.warning('请先发布流程')
        return
      }
      this.$router.push({
        name: 'BpmProcessInstanceReport',
        query: {
          processDefinitionId: row.processDefinition.id,
          processDefinitionKey: row.key
        }
      })
    },
    handleModelCommand(command, row) {
      if (command === 'definition') {
        this.handleDefinitionList(row)
      } else if (command === 'report') {
        this.handleReport(row)
      } else if (command === 'export') {
        this.handleExport(row)
      } else if (command === 'state') {
        this.handleChangeState(row)
      } else if (command === 'clean') {
        this.handleClean(row)
      } else if (command === 'delete') {
        this.handleDelete(row)
      }
    },
    handleCategoryCommand(command, category) {
      if (command === 'rename') {
        this.openCategoryForm('rename', category)
      } else if (command === 'delete') {
        this.handleDeleteCategory(category)
      }
    },
    openCategoryForm(mode, category) {
      const form = this.$refs.categoryForm
      if (!form || !form.open) {
        return
      }
      if (mode === 'create') {
        form.open('create')
      } else if (category && category.id !== '__empty__') {
        // 模型页的分类操作只允许修改名称，复用完整分类表单的紧凑模式。
        form.open('update', category.id, {
          compact: true,
          title: '重命名分类'
        })
      }
    },
    async handleDeleteCategory(category) {
      if (category.modelList.length > 0) {
        this.$message.warning('该分类下仍有流程定义,不允许删除')
        return
      }
      await this.$modal.confirm('确认删除分类吗?')
      await deleteCategory(category.id)
      this.$modal.msgSuccess('删除成功')
      this.getList()
    },
    visibleScopeText(row) {
      const users = row.startUsers || []
      const depts = row.startDepts || []
      if (users.length === 0 && depts.length === 0) {
        return '全部可见'
      }
      if (users.length === 1) {
        return users[0].nickname || users[0].name
      }
      if (depts.length === 1) {
        return depts[0].name
      }
      if (depts.length > 1) {
        return `${depts[0].name}等 ${depts.length} 个部门可见`
      }
      return `${users[0].nickname || users[0].name}等 ${users.length} 人可见`
    },
    async handleFormDetail(row) {
      if (row.formId) {
        const response = await getForm(row.formId)
        const data = response.data
        setConfAndFields2(this.formDetail, data.conf, data.fields)
        this.formDetail.option.submitBtn = false
        this.formDetail.option.resetBtn = false
        this.formDetailVisible = true
      } else if (row.formCustomCreatePath) {
        this.$router.push({ path: row.formCustomCreatePath })
      } else {
        this.$message.info('该模型未配置表单')
      }
    },
    async handleBpmnDetail(row) {
      this.bpmnXML = ''
      this.simpleModel = null
      if (Number(row.type) === Number(BpmModelType.SIMPLE) && row.simpleModel) {
        try {
          this.simpleModel = typeof row.simpleModel === 'string' ? JSON.parse(row.simpleModel) : row.simpleModel
        } catch (e) {
          this.$message.warning('流程模型数据不是有效的 JSON，无法预览')
          return
        }
        this.bpmnVisible = true
        return
      }
      if (row.processDefinition && row.processDefinition.id) {
        const response = await getProcessDefinition(row.processDefinition.id)
        const definition = response.data
        this.bpmnXML = definition.bpmnXml || ''
        this.bpmnVisible = true
      } else if (row.bpmnXml) {
        this.bpmnXML = row.bpmnXml
        this.bpmnVisible = true
      } else {
        this.$message.info('暂无可预览的流程图')
      }
    },
    async handleClean(row) {
      if (!this.isModelManager(row)) {
        this.$message.warning('当前用户不是该流程模型的负责人')
        return
      }
      await this.$modal.confirm(`确认清理流程模型「${row.name}」的历史定义？`)
      await cleanModel(row.id)
      this.$modal.msgSuccess('清理成功')
      this.getList()
    },
    async handleDelete(row) {
      if (!this.isModelManager(row)) {
        this.$message.warning('当前用户不是该流程模型的负责人')
        return
      }
      await this.$modal.confirm(`确认删除流程模型「${row.name}」？`)
      await deleteModel(row.id)
      this.$modal.msgSuccess('删除成功')
      this.getList()
    },
    isModelManager(row) {
      const managerIds = row && row.managerUserIds
      if (!Array.isArray(managerIds)) {
        return false
      }
      return managerIds.some((id) => String(id) === String(this.currentUserId))
    },
    canManageModels(category) {
      const models = category && Array.isArray(category.modelList) ? category.modelList : []
      return models.length > 0 && models.every((model) => this.isModelManager(model))
    }
  }
}
</script>

<style lang="scss" scoped>
.bpm-model-page {
  .model-page-card {
    background: #fff;
    border-radius: 4px;
    padding: 0 15px 15px;
  }

  .model-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 56px;
    padding-left: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
    }
  }

  .model-search-form {
    display: flex;
    align-items: center;
    margin-right: 10px;

    ::v-deep .el-form-item {
      margin-right: 10px;
      margin-bottom: 0;
    }
  }

  .model-search-input {
    width: 240px;
  }

  .model-setting-button {
    width: 30px;
    padding-left: 0;
    padding-right: 0;
  }

  .model-sort-actions {
    margin-right: 20px;
  }

  ::v-deep .el-divider--horizontal {
    margin-top: 6px;
  }

  .model-category-list {
    padding: 0 15px;
  }

  .model-category-card {
    margin-bottom: 16px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }

  .model-category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
  }

  .model-category-title {
    display: flex;
    align-items: center;

    h3 {
      margin: 0 8px 0 20px;
      font-size: 18px;
      font-weight: 600;
    }

    span {
      color: #606266;
      font-size: 16px;
    }
  }

  .category-drag-icon,
  .model-drag-icon {
    color: #8a909c;
    cursor: move;
  }

  .category-drag-icon {
    margin-left: 10px;
    font-size: 22px;
  }

  .category-expand-icon {
    margin-left: 20px;
    color: #999;
    cursor: pointer;
  }

  .model-category-actions {
    display: flex;
    align-items: center;
    margin-right: 45px;
  }

  .model-muted-action {
    margin-right: 20px;
    color: #909399;
  }

  .model-name-cell {
    display: flex;
    align-items: center;
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
    background-color: #409eff;

    span {
      color: #fff;
      font-size: 12px;
    }
  }

  .model-deployment-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .model-deployment-time {
    display: inline-block;
    width: 150px;
  }

  ::v-deep .el-table__cell {
    overflow: hidden;
    border-bottom: none !important;
  }
}
</style>
