<template>
  <dialog-component :title="'发放 - ' + (item.itemName || '')" v-model="dialogVisible" width="550px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="物品名称">
        <el-input :value="item.itemName" disabled />
      </el-form-item>
      <el-form-item label="申请数量">
        <el-input-number :value="item.applyQuantity" disabled style="width: 100%" />
      </el-form-item>
      <el-form-item label="实发数量" prop="issuedQuantity">
        <el-input-number
          v-model="formData.issuedQuantity"
          placeholder="请输入实发数量"
          :min="1"
          :precision="0"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="发放备注" prop="issueRemark">
        <el-input
          v-model="formData.issueRemark"
          placeholder="请输入发放备注"
          type="textarea"
          :rows="3"
          maxlength="500"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </dialog-component>
</template>

<script>
import * as SupplyIssueApi from '@/api/oa/supply/issue'
import DialogComponent from '@/components/Dialog'

export default {
  name: 'OaSupplyIssueForm',
  components: { DialogComponent },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      item: {},
      formData: {},
      formRules: {
        issuedQuantity: [{ required: true, message: '实发数量不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(row) {
      this.resetForm()
      // 设置当前发放明细，默认按申请数量发放
      this.item = row
      this.formData.id = row.id
      this.formData.issuedQuantity = row.applyQuantity
      this.dialogVisible = true
    },
    submitForm() {
      if (!this.$refs.form) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        SupplyIssueApi.issueSupplyApplyItem(this.formData).then(() => {
          this.$modal.msgSuccess('发放成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.item = {}
      this.formData = {
        id: undefined,
        issuedQuantity: undefined,
        issueRemark: ''
      }
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
