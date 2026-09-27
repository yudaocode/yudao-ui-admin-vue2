<template>
  <div class="app-container fms-voucher-template-page">
    <doc-alert title="【设置】凭证字、常用摘要、凭证模板" url="https://doc.iocoder.cn/fms/config/voucher/" />

    <el-form :inline="true" class="account-set-toolbar" label-width="78px">
      <el-form-item label="当前账套">
        <el-select
          v-model="accountSetId"
          clearable
          filterable
          placeholder="请选择账套"
          style="width: 240px"
          @change="handleAccountSetChange"
        >
          <el-option
            v-for="item in accountSets"
            :key="item.id"
            :label="item.companyName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <el-alert
      v-if="!accountSetId"
      class="account-set-alert"
      :closable="false"
      show-icon
      title="请先选择已初始化的账套"
      type="info"
    />

    <div class="template-grid">
      <el-card class="category-card" shadow="never">
        <div class="card-header">
          <span class="card-title">凭证模板分类</span>
          <el-button
            v-if="isWritable"
            v-hasPermi="['fms:config:voucher-template-category:create']"
            icon="el-icon-plus"
            plain
            size="mini"
            type="primary"
            @click="openCategoryForm('create')"
          >新增</el-button>
        </div>
        <el-table
          ref="categoryTable"
          v-loading="loading"
          :data="categories"
          :show-header="false"
          highlight-current-row
          row-key="id"
          @row-click="handleCategoryChange"
        >
          <el-table-column min-width="230">
            <template slot-scope="scope">
              <div class="category-row">
                <div class="category-name">
                  <span class="truncate">{{ scope.row.name }}</span>
                  <el-tag class="template-count" size="mini">
                    {{ getCategoryTemplateCount(scope.row.id) }}
                  </el-tag>
                </div>
                <div class="category-actions">
                  <el-tooltip content="编辑" placement="top">
                    <el-button
                      v-if="isWritable"
                      v-hasPermi="['fms:config:voucher-template-category:update']"
                      icon="el-icon-edit"
                      type="text"
                      @click.stop="openCategoryForm('update', scope.row)"
                    />
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-button
                      v-if="isWritable"
                      v-hasPermi="['fms:config:voucher-template-category:delete']"
                      class="danger-text"
                      icon="el-icon-delete"
                      type="text"
                      @click.stop="handleDeleteCategory(scope.row)"
                    />
                  </el-tooltip>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="template-card" shadow="never">
        <div class="card-title template-title">凭证模板</div>
        <el-table
          v-loading="loading"
          :data="currentTemplates"
          :empty-text="currentCategory ? '暂无凭证模板' : '请选择凭证模板分类'"
          stripe
        >
          <el-table-column label="模板名称" min-width="260" prop="name" show-overflow-tooltip />
          <el-table-column align="center" label="分录数" width="100">
            <template slot-scope="scope">{{ (scope.row.entries || []).length }}</template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="120">
            <template slot-scope="scope">
              <el-button
                v-if="isWritable"
                v-hasPermi="['fms:config:voucher-template:delete']"
                class="danger-text"
                type="text"
                @click="handleDeleteTemplate(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <fms-voucher-template-category-form ref="categoryForm" @success="getList" />
  </div>
</template>

<script>
import { getAccountSetList } from '@/api/fms/config/account-set'
import { FmsVoucherTemplateApi } from '@/api/fms/config/voucher-template'
import { FmsVoucherTemplateCategoryApi } from '@/api/fms/config/voucher-template-category'
import { readFmsAccountSetId, saveFmsAccountSet } from '@/views/fms/utils/context'
import FmsVoucherTemplateCategoryForm from './FmsVoucherTemplateCategoryForm.vue'

