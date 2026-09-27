<template>
  <div>
    <el-dialog title="选择结转模板" :visible.sync="dialogVisible" width="760px" append-to-body>
      <div class="template-toolbar">
        <el-tabs v-model="category" class="category-tabs">
          <el-tab-pane
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :name="String(item.value)"
          />
        </el-tabs>
        <el-dropdown
          v-if="isWritable"
          v-hasPermi="['fms:closing:update']"
          trigger="click"
          @command="handleCreate"
        >
          <el-button type="primary" plain>
            <i class="el-icon-plus" />新增<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="template">新增模板</el-dropdown-item>
            <el-dropdown-item command="scheme">新增方案</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

      <el-table
        v-loading="loading"
        :data="filteredTemplates"
        border
        stripe
        highlight-current-row
        @row-dblclick="selectTemplate"
      >
        <el-table-column label="模板名称" prop="name" min-width="260" />
        <el-table-column label="分录数" align="center" width="90">
          <template slot-scope="scope">{{ (scope.row.subjects || []).length }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="210">
          <template slot-scope="scope">
            <el-button type="text" @click="selectTemplate(scope.row)">使用</el-button>
            <template v-if="isWritable">
              <el-button
                v-hasPermi="['fms:closing:update']"
                type="text"
                @click="$refs.templateForm.open('update', scope.row)"
              >编辑</el-button>
              <el-button
                v-hasPermi="['fms:closing:update']"
                type="text"
                class="danger-text"
                @click="deleteTemplate(scope.row)"
              >删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="template-tip">双击模板可直接进入结账方案表单</div>
    </el-dialog>

    <ClosingTemplateForm
      ref="templateForm"
      :account-set-id="accountSetId"
      :subjects="subjects"
      @success="getList"
    />
  </div>
</template>

<script>
import { FmsClosingTemplateApi } from '@/api/fms/closing/template'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {
  FMS_CLOSING_TEMPLATE_CATEGORY,
  FMS_CLOSING_TEMPLATE_CATEGORY_OPTIONS
} from '@/views/fms/utils/constants'

import ClosingTemplateForm from './ClosingTemplateForm.vue'

function categoryOptions() {
  const options = getDictDatas(DICT_TYPE.FMS_CLOSING_TEMPLATE_CATEGORY)
    .map(item => ({ label: item.label, value: Number(item.value) }))
    .filter(item => Number.isFinite(item.value))
  return options.length ? options : FMS_CLOSING_TEMPLATE_CATEGORY_OPTIONS
}

export default {
  name: 'FmsClosingTemplateSelect',
  components: { ClosingTemplateForm },
  props: {
    accountSetId: { type: Number, required: true },
    subjects: { type: Array, required: true },
    isWritable: { type: Boolean, required: true }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      category: String(FMS_CLOSING_TEMPLATE_CATEGORY.DAILY_EXPENSE),
      templates: [],
      categoryOptions: categoryOptions(),
      requestSequence: 0
    }
  },
  computed: {
    filteredTemplates() {
      return this.templates.filter(item => Number(item.category) === Number(this.category))
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    open() {
      this.category = String(FMS_CLOSING_TEMPLATE_CATEGORY.DAILY_EXPENSE)
      this.dialogVisible = true
      return this.getList()
    },
    getList() {
      const sequence = ++this.requestSequence
      this.loading = true
      return FmsClosingTemplateApi.getClosingTemplateList(this.accountSetId).then(response => {
        if (sequence !== this.requestSequence) return
        const rows = response.data
        this.templates = rows
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    },
    selectTemplate(template) {
      this.$emit('select', template)
      this.dialogVisible = false
    },
    createBlankScheme() {
      this.$emit('select')
      this.dialogVisible = false
    },
    handleCreate(command) {
      if (command === 'template') {
        this.$refs.templateForm.open('create', undefined, Number(this.category))
        return
      }
      this.createBlankScheme()
    },
    deleteTemplate(template) {
      if (!template.id) return
      this.$modal.confirm('确认删除结账模板“' + template.name + '”吗？').then(() => {
        return FmsClosingTemplateApi.deleteClosingTemplate(this.accountSetId, template.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.template-toolbar { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; }
.category-tabs { min-width: 0; flex: 1; }
.category-tabs ::v-deep .el-tabs__header { margin: 0; }
.category-tabs ::v-deep .el-tabs__content { display: none; }
.template-tip { margin-top: 12px; color: #909399; font-size: 12px; }
.danger-text { color: #f56c6c; }
</style>
