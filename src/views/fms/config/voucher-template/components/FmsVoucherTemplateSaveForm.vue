<template>
  <el-dialog :visible.sync="dialogVisible" append-to-body title="新增凭证模板" width="480px">
    <el-form ref="form" :model="formData" :rules="formRules" label-width="90px">
      <el-form-item label="模板分类" prop="categoryId">
        <fms-voucher-template-category-select
          v-model="formData.categoryId"
          :account-set-id="accountSetId"
          :categories="categories"
          @change="handleCategoryChange"
        />
      </el-form-item>
      <el-form-item label="模板名称" prop="name">
        <el-input v-model="formData.name" maxlength="255" placeholder="请输入模板名称" />
      </el-form-item>
      <el-form-item label="保存金额">
        <el-checkbox v-model="saveMoney">保留数量、单价和借贷金额</el-checkbox>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button :loading="submitting" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsVoucherTemplateApi } from '@/api/fms/config/voucher-template'
import { FmsVoucherTemplateCategoryApi } from '@/api/fms/config/voucher-template-category'

import FmsVoucherTemplateCategorySelect from './FmsVoucherTemplateCategorySelect.vue'

export default {
  name: 'FmsVoucherTemplateSaveForm',
  components: { FmsVoucherTemplateCategorySelect },
  data() {
    return {
      dialogVisible: false,
      submitting: false,
      accountSetId: undefined,
      sourceEntries: [],
      categories: [],
      saveMoney: false,
      formData: { categoryId: undefined, name: '' },
      formRules: {
        categoryId: [{ required: true, message: '请选择模板分类', trigger: 'change' }],
        name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }]
      },
      requestSequence: 0
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    open(id, entries) {
      this.accountSetId = Number(id) || undefined
      this.sourceEntries = this.cloneEntries(entries)
      this.formData.categoryId = undefined
      this.formData.name = ''
      this.saveMoney = false
      this.categories = []
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      return this.getCategoryList().then(() => {
        this.formData.categoryId = this.categories[0] && this.categories[0].id
      })
    },
    cloneEntries(entries) {
      return (Array.isArray(entries) ? entries : []).map(entry => Object.assign({}, entry, {
        auxiliaries: (Array.isArray(entry.auxiliaries) ? entry.auxiliaries : [])
          .map(item => Object.assign({}, item))
      }))
    },
    getCategoryList() {
      const accountSetId = Number(this.accountSetId) || 0
      const sequence = ++this.requestSequence
      if (!accountSetId) {
        this.categories = []
        return Promise.resolve()
      }
      return FmsVoucherTemplateCategoryApi.getVoucherTemplateCategorySimpleList(accountSetId)
        .then(response => {
          if (sequence !== this.requestSequence || accountSetId !== Number(this.accountSetId)) return
          const rows = response.data
          this.categories = rows
        })
    },
    handleCategoryChange(nextCategories) {
      this.categories = Array.isArray(nextCategories) ? nextCategories : []
      if (this.formData.categoryId && !this.categories.some(item => Number(item.id) === Number(this.formData.categoryId))) {
        this.formData.categoryId = undefined
      }
    },
    buildEntries() {
      return this.sourceEntries.map(entry => Object.assign({}, entry, {
        quantity: this.saveMoney ? entry.quantity : undefined,
        unitPrice: this.saveMoney ? entry.unitPrice : undefined,
        debitAmount: this.saveMoney ? entry.debitAmount : undefined,
        creditAmount: this.saveMoney ? entry.creditAmount : undefined,
        auxiliaries: (Array.isArray(entry.auxiliaries) ? entry.auxiliaries : []).map(item => ({
          typeId: item.typeId,
          itemId: item.itemId
        }))
      }))
    },
    submitForm() {
      if (!this.$refs.form) return
      this.$refs.form.validate(valid => {
        if (!valid || !this.accountSetId || !this.formData.categoryId) return
        this.submitting = true
        FmsVoucherTemplateApi.createVoucherTemplate({
          accountSetId: Number(this.accountSetId),
          categoryId: this.formData.categoryId,
          name: this.formData.name,
          entries: this.buildEntries()
        }).then(() => {
          this.$modal.msgSuccess('保存成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.submitting = false
        })
      })
    }
  }
}
</script>
