<template>
  <dialog-component :title="'入库 - ' + (item.name || '')" v-model="dialogVisible" width="550px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="物品名称"><el-input :value="item.name" disabled /></el-form-item>
      <el-form-item label="当前库存">
        <el-input-number :value="item.stockQuantity" disabled style="width: 100%" />
      </el-form-item>
      <el-form-item label="入库数量" prop="quantity">
        <el-input-number
          v-model="formData.quantity"
          placeholder="请输入入库数量"
          :min="1"
          :precision="0"
          style="width: 100%"
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
import * as SupplyItemApi from '@/api/oa/supply/item'
import DialogComponent from '@/components/Dialog'

export default {
  name: 'OaSupplyStockForm',
  components: { DialogComponent },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      item: {},
      formData: { quantity: undefined },
      formRules: {
        quantity: [{ required: true, message: '入库数量不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(row) {
      this.item = row
      this.formData = { quantity: undefined }
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
      this.dialogVisible = true
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        SupplyItemApi.stockInSupplyItem(this.item.id, this.formData.quantity).then(() => {
          this.$modal.msgSuccess('入库成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    }
  }
}
</script>
