<template>
  <el-dialog :visible.sync="dialogVisible" append-to-body title="凭证模板分类" width="560px">
    <el-form
      ref="categoryForm"
      :model="categoryFormData"
      :rules="categoryFormRules"
      class="category-form"
    >
      <el-form-item class="category-name-field" prop="name">
        <el-input
          v-model="categoryFormData.name"
          maxlength="255"
          placeholder="请输入分类名称"
        />
      </el-form-item>
      <div class="category-form-actions">
        <el-button
          v-if="categoryFormData.id && isWritable"
          v-hasPermi="['fms:config:voucher-template-category:update']"
          :loading="submitting"
          type="primary"
          @click="saveCategory"
        >保存</el-button>
        <el-button
          v-else-if="isWritable"
          v-hasPermi="['fms:config:voucher-template-category:create']"
          :loading="submitting"
          type="primary"
          @click="saveCategory"
        >新增</el-button>
        <el-button v-if="categoryFormData.id" @click="resetCategoryForm">取消</el-button>
      </div>
    </el-form>

    <el-table :data="categories" border stripe @row-dblclick="selectCategory">
      <el-table-column label="分类名称" min-width="260" prop="name" />
      <el-table-column align="center" label="操作" width="150">
        <template slot-scope="scope">
          <el-button
            v-if="isWritable"
            v-hasPermi="['fms:config:voucher-template-category:update']"
            type="text"
            @click="editCategory(scope.row)"
          >编辑</el-button>
          <el-button
            v-if="isWritable"
            v-hasPermi="['fms:config:voucher-template-category:delete']"
            class="danger-text"
            type="text"
            @click="deleteCategory(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="category-tip">双击分类可直接选中</div>
  </el-dialog>
</template>

<script>
import { FmsVoucherTemplateCategoryApi } from '@/api/fms/config/voucher-template-category'
import { FMS_ACCOUNT_SET_CACHE_KEY } from '@/views/fms/utils/context'

export default {
  name: 'FmsVoucherTemplateCategoryManage',
  props: {
    accountSetId: { type: [Number, String], default: undefined }
  },
  data() {
    return {
      dialogVisible: false,
      submitting: false,
      isWritable: false,
      categories: [],
      categoryFormData: { id: undefined, name: '' },
      categoryFormRules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      requestSequence: 0
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    open() {
      this.resetCategoryForm()
      this.isWritable = this.readWritableStatus()
      this.dialogVisible = true
      return this.getCategoryList()
    },
    readWritableStatus() {
      try {
        const current = JSON.parse(localStorage.getItem(FMS_ACCOUNT_SET_CACHE_KEY) || 'null')
        return Boolean(current && Number(current.id) === Number(this.accountSetId) &&
          [1, 3].includes(Number(current.level)))
      } catch (error) {
        return false
      }
    },
    getCategoryList() {
      const accountSetId = Number(this.accountSetId) || 0
      const sequence = ++this.requestSequence
      if (!accountSetId) {
        this.categories = []
        this.$emit('change', [])
        return Promise.resolve()
      }
      return FmsVoucherTemplateCategoryApi.getVoucherTemplateCategoryList(accountSetId).then(response => {
        if (sequence !== this.requestSequence || accountSetId !== Number(this.accountSetId)) return
        const rows = response.data
        this.categories = rows
        this.$emit('change', this.categories)
      })
    },
    editCategory(row) {
      this.categoryFormData.id = row.id
      this.categoryFormData.name = row.name
      this.$nextTick(() => this.$refs.categoryForm && this.$refs.categoryForm.clearValidate())
    },
    resetCategoryForm() {
      this.categoryFormData.id = undefined
      this.categoryFormData.name = ''
      this.$nextTick(() => this.$refs.categoryForm && this.$refs.categoryForm.resetFields())
    },
    saveCategory() {
      if (!this.accountSetId || !this.isWritable || !this.$refs.categoryForm) return
      this.$refs.categoryForm.validate(valid => {
        if (!valid) return
        this.submitting = true
        const payload = {
          accountSetId: Number(this.accountSetId),
          name: this.categoryFormData.name
        }
        const operation = this.categoryFormData.id
          ? FmsVoucherTemplateCategoryApi.updateVoucherTemplateCategory(Object.assign({ id: this.categoryFormData.id }, payload))
          : FmsVoucherTemplateCategoryApi.createVoucherTemplateCategory(payload)
        operation.then(response => {
          const createdCategoryId = response.data
          this.$modal.msgSuccess(this.categoryFormData.id ? '修改成功' : '新增成功')
          const isCreate = !this.categoryFormData.id
          this.resetCategoryForm()
          return this.getCategoryList().then(() => {
            if (isCreate && createdCategoryId) this.$emit('select', createdCategoryId)
          })
        }).finally(() => {
          this.submitting = false
        })
      })
    },
    deleteCategory(row) {
      if (!this.accountSetId || !this.isWritable) return
      this.$modal.confirm('确认删除该模板分类吗？').then(() => {
        return FmsVoucherTemplateCategoryApi.deleteVoucherTemplateCategory(Number(this.accountSetId), row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        if (Number(this.categoryFormData.id) === Number(row.id)) this.resetCategoryForm()
        return this.getCategoryList()
      }).catch(() => {})
    },
    selectCategory(row) {
      if (!row || !row.id) return
      this.$emit('select', row.id)
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.category-form { display: flex; width: 100%; gap: 8px; margin-bottom: 16px; }
.category-name-field { flex: 1; margin-bottom: 0; }
.category-form-actions { display: flex; }
.category-tip { margin-top: 10px; color: #909399; font-size: 12px; }
.danger-text { color: #f56c6c; }
</style>
