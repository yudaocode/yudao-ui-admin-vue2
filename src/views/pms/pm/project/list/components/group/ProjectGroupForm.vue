<template>
  <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="520px" append-to-body>
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="92px">
      <el-form-item label="分组名称" prop="name">
        <el-input v-model.trim="formData.name" maxlength="20" placeholder="请输入分组名称" show-word-limit />
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>
<script>
import * as ProjectGroupApi from '@/api/pms/pm/project/group'

export default {
  name: 'PmsProjectGroupForm',
  data() {
    return {
      dialogVisible: false, dialogTitle: '', formLoading: false, formType: '', formData: { name: '' },
      formRules: { name: [
        { required: true, message: '分组名称不能为空', trigger: 'blur' },
        { max: 20, message: '分组名称不能超过 20 个字符', trigger: 'blur' }
      ] }
    }
  },
  methods: {
    async open(type, group) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      this.formData = group ? { ...group } : { name: '' }
      await this.$nextTick()
      if (this.$refs.formRef) this.$refs.formRef.clearValidate()
    },
    async submitForm() {
      if (!this.$refs.formRef) return
      const valid = await new Promise(resolve => this.$refs.formRef.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        if (this.formType === 'create') await ProjectGroupApi.createProjectGroup(this.formData)
        else await ProjectGroupApi.updateProjectGroup(this.formData)
        this.$message.success(this.formType === 'create' ? '新增成功' : '修改成功')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>
