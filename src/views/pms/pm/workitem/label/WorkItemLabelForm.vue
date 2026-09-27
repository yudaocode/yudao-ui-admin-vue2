<template>
  <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="460px" append-to-body>
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <el-form-item label="标签名称" prop="name">
        <el-input v-model="formData.name" maxlength="50" placeholder="请输入标签名称" />
      </el-form-item>
      <el-form-item label="标签颜色" prop="color">
        <el-color-picker v-model="formData.color" />
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script>
import * as WorkItemLabelApi from '@/api/pms/pm/workitem/label'

export default {
  name: 'PmsWorkItemLabelForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formData: { name: '', color: '#409EFF' },
      formRules: {
        name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
        color: [{ required: true, message: '请选择标签颜色', trigger: 'change' }]
      }
    }
  },
  methods: {
    async open(id) {
      this.dialogVisible = true
      this.dialogTitle = id ? '编辑标签' : '新增标签'
      this.resetForm()
      await this.$nextTick()
      if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      if (!id) return
      const response = await WorkItemLabelApi.getWorkItemLabelList()
      const label = response.data.find(item => item.id === id)
      if (label) this.formData = { ...label }
    },
    async submitForm() {
      if (!this.$refs.formRef || this.formLoading) return
      const valid = await new Promise(resolve => this.$refs.formRef.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        if (this.formData.id) {
          await WorkItemLabelApi.updateWorkItemLabel(this.formData)
          this.$message.success('更新成功')
        } else {
          await WorkItemLabelApi.createWorkItemLabel(this.formData)
          this.$message.success('创建成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = { name: '', color: '#409EFF' }
    }
  }
}
</script>