export default {
  name: 'FmsVoucherTemplate',
  components: { FmsVoucherTemplateCategoryForm },
  data() {
    return {
      loading: false,
      accountSets: [],
      accountSetId: readFmsAccountSetId(this.$route),
      templates: [],
      categories: [],
      currentCategory: null,
      requestSequence: 0
    }
  },
  computed: {
    currentAccountSet() {
      return this.accountSets.find(item => Number(item.id) === Number(this.accountSetId)) || null
    },
    isWritable() {
      return Boolean(this.currentAccountSet && [1, 3].includes(Number(this.currentAccountSet.level)))
    },
    currentTemplates() {
      if (!this.currentCategory) return []
      return this.templates.filter(item => Number(item.categoryId) === Number(this.currentCategory.id))
    }
  },
  created() {
    this.loadAccountSets()
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    loadAccountSets() {
      return getAccountSetList().then(response => {
        const rows = response.data
        this.accountSets = rows.filter(item => item && item.initialized !== false)
        if (!this.accountSetId || !this.accountSets.some(item => Number(item.id) === Number(this.accountSetId))) {
          const preferred = this.accountSets.find(item => item.defaultStatus) || this.accountSets[0]
          this.accountSetId = preferred ? preferred.id : 0
        }
        if (this.currentAccountSet) saveFmsAccountSet(this.currentAccountSet)
        return this.getList()
      })
    },
    handleAccountSetChange(id) {
      const current = this.accountSets.find(item => Number(item.id) === Number(id))
      if (current) saveFmsAccountSet(current)
      this.templates = []
      this.categories = []
      this.currentCategory = null
      return this.getList()
    },
    getList() {
      const accountSetId = Number(this.accountSetId) || 0
      const sequence = ++this.requestSequence
      if (!accountSetId) {
        this.templates = []
        this.categories = []
        this.currentCategory = null
        this.loading = false
        return Promise.resolve()
      }
      this.loading = true
      return Promise.all([
        FmsVoucherTemplateApi.getVoucherTemplateList(accountSetId),
        FmsVoucherTemplateCategoryApi.getVoucherTemplateCategoryList(accountSetId)
      ]).then(responses => {
        if (sequence !== this.requestSequence || accountSetId !== Number(this.accountSetId)) return
        const templates = responses[0].data
        const categories = responses[1].data
        this.templates = templates
        this.categories = categories
        const currentId = this.currentCategory && this.currentCategory.id
        this.currentCategory = this.categories.find(item => Number(item.id) === Number(currentId)) ||
          this.categories[0] || null
        this.$nextTick(() => {
          if (this.$refs.categoryTable) this.$refs.categoryTable.setCurrentRow(this.currentCategory)
        })
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    },
    getCategoryTemplateCount(categoryId) {
      return this.templates.filter(item => Number(item.categoryId) === Number(categoryId)).length
    },
    handleCategoryChange(row) {
      this.currentCategory = row
    },
    openCategoryForm(type, row) {
      if (!this.accountSetId || !this.isWritable) return
      this.$refs.categoryForm.open(type, Number(this.accountSetId), row)
    },
    handleDeleteCategory(row) {
      if (!this.accountSetId || !this.isWritable) return
      this.$modal.confirm('确认删除凭证模板分类“' + row.name + '”吗？').then(() => {
        return FmsVoucherTemplateCategoryApi.deleteVoucherTemplateCategory(Number(this.accountSetId), row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    },
    handleDeleteTemplate(row) {
      if (!this.accountSetId || !this.isWritable) return
      this.$modal.confirm('确认删除凭证模板“' + row.name + '”吗？').then(() => {
        return FmsVoucherTemplateApi.deleteVoucherTemplate(Number(this.accountSetId), row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.account-set-toolbar { margin-bottom: 12px; }
.account-set-alert { margin-bottom: 12px; }
.template-grid { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 16px; }
.category-card, .template-card { min-width: 0; }
.card-header, .category-row, .category-name { display: flex; align-items: center; }
.card-header, .category-row { justify-content: space-between; }
.card-header { margin-bottom: 16px; }
.card-title { font-size: 16px; font-weight: 600; }
.template-title { margin-bottom: 16px; }
.category-name { min-width: 0; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.template-count { flex-shrink: 0; margin-left: 6px; }
.category-actions { display: flex; flex-shrink: 0; margin-left: 4px; }
.category-actions .el-button { margin-left: 4px; padding: 4px; }
.danger-text { color: #f56c6c; }
@media (max-width: 900px) {
  .template-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
