<template>
  <dialog-component :title="'归还确认 - ' + (item.itemName || '')" v-model="dialogVisible" width="550px">
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
      <el-form-item label="实发数量">
        <el-input-number :value="item.issuedQuantity" disabled style="width: 100%" />
      </el-form-item>
      <el-form-item label="已归还数量">
        <el-input-number :value="item.returnedQuantity" disabled style="width: 100%" />
      </el-form-item>
      <el-form-item label="本次归还" prop="quantity">
        <el-input-number
          v-model="formData.quantity"
          placeholder="请输入归还数量"
          style="width: 100%"
          :min="1"
          :precision="0"
          :max="(item.issuedQuantity || 0) - (item.returnedQuantity || 0)"
        />
      </el-form-item>
      <el-form-item label="归还备注" prop="returnRemark">
        <el-input
          v-model="formData.returnRemark"
          placeholder="请输入归还备注"
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
  name: 'OaSupplyReturnForm',
  components: { DialogComponent },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      item: {},
      formData: {
        quantity: undefined,
        returnRemark: ''
      },
      formRules: {
        quantity: [{ required: true, message: '归还数量不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(row) {
      this.resetForm()
      // 设置当前归还明细，默认归还剩余数量
      this.item = row
      this.formData.quantity = (row.issuedQuantity || 0) - (row.returnedQuantity || 0)
      this.dialogVisible = true
    },
    submitForm() {
      if (!this.$refs.form) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        SupplyIssueApi.returnSupplyApplyItem(
          this.item.id,
          this.formData.quantity,
          this.formData.returnRemark
        ).then(() => {
          this.$modal.msgSuccess('归还确认成功')
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
        quantity: undefined,
        returnRemark: ''
      }
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
